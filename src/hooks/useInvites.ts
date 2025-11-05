import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ✅ Hook do zarządzania zaproszeniami do projektów
 * 
 * FUNKCJONALNOŚĆ:
 * - Liczy pending invites dla zalogowanego użytkownika
 * - Realtime subscription - auto-refresh gdy zmieni się status
 * - Używany w nawigacji (badge z liczbą zaproszeń)
 */
export const useInvites = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    const fetchPendingInvites = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await (supabase as any)
          .from('project_invites')
          .select('id')
          .eq('invitee_profile_id', user.id)
          .eq('status', 'pending');

        if (error) {
          console.error('Error fetching invites count:', error);
          setPendingCount(0);
        } else {
          setPendingCount(data?.length || 0);
        }
      } catch (err) {
        console.error('useInvites error:', err);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingInvites();

    // Realtime subscription dla nowych zaproszeń
    const subscription = supabase
      .channel(`invites-user-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_invites',
          filter: `invitee_profile_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('📬 Invite change detected:', payload);
          fetchPendingInvites();  // Refresh count
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return { pendingCount, loading };
};
