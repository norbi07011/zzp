// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  service: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_key: string;
  granted_by?: string;
  created_at: string;
}

export interface SettingsCategory {
  name: string;
  label: string;
  icon: string;
  settings_count: number;
}

// Settings
export async function fetchAllSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('category, key');

  if (error) throw error;
  return data as SystemSetting[];
}

export async function fetchSettingByKey(key: string) {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SystemSetting | null;
}

export async function fetchSettingsByCategory(category: string) {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('category', category)
    .order('key');

  if (error) throw error;
  return data as SystemSetting[];
}

export async function upsertSetting(setting: Partial<SystemSetting>) {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert([setting], { onConflict: 'key' })
    .select()
    .single();

  if (error) throw error;
  return data as SystemSetting;
}

export async function deleteSetting(id: string) {
  const { error } = await supabase
    .from('system_settings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkUpdateSettings(settings: Array<{ key: string; value: any }>) {
  const promises = settings.map(s => 
    upsertSetting({ key: s.key, value: s.value })
  );
  
  return await Promise.all(promises);
}

// API Keys
export async function fetchAllAPIKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('service');

  if (error) throw error;
  return data as APIKey[];
}

export async function createAPIKey(apiKey: Partial<APIKey>) {
  const { data, error } = await supabase
    .from('api_keys')
    .insert([apiKey])
    .select()
    .single();

  if (error) throw error;
  return data as APIKey;
}

export async function updateAPIKey(id: string, updates: Partial<APIKey>) {
  const { data, error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as APIKey;
}

export async function deleteAPIKey(id: string) {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleAPIKey(id: string, isActive: boolean) {
  return await updateAPIKey(id, { is_active: isActive });
}

// Permissions
export async function fetchUserPermissions(userId: string) {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as UserPermission[];
}

export async function grantPermission(userId: string, permissionKey: string, grantedBy: string) {
  const { data, error } = await supabase
    .from('user_permissions')
    .insert([{ user_id: userId, permission_key: permissionKey, granted_by: grantedBy }])
    .select()
    .single();

  if (error) throw error;
  return data as UserPermission;
}

export async function revokePermission(id: string) {
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Categories
export async function getSettingsCategories(): Promise<SettingsCategory[]> {
  const settings = await fetchAllSettings();
  
  const categories = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {
        name: setting.category,
        label: setting.category.charAt(0).toUpperCase() + setting.category.slice(1),
        icon: getCategoryIcon(setting.category),
        settings_count: 0
      };
    }
    acc[setting.category].settings_count++;
    return acc;
  }, {} as Record<string, SettingsCategory>);

  return Object.values(categories);
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    general: '⚙️',
    email: '📧',
    security: '🔒',
    payment: '💳',
    notifications: '🔔',
    api: '🔌',
    appearance: '🎨',
    seo: '🔍'
  };
  return icons[category] || '📋';
}

// Search
export async function searchSettings(query: string) {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .or(`key.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order('category, key');

  if (error) throw error;
  return data as SystemSetting[];
}
