import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

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
          .from("project_invites")
          .select("id")
          .eq("invitee_id", user.id)
          .eq("status", "pending");

        if (error) {
          // Łagodna obsługa błędów - nie crashuj aplikacji
          console.error("[useInvites] Error fetching invites:", error.message);

          // Jeśli to błąd RLS/permissions - nie pokazuj error toast
          if (error.code === "42P17") {
            console.warn(
              "[useInvites] RLS infinite recursion detected - skipping invites"
            );
          } else if (error.code === "42501" || error.code === "PGRST301") {
            console.warn(
              "[useInvites] Permission denied - user may not have access"
            );
          } else if (error.message?.includes("JWT")) {
            console.warn("[useInvites] Auth error - user may need to re-login");
          }

          setPendingCount(0);
        } else {
          setPendingCount(data?.length || 0);
        }
      } catch (err) {
        console.error("[useInvites] Unexpected error:", err);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingInvites();

    // Realtime subscription dla nowych zaproszeń
    const subscription = supabase
      .channel(`invites-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_invites",
          filter: `invitee_id=eq.${user.id}`, // FIXED: było invitee_profile_id
        },
        (payload) => {
          console.log("📬 Invite change detected:", payload);
          fetchPendingInvites(); // Refresh count
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return { pendingCount, loading };
};
