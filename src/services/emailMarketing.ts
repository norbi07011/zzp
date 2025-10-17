// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  thumbnail_url?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  avg_open_rate: number;
  avg_click_rate: number;
}

// Fetch all campaigns
export async function fetchAllCampaigns() {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EmailCampaign[];
}

// Fetch campaign by ID
export async function fetchCampaignById(id: string) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as EmailCampaign;
}

// Create campaign
export async function createCampaign(campaign: Partial<EmailCampaign>) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data as EmailCampaign;
}

// Update campaign
export async function updateCampaign(id: string, updates: Partial<EmailCampaign>) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailCampaign;
}

// Delete campaign
export async function deleteCampaign(id: string) {
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Send campaign
export async function sendCampaign(id: string) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .update({ 
      status: 'sending',
      sent_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailCampaign;
}

// Fetch all templates
export async function fetchAllTemplates() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as EmailTemplate[];
}

// Create template
export async function createTemplate(template: Partial<EmailTemplate>) {
  const { data, error } = await supabase
    .from('email_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

// Get campaign stats
export async function getCampaignStats(): Promise<CampaignStats> {
  const { data: campaigns, error } = await supabase
    .from('email_campaigns')
    .select('*');

  if (error) throw error;

  const total = campaigns?.length || 0;
  const active = campaigns?.filter(c => c.status === 'sending' || c.status === 'scheduled').length || 0;
  const sent = campaigns?.filter(c => c.status === 'sent').length || 0;
  
  const totalOpened = campaigns?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0;
  const totalClicked = campaigns?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0;
  const totalRecipients = campaigns?.reduce((sum, c) => sum + (c.recipient_count || 0), 0) || 0;

  return {
    total_campaigns: total,
    active_campaigns: active,
    total_sent: sent,
    total_opened: totalOpened,
    total_clicked: totalClicked,
    avg_open_rate: totalRecipients > 0 ? (totalOpened / totalRecipients) * 100 : 0,
    avg_click_rate: totalRecipients > 0 ? (totalClicked / totalRecipients) * 100 : 0,
  };
}

// Search campaigns
export async function searchCampaigns(query: string) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EmailCampaign[];
}
