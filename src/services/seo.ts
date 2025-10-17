// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export interface MetaTag {
  id: string;
  page_url: string;
  title: string;
  description: string;
  keywords: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  created_at: string;
  updated_at: string;
}

export interface Redirect {
  id: string;
  from_url: string;
  to_url: string;
  status_code: number;
  is_active: boolean;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

export interface SitemapEntry {
  url: string;
  priority: number;
  changefreq: string;
  lastmod: string;
}

export interface SEOStats {
  total_pages: number;
  total_redirects: number;
  active_redirects: number;
  avg_title_length: number;
  avg_description_length: number;
}

// Meta Tags
export async function fetchAllMetaTags() {
  const { data, error } = await supabase
    .from('meta_tags')
    .select('*')
    .order('page_url');

  if (error) throw error;
  return data as MetaTag[];
}

export async function fetchMetaTagByUrl(url: string) {
  const { data, error } = await supabase
    .from('meta_tags')
    .select('*')
    .eq('page_url', url)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as MetaTag | null;
}

export async function upsertMetaTag(metaTag: Partial<MetaTag>) {
  const { data, error } = await supabase
    .from('meta_tags')
    .upsert([metaTag], { onConflict: 'page_url' })
    .select()
    .single();

  if (error) throw error;
  return data as MetaTag;
}

export async function deleteMetaTag(id: string) {
  const { error } = await supabase
    .from('meta_tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Redirects
export async function fetchAllRedirects() {
  const { data, error } = await supabase
    .from('redirects')
    .select('*')
    .order('from_url');

  if (error) throw error;
  return data as Redirect[];
}

export async function createRedirect(redirect: Partial<Redirect>) {
  const { data, error } = await supabase
    .from('redirects')
    .insert([{ ...redirect, hit_count: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data as Redirect;
}

export async function updateRedirect(id: string, updates: Partial<Redirect>) {
  const { data, error } = await supabase
    .from('redirects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Redirect;
}

export async function deleteRedirect(id: string) {
  const { error } = await supabase
    .from('redirects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementRedirectHit(fromUrl: string) {
  const { data, error } = await supabase
    .rpc('increment_redirect_hit', { url: fromUrl });

  if (error) throw error;
  return data;
}

// Sitemap
export async function generateSitemap(): Promise<SitemapEntry[]> {
  // Fetch all meta tags to build sitemap
  const { data, error } = await supabase
    .from('meta_tags')
    .select('page_url, updated_at');

  if (error) throw error;

  return (data || []).map(page => ({
    url: page.page_url,
    priority: page.page_url === '/' ? 1.0 : 0.8,
    changefreq: 'weekly',
    lastmod: page.updated_at
  }));
}

// SEO Stats
export async function getSEOStats(): Promise<SEOStats> {
  const [metaTags, redirects] = await Promise.all([
    fetchAllMetaTags(),
    fetchAllRedirects()
  ]);

  const avgTitleLength = metaTags.length > 0
    ? metaTags.reduce((sum, tag) => sum + tag.title.length, 0) / metaTags.length
    : 0;

  const avgDescLength = metaTags.length > 0
    ? metaTags.reduce((sum, tag) => sum + tag.description.length, 0) / metaTags.length
    : 0;

  return {
    total_pages: metaTags.length,
    total_redirects: redirects.length,
    active_redirects: redirects.filter(r => r.is_active).length,
    avg_title_length: Math.round(avgTitleLength),
    avg_description_length: Math.round(avgDescLength)
  };
}

// Search
export async function searchMetaTags(query: string) {
  const { data, error } = await supabase
    .from('meta_tags')
    .select('*')
    .or(`page_url.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('page_url');

  if (error) throw error;
  return data as MetaTag[];
}
