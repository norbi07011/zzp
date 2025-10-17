// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as emailService from '../services/emailMarketing';
import type { EmailCampaign, EmailTemplate, CampaignStats, CampaignStatus } from '../services/emailMarketing';

export function useEmailMarketing() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const draftCampaigns = campaigns.filter(c => c.status === 'draft');
  const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled');
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled');

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailService.fetchAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const data = await emailService.fetchAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await emailService.getCampaignStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
    }
  }, []);

  // Create campaign
  const createCampaign = useCallback(async (campaignData: Partial<EmailCampaign>) => {
    try {
      setError(null);
      const newCampaign = await emailService.createCampaign(campaignData);
      setCampaigns(prev => [newCampaign, ...prev]);
      await fetchStats();
      return newCampaign;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update campaign
  const updateCampaign = useCallback(async (id: string, updates: Partial<EmailCampaign>) => {
    try {
      setError(null);
      const updated = await emailService.updateCampaign(id, updates);
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Delete campaign
  const deleteCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Send campaign
  const sendCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      const sent = await emailService.sendCampaign(id);
      setCampaigns(prev => prev.map(c => c.id === id ? sent : c));
      await fetchStats();
      return sent;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Create template
  const createTemplate = useCallback(async (templateData: Partial<EmailTemplate>) => {
    try {
      setError(null);
      const newTemplate = await emailService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Search campaigns
  const searchCampaigns = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailService.searchCampaigns(query);
      setCampaigns(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchStats();
  }, [fetchCampaigns, fetchTemplates, fetchStats]);

  return {
    // State
    campaigns,
    templates,
    stats,
    loading,
    error,

    // Computed
    draftCampaigns,
    scheduledCampaigns,
    sentCampaigns,
    activeCampaigns,

    // Methods
    fetchCampaigns,
    fetchTemplates,
    fetchStats,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    createTemplate,
    searchCampaigns,
  };
}
