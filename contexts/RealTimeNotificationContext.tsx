import React, { createContext, useState, useEffect, useContext } from 'react';
import { type Notification } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

// 🔔 **ENHANCED REAL-TIME NOTIFICATION CONTEXT**
// Enterprise-grade notification system with real-time capabilities using Supabase

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    addNotification: async () => {},
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
    clearAll: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // 🔄 **REAL-TIME SUPABASE CONNECTION**
    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setIsConnected(false);
            return;
        }

        const setupRealTime = async () => {
            try {
                // Load existing notifications from database
                const { data: dbNotifications, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Transform database format to app format
                const transformedNotifications: Notification[] = (dbNotifications || []).map(n => ({
                    id: n.id,
                    userId: parseInt(user.id),
                    type: (n.type === 'message' ? 'NEW_MESSAGE' : 
                           n.type === 'review' ? 'REVIEW_APPROVED' : 
                           'NEW_MESSAGE') as Notification['type'],
                    message: n.title ? `${n.title}: ${n.message}` : n.message,
                    timestamp: n.created_at || new Date().toISOString(),
                    isRead: (n as any).is_read || false, // Type assertion since database.types.ts not updated yet
                    link: n.link || undefined,
                }));

                setNotifications(transformedNotifications);
                setIsConnected(true);
                console.log(`🔔 Loaded ${transformedNotifications.length} notifications from database`);

                // Subscribe to real-time changes
                const channel = supabase
                    .channel(`notifications:${user.id}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    }, (payload) => {
                        console.log('🔔 New notification received:', payload.new);
                        const newNotification: Notification = {
                            id: payload.new.id,
                            userId: parseInt(user.id),
                            type: (payload.new.type === 'message' ? 'NEW_MESSAGE' : 
                                   payload.new.type === 'review' ? 'REVIEW_APPROVED' : 
                                   'NEW_MESSAGE') as Notification['type'],
                            message: payload.new.title ? `${payload.new.title}: ${payload.new.message}` : payload.new.message,
                            timestamp: payload.new.created_at || new Date().toISOString(),
                            isRead: (payload.new as any).is_read || false,
                            link: payload.new.link || undefined,
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                        showBrowserNotification(newNotification);
                    })
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    }, (payload) => {
                        console.log('🔔 Notification updated:', payload.new);
                        setNotifications(prev => 
                            prev.map(n => n.id === payload.new.id ? {
                                ...n,
                                isRead: (payload.new as any).is_read || false,
                            } : n)
                        );
                    })
                    .subscribe((status) => {
                        console.log('🔔 Subscription status:', status);
                        setIsConnected(status === 'SUBSCRIBED');
                    });

                return () => {
                    supabase.removeChannel(channel);
                };

            } catch (error) {
                console.error('Error setting up real-time notifications:', error);
                setIsConnected(false);
            }
        };

        setupRealTime();
    }, [user?.id]);

    // 🔔 **BROWSER NOTIFICATIONS**
    const showBrowserNotification = (notification: Notification) => {
        if ('Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(`New ${notification.type}`, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id,
                badge: '/favicon.ico',
            });
        }
    };

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && window.Notification.permission === 'default') {
            window.Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('🔔 Browser notifications enabled!');
                }
            });
        }
    }, []);

    // 📝 **NOTIFICATION ACTIONS**
    const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        if (!user?.id) return;

        try {
            // Insert notification into database (type assertion for is_read)
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    user_id: user.id,
                    type: notificationData.type === 'NEW_MESSAGE' ? 'message' : 
                          notificationData.type === 'REVIEW_APPROVED' ? 'review' : 'message',
                    title: notificationData.type,
                    message: notificationData.message,
                    link: notificationData.link || null,
                    is_read: false,
                } as any)
                .select()
                .single();

            if (error) {
                console.error('Error adding notification:', error);
                return;
            }

            console.log('🔔 Notification added to database:', data);
            // Real-time subscription will handle adding it to local state
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            // Update in database (type assertion since database.types.ts not updated yet)
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true } as any)
                .eq('id', id);

            if (error) {
                console.error('Error marking notification as read:', error);
                return;
            }

            // Update local state immediately for better UX
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;

        try {
            // Update all unread notifications in database (type assertion)
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true } as any)
                .eq('user_id', user.id)
                .eq('is_read', false as any);

            if (error) {
                console.error('Error marking all as read:', error);
                return;
            }

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            // Delete from database
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting notification:', error);
                return;
            }

            // Update local state
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAll = async () => {
        if (!user?.id) return;

        try {
            // Delete all notifications for user
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

            if (error) {
                console.error('Error clearing all notifications:', error);
                return;
            }

            // Update local state
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing all notifications:', error);
        }
    };

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isConnected,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};