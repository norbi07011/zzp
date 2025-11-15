// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as seoService from '../services/seo';
import type { MetaTag, Redirect, SitemapEntry, SEOStats } from '../services/seo';

export function useSEO() {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [sitemap, setSitemap] = useState<SitemapEntry[]>([]);
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const activeRedirects = redirects.filter(r => r.is_active);
  const inactiveRedirects = redirects.filter(r => !r.is_active);
  const totalRedirectHits = redirects.reduce((sum, r) => sum + r.hit_count, 0);

  // Fetch all meta tags
  const fetchMetaTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await seoService.fetchAllMetaTags();
      setMetaTags(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching meta tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all redirects
  const fetchRedirects = useCallback(async () => {
    try {
      const data = await seoService.fetchAllRedirects();
      setRedirects(data);
    } catch (err) {
      console.error('Error fetching redirects:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await seoService.getSEOStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching SEO stats:', err);
    }
  }, []);

  // Generate sitemap
  const generateSitemap = useCallback(async () => {
    try {
      const data = await seoService.generateSitemap();
      setSitemap(data);
      return data;
    } catch (err) {
      console.error('Error generating sitemap:', err);
      throw err;
    }
  }, []);

  // Upsert meta tag
  const upsertMetaTag = useCallback(async (metaTag: Partial<MetaTag>) => {
    try {
      setError(null);
      const upserted = await seoService.upsertMetaTag(metaTag);
      setMetaTags(prev => {
        const existing = prev.find(m => m.page_url === upserted.page_url);
        if (existing) {
          return prev.map(m => m.page_url === upserted.page_url ? upserted : m);
        }
        return [upserted, ...prev];
      });
      await fetchStats();
      return upserted;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Delete meta tag
  const deleteMetaTag = useCallback(async (id: string) => {
    try {
      setError(null);
      await seoService.deleteMetaTag(id);
      setMetaTags(prev => prev.filter(m => m.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Create redirect
  const createRedirect = useCallback(async (redirectData: Partial<Redirect>) => {
    try {
      setError(null);
      const newRedirect = await seoService.createRedirect(redirectData);
      setRedirects(prev => [newRedirect, ...prev]);
      await fetchStats();
      return newRedirect;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update redirect
  const updateRedirect = useCallback(async (id: string, updates: Partial<Redirect>) => {
    try {
      setError(null);
      const updated = await seoService.updateRedirect(id, updates);
      setRedirects(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete redirect
  const deleteRedirect = useCallback(async (id: string) => {
    try {
      setError(null);
      await seoService.deleteRedirect(id);
      setRedirects(prev => prev.filter(r => r.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Search meta tags
  const searchMetaTags = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await seoService.searchMetaTags(query);
      setMetaTags(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching meta tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMetaTags();
    fetchRedirects();
    fetchStats();
    generateSitemap();
  }, [fetchMetaTags, fetchRedirects, fetchStats, generateSitemap]);

  return {
    // State
    metaTags,
    redirects,
    sitemap,
    stats,
    loading,
    error,

    // Computed
    activeRedirects,
    inactiveRedirects,
    totalRedirectHits,

    // Methods
    fetchMetaTags,
    fetchRedirects,
    fetchStats,
    generateSitemap,
    upsertMetaTag,
    deleteMetaTag,
    createRedirect,
    updateRedirect,
    deleteRedirect,
    searchMetaTags,
  };
}
