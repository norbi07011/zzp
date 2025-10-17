// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as settingsService from '../services/settings';
import type { SystemSetting, APIKey, UserPermission, SettingsCategory } from '../services/settings';

export function useSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [categories, setCategories] = useState<SettingsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const publicSettings = settings.filter(s => s.is_public);
  const privateSettings = settings.filter(s => !s.is_public);
  const activeApiKeys = apiKeys.filter(k => k.is_active);
  const inactiveApiKeys = apiKeys.filter(k => !k.is_active);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.fetchAllSettings();
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings by category
  const fetchSettingsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.fetchSettingsByCategory(category);
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching settings by category:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      const data = await settingsService.fetchAllAPIKeys();
      setApiKeys(data);
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await settingsService.getSettingsCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Upsert setting
  const upsertSetting = useCallback(async (settingData: Partial<SystemSetting>) => {
    try {
      setError(null);
      const upserted = await settingsService.upsertSetting(settingData);
      setSettings(prev => {
        const existing = prev.find(s => s.key === upserted.key);
        if (existing) {
          return prev.map(s => s.key === upserted.key ? upserted : s);
        }
        return [upserted, ...prev];
      });
      return upserted;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete setting
  const deleteSetting = useCallback(async (id: string) => {
    try {
      setError(null);
      await settingsService.deleteSetting(id);
      setSettings(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Bulk update settings
  const bulkUpdateSettings = useCallback(async (settingsData: Array<{ key: string; value: any }>) => {
    try {
      setError(null);
      await settingsService.bulkUpdateSettings(settingsData);
      await fetchSettings();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchSettings]);

  // Create API key
  const createApiKey = useCallback(async (apiKeyData: Partial<APIKey>) => {
    try {
      setError(null);
      const newKey = await settingsService.createAPIKey(apiKeyData);
      setApiKeys(prev => [newKey, ...prev]);
      return newKey;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Update API key
  const updateApiKey = useCallback(async (id: string, updates: Partial<APIKey>) => {
    try {
      setError(null);
      const updated = await settingsService.updateAPIKey(id, updates);
      setApiKeys(prev => prev.map(k => k.id === id ? updated : k));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete API key
  const deleteApiKey = useCallback(async (id: string) => {
    try {
      setError(null);
      await settingsService.deleteAPIKey(id);
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Toggle API key
  const toggleApiKey = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const updated = await settingsService.toggleAPIKey(id, isActive);
      setApiKeys(prev => prev.map(k => k.id === id ? updated : k));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Search settings
  const searchSettings = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.searchSettings(query);
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
    fetchCategories();
  }, [fetchSettings, fetchApiKeys, fetchCategories]);

  return {
    // State
    settings,
    apiKeys,
    categories,
    loading,
    error,

    // Computed
    publicSettings,
    privateSettings,
    activeApiKeys,
    inactiveApiKeys,

    // Methods
    fetchSettings,
    fetchSettingsByCategory,
    fetchApiKeys,
    fetchCategories,
    upsertSetting,
    deleteSetting,
    bulkUpdateSettings,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    toggleApiKey,
    searchSettings,
  };
}
