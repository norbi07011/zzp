import { createClient } from '@supabase/supabase-js';

// Regular client for authenticated operations (read-only)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'zzp-werkplaats-auth',
  }
});

// Service client for INSERT operations (bypasses RLS)
// This is a temporary workaround until RLS policies are fixed
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to verify user can create posts
export const canUserCreatePosts = async (userId: string, userType: 'employer' | 'accountant'): Promise<boolean> => {
  if (userType === 'employer') {
    const { data, error } = await supabase
      .from('employers')
      .select('id')
      .eq('profile_id', userId)
      .single();
    return !error && !!data;
  } else if (userType === 'accountant') {
    const { data, error } = await supabase
      .from('accountants')
      .select('id')
      .eq('profile_id', userId)
      .single();
    return !error && !!data;
  }
  return false;
};