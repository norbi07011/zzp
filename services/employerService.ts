/**
 * =====================================================
 * EMPLOYER SERVICE - Backend Integration
 * =====================================================
 * Service for managing employer data and dashboard
 * Created: 2025-01-13
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// =====================================================
// TYPES - Database-generated types
// =====================================================

// WHY: use database-generated types for employers table to prevent type mismatches
type EmployersRow = Database['public']['Tables']['employers']['Row'];
type EmployersUpdate = Database['public']['Tables']['employers']['Update'];

// WHY: extend Row type with subscription fields (these columns exist in DB but not yet in generated types)
// TODO: regenerate database.types.ts after schema is stable
export interface EmployerProfile extends EmployersRow {
  subscription_tier?: string | null;
  subscription_status?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
}

// WHY: these tables (employer_stats, employer_search_history, employer_saved_workers, messages) 
// are not yet in database.types.ts - keep manual interfaces until types are regenerated
export interface EmployerStats {
  total_searches: number;
  searches_this_month: number;
  total_saved_workers: number;
  total_contacts: number;
  contacts_this_month: number;
  subscription_expires_at: string | null;
  days_until_expiry: number;
}

export interface SearchHistoryItem {
  id: string;
  search_date: string;
  category: string;
  level: string | null;
  location_city: string | null;
  results_count: number;
}

export interface SavedWorker {
  id: string;
  worker_id: string;
  saved_at: string;
  notes: string | null;
  tags: string[];
  // Joined worker data
  worker: {
    id: string;
    specialization: string;
    hourly_rate: number;
    rating: number;
    rating_count: number;
    location_city: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
    };
  };
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

// =====================================================
// EMPLOYER PROFILE
// =====================================================

/**
 * Get employer profile by user ID
 */
export async function getEmployerByUserId(userId: string): Promise<EmployerProfile | null> {
  try {
    // WHY: .maybeSingle() instead of .single() to prevent 406 when no employer record exists
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) throw error;
    console.log('[SUBS-GUARD] getEmployerByUserId:', { userId, has_data: !!data });
    return data;
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return null;
  }
}

/**
 * Update employer profile
 */
