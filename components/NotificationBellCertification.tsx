import React, { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { BellIcon, XMarkIcon } from "./icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    certificate_number?: string;
    rejection_reason?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

export const NotificationBellCertification: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load notifications
    loadNotifications();

    // Real-time subscription
    const subscription = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log("🔔 NEW NOTIFICATION:", payload);
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Error loading notifications:", error);
      return;
    }

    setNotifications((data as any) || []);
    setUnreadCount((data as any)?.filter((n: any) => !n.is_read).length || 0);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("❌ Error marking as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("❌ Error marking all as read:", error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "certificate_approved":
        return "🏆";
      case "certificate_rejected":
        return "❌";
      case "certificate_expiring":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <h3 className="text-white font-bold">Powiadomienia</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Brak powiadomień</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    notif.is_read
                      ? "bg-gray-800 hover:bg-gray-750"
                      : "bg-blue-900/20 hover:bg-blue-900/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {notif.title}
                      </h4>
                      <p className="text-white/70 text-xs mb-2 break-words">
                        {notif.message}
                      </p>

                      {/* Certificate Number */}
                      {notif.data.certificate_number && (
                        <code className="text-xs bg-yellow-900/30 text-yellow-200 px-2 py-1 rounded">
                          {notif.data.certificate_number}
                        </code>
                      )}

                      {/* Timestamp */}
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(notif.created_at).toLocaleString("pl-PL", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
