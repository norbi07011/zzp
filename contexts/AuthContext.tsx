import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type UserRole = 'admin' | 'employer' | 'worker';

export interface Subscription {
  planId: 'worker-basic' | 'worker-plus' | 'client-basic' | 'client-pro';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
  id: string;
  email: string;
  name: string; // Added missing name property
  fullName: string;
  role: UserRole;
  companyName?: string; // For employers
  certificateId?: string; // For workers
  avatar_url?: string;
  created_at?: string;
  subscription?: Subscription; // Added subscription property
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  metadata?: {
    specialization?: string;
    hourlyRate?: number | null;
    yearsOfExperience?: number;
    city?: string;
    skills?: string[];
    subscribeNewsletter?: boolean;
    // NEW: Team & On-Demand fields
    workerType?: 'individual' | 'team_leader' | 'duo_partner' | 'helper_available';
    teamSize?: number;
    teamDescription?: string;
    teamHourlyRate?: number | null;
    isOnDemandAvailable?: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapping Supabase user to app user with timeout protection
const mapSupabaseUserToAppUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('User mapping timeout')), 10000) // 10 second timeout
  );

  try {
    return await Promise.race([
      mapUserDataWithRetry(supabaseUser),
      timeoutPromise
    ]);
  } catch (error) {
    console.error('Error mapping user (with fallback):', error);
    // Always return fallback user data to not block login
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.fullName || 'User',
      fullName: supabaseUser.user_metadata?.fullName || 'User',
      role: (supabaseUser.user_metadata?.role as UserRole) || 'worker',
    };
  }
};