export async function updateEmployerProfile(
  employerId: string,
  updates: EmployersUpdate // WHY: use database Update type to prevent unknown properties
): Promise<boolean> {
  try {
    // WHY: cast to any because TS can't infer table type from string literal
    const { error } = await (supabase
      .from('employers') as any)
      .update(updates)
      .eq('id', employerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating employer profile:', error);
    return false;
  }
}

// =====================================================
// EMPLOYER STATS
// =====================================================

/**
 * Get employer dashboard statistics
 */
export async function getEmployerStats(employerId: string): Promise<EmployerStats | null> {
  try {
    // WHY: .maybeSingle() instead of .single() - no error if stats don't exist yet
    const { data: stats, error: statsError } = await supabase
      .from('employer_stats')
      .select('*')
      .eq('employer_id', employerId)
      .maybeSingle();

    if (statsError) {
      throw statsError;
    }

    // If no stats exist, initialize them
    if (!stats) {
      // WHY: cast RPC to any because function signatures not in database.types.ts
      await (supabase.rpc as any)('update_employer_stats', { p_employer_id: employerId });
      
      // Fetch again
      // WHY: cast to any - employer_stats table not in database.types.ts
      const { data: newStats } = await (supabase
        .from('employer_stats') as any)
        .select('*')
        .eq('employer_id', employerId)
        .maybeSingle();
      
      if (newStats) {
        return formatStats(newStats);
      }
    }

    return stats ? formatStats(stats) : getDefaultStats();
  } catch (error) {
    console.error('Error fetching employer stats:', error);
    return getDefaultStats();
  }
}

function formatStats(stats: any): EmployerStats {
  const daysUntilExpiry = stats.subscription_expires_at
    ? Math.ceil((new Date(stats.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    total_searches: stats.total_searches || 0,
    searches_this_month: stats.searches_this_month || 0,
    total_saved_workers: stats.total_saved_workers || 0,
    total_contacts: stats.total_contacts || 0,
    contacts_this_month: stats.contacts_this_month || 0,
    subscription_expires_at: stats.subscription_expires_at,
    days_until_expiry: daysUntilExpiry,
  };
}

function getDefaultStats(): EmployerStats {
  return {
    total_searches: 0,
    searches_this_month: 0,
    total_saved_workers: 0,
    total_contacts: 0,
    contacts_this_month: 0,
    subscription_expires_at: null,
    days_until_expiry: 0,
  };
}

// =====================================================
// SEARCH HISTORY
// =====================================================

/**
 * Get employer's search history
 */
export async function getSearchHistory(
  employerId: string,
  limit: number = 10
): Promise<SearchHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('employer_search_history')
      .select('id, search_date, category, level, location_city, results_count')
      .eq('employer_id', employerId)
      .order('search_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
}

/**
 * Add search to history
 */
export async function addSearchToHistory(
  employerId: string,
  searchParams: {
    category: string;
    level?: string;
    location_city?: string;
    radius_km?: number;
    min_hourly_rate?: number;
    max_hourly_rate?: number;
    skills?: string[];
    results_count: number;
  }
): Promise<boolean> {
  try {
    // WHY: cast to any - employer_search_history table not in database.types.ts
    const { error } = await (supabase
      .from('employer_search_history') as any)
      .insert({
        employer_id: employerId,
        ...searchParams,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding search to history:', error);
    return false;
  }
}

/**
 * Delete search from history
 */
export async function deleteSearchFromHistory(searchId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employer_search_history')
      .delete()
      .eq('id', searchId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting search from history:', error);
    return false;
  }
}

// =====================================================
// SAVED WORKERS
// =====================================================

/**
 * Get employer's saved workers
 */
export async function getSavedWorkers(employerId: string): Promise<SavedWorker[]> {
  try {
    const { data, error } = await supabase
      .from('employer_saved_workers')
      .select(`
        id,
        worker_id,
        saved_at,
        notes,
        tags,
        worker:workers!inner(
          id,
          specialization,
          hourly_rate,
          rating,
          rating_count,
          location_city,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        )
      `)
      .eq('employer_id', employerId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching saved workers:', error);
    return [];
  }
}

/**
 * Save/bookmark a worker
 */
export async function saveWorker(
  employerId: string,
  workerId: string,
  notes?: string,
  tags?: string[]
): Promise<boolean> {
  try {
    // WHY: cast to any - employer_saved_workers table not in database.types.ts
    const { error } = await (supabase
      .from('employer_saved_workers') as any)
      .insert({
        employer_id: employerId,
        worker_id: workerId,
        notes: notes || null,
        tags: tags || [],
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving worker:', error);
    return false;
  }
}

/**
 * Remove saved worker
 */
export async function removeSavedWorker(savedWorkerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employer_saved_workers')
      .delete()
      .eq('id', savedWorkerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing saved worker:', error);
    return false;
  }
}

/**
 * Check if worker is saved
 */
export async function isWorkerSaved(
  employerId: string,
  workerId: string
): Promise<boolean> {
  try {
    // WHY: .maybeSingle() instead of .single() - returns null if worker not saved
    const { data, error } = await supabase
      .from('employer_saved_workers')
      .select('id')
      .eq('employer_id', employerId)
      .eq('worker_id', workerId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if worker is saved:', error);
    return false;
  }
}

// =====================================================
// MESSAGES
// =====================================================

/**
 * Get employer's messages
 */
export async function getMessages(
  userId: string,
  limit: number = 10,
  unreadOnly: boolean = false
): Promise<Message[]> {
  try {
    let query = supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        subject,
        content,
        read,
        created_at,
        sender_profile:profiles!sender_id(
          full_name,
          avatar_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return 0;
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    // WHY: cast to any - messages table not in database.types.ts
    const { error } = await (supabase
      .from('messages') as any)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

/**
 * Send message
 */
export async function sendMessage(
  senderId: string,
  recipientId: string,
  subject: string,
  content: string
): Promise<boolean> {
  try {
    // WHY: cast to any - messages table not in database.types.ts
    const { error } = await (supabase
      .from('messages') as any)
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        content,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

const employerService = {
  // Profile
  getEmployerByUserId,
  updateEmployerProfile,
  
  // Stats
  getEmployerStats,
  
  // Search History
  getSearchHistory,
  addSearchToHistory,
  deleteSearchFromHistory,
  
  // Saved Workers
  getSavedWorkers,
  saveWorker,
  removeSavedWorker,
  isWorkerSaved,
  
  // Messages
  getMessages,
  getUnreadMessageCount,
  markMessageAsRead,
  sendMessage,
};

export default employerService;