const mapUserDataWithRetry = async (supabaseUser: SupabaseUser): Promise<User> => {
  try {
    // Get user profile from database with explicit typing
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic user data from auth metadata
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.fullName || 'User',
        fullName: supabaseUser.user_metadata?.fullName || 'User',
        role: (supabaseUser.user_metadata?.role as UserRole) || 'worker',
      };
    }

    // Type the profile explicitly
    const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

    // Get additional role-specific data
    let companyName: string | undefined;
    let certificateId: string | undefined;
    let subscription: Subscription | undefined;

    if (typedProfile.role === 'employer') {
      // WHY: maybeSingle instead of single - employer record may not exist yet (new registration)
      const { data: employer } = await supabase
        .from('employers')
        .select('company_name, subscription_tier, subscription_status')
        .eq('profile_id', typedProfile.id)
        .maybeSingle();  // ← FIXED: returns null if no row, doesn't throw 406
      
      // Using any to bypass type check for potentially new fields
      const employerData = employer as any;
      companyName = employerData?.company_name;
      
      console.log('[SUBS-GUARD] Employer data:', { 
        has_record: !!employer, 
        subscription_tier: employerData?.subscription_tier,
        subscription_status: employerData?.subscription_status 
      });
      
      // Map employer subscription
      if (employerData?.subscription_tier && employerData.subscription_status === 'active') {
        subscription = {
          planId: employerData.subscription_tier === 'basic' ? 'client-basic' : 'client-pro',
          status: 'ACTIVE'
        };
      } else {
        console.log('[SUBS-GUARD] No active subscription for employer');
      }
    }

    if (typedProfile.role === 'worker') {
      try {
        const { data: certificates } = await supabase
          .from('certificates')
          .select('certificate_number')
          .eq('worker_id', typedProfile.id)
          .limit(1);
        const typedCertificates = certificates as Database['public']['Tables']['certificates']['Row'][] | null;
        certificateId = typedCertificates?.[0]?.certificate_number || undefined;
        
        // Fetch worker subscription data from workers table
        let { data: workerProfile, error: workerError } = await supabase
          .from('workers')
          .select('subscription_tier, subscription_status')
          .eq('profile_id', typedProfile.id)
          .single();
        
        // If worker record doesn't exist, create it with defaults
        if (workerError && workerError.code === 'PGRST116') {
          console.log('🔧 Worker record not found, creating default...');
          
          const { data: newWorker, error: createError } = await supabase
            .from('workers')
            .insert({
              profile_id: typedProfile.id,
              kvk_number: '',
              specialization: '',
              hourly_rate: 0,
              years_experience: 0,
              location_city: '',
              radius_km: 25,
              skills: [],
              certifications: [],
              rating: 0,
              rating_count: 0,
              verified: false,
              subscription_tier: 'basic',
              subscription_status: 'active',
            } as any)
            .select('subscription_tier, subscription_status')
            .single();
          
          if (!createError && newWorker) {
            console.log('✅ Worker record created successfully');
            workerProfile = newWorker;
          } else {
            console.error('❌ Failed to create worker record:', createError);
          }
        }
        
        // Map worker subscription (using any to bypass type check for new table)
        const workerData = workerProfile as any;
        if (workerData?.subscription_tier && workerData.subscription_status === 'active') {
          subscription = {
            planId: workerData.subscription_tier === 'basic' ? 'worker-basic' : 'worker-plus',
            status: 'ACTIVE'
          };
        }
      } catch (workerError) {
        console.warn('⚠️ Could not fetch worker subscription data:', workerError);
        // Continue without subscription data - don't block login
      }
    }

    return {
      id: typedProfile.id,
      email: typedProfile.email,
      name: typedProfile.full_name || 'User',
      fullName: typedProfile.full_name || 'User',
      role: (typedProfile.role as UserRole) || 'worker',
      companyName,
      certificateId,
      subscription,
      created_at: typedProfile.created_at || undefined,
    };
  } catch (error) {
    console.error('Error mapping user:', error);
    // Fallback to basic user data
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.fullName || 'User',
      fullName: supabaseUser.user_metadata?.fullName || 'User',
      role: (supabaseUser.user_metadata?.role as UserRole) || 'worker',
    };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WHY: Initialize auth state from Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // WHY: get existing Supabase session (if user is already logged in)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // WHY: Removed Promise.race/timeout - let DB queries complete naturally
          try {
            const appUser = await mapSupabaseUserToAppUser(session.user);
            console.log('[SUBS-GUARD] User mapped successfully:', { role: appUser.role, has_subscription: !!appUser.subscription });
            setUser(appUser);
          } catch (mapError) {
            console.error('[SUBS-GUARD] Error mapping user:', mapError);
            // Fallback to basic user data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.fullName || 'User',
              fullName: session.user.user_metadata?.fullName || 'User',
              role: (session.user.user_metadata?.role as UserRole) || 'worker',
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // WHY: subscribe to Supabase auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!session) {
            setUser(null);
            setIsLoading(false);
            return;
          }
          // WHY: Removed Promise.race/timeout - await naturally without artificial timeout
          const appUser = await mapSupabaseUserToAppUser(session.user);
          console.log('[SUBS-GUARD] Auth state changed, user mapped:', { role: appUser.role, has_subscription: !!appUser.subscription });
          setUser(appUser);
        } catch (mapError) {
          console.error('[SUBS-GUARD] Error mapping user on auth change:', mapError);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // WHY: rely on real Supabase session only - signInWithPassword returns session + user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      // WHY: throw error immediately if Supabase Auth fails
      if (error) {
        throw new Error(error.message);
      }

      // WHY: verify we received user data from Supabase (not just session)
      if (!data.user) {
        throw new Error('Login failed - no user data received');
      }

      // WHY: map Supabase user to app user with role and subscription data
      const appUser = await mapSupabaseUserToAppUser(data.user);
      setUser(appUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Nieprawidłowy email lub hasło'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    
    try {
      // 1. Create user account in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        options: {
          data: {
            fullName: userData.fullName,
            role: userData.role,
            companyName: userData.companyName,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user data received');
      }

      // 2. Create profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: userData.email.trim().toLowerCase(),
          full_name: userData.fullName,
          role: userData.role,
        } as any);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here - user is created in auth, just profile creation failed
      }

      // 3. If worker, create worker profile with metadata
      if (userData.role === 'worker' && userData.metadata) {
        const { error: workerProfileError } = await supabase
          .from('workers')
          .insert({
            profile_id: data.user.id,
            specialization: userData.metadata.specialization || '',
            hourly_rate: userData.metadata.hourlyRate || null,
            years_experience: userData.metadata.yearsOfExperience || 0,
            location_city: userData.metadata.city || '',
            // NEW: Team & On-Demand fields
            worker_type: userData.metadata.workerType || 'individual',
            team_size: userData.metadata.teamSize || 1,
            team_description: userData.metadata.teamDescription || null,
            team_hourly_rate: userData.metadata.teamHourlyRate || null,
            is_on_demand_available: userData.metadata.isOnDemandAvailable || false,
            is_available_now: false, // Default OFF until worker toggles it
            // Subscription defaults
            subscription_tier: 'basic', // Free tier by default
            subscription_status: 'active',
          } as any);

        if (workerProfileError) {
          console.error('Error creating worker profile:', workerProfileError);
          // Don't throw - user is created, just profile creation failed
        }
      }

      // 🔥 FIX: If employer, create employer profile with company data
      if (userData.role === 'employer') {
        console.log('[EMPLOYER-REG] Creating employer record for:', userData.email);
        
        const { error: employerProfileError } = await supabase
          .from('employers')
          .insert({
            profile_id: data.user.id,
            company_name: userData.companyName || 'Nieznana firma',
            kvk_number: '', // Can be added later in profile
            industry: 'other',
            location_city: '',
            phone: userData.phone || '',
            email: userData.email,
            // CRITICAL: Set subscription to INACTIVE until payment
            subscription_tier: 'basic', // Default tier
            subscription_status: 'inactive', // ← INACTIVE until payment!
            verified: false,
          } as any);

        if (employerProfileError) {
          console.error('[EMPLOYER-REG] ❌ Error creating employer profile:', employerProfileError);
          // Don't throw - user is created in auth, just profile creation failed
          // They can complete profile later
        } else {
          console.log('[EMPLOYER-REG] ✅ Employer record created successfully');
        }
      }

      // If auto-confirm is enabled, user will be logged in automatically
      if (data.session?.user) {
        const appUser = await mapSupabaseUserToAppUser(data.session.user);
        setUser(appUser);
      }

    } catch (error) {
      console.error('Registration failed:', error);
      throw error instanceof Error ? error : new Error('Rejestracja nie powiodła się');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // WHY: always clear Supabase session to prevent stale auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // WHY: clear local user state immediately
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token refresh failed:', error);
        await logout();
        return;
      }

      if (data.session?.user) {
        const appUser = await mapSupabaseUserToAppUser(data.session.user);
        setUser(appUser);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error instanceof Error ? error : new Error('Resetowanie hasła nie powiodło się');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to get auth token for API calls
export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};
