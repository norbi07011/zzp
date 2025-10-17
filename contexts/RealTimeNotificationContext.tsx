import React, { createContext, useState, useEffect, useContext } from 'react';
import { type Notification } from '../types';
import { useAuth } from './AuthContext';

// 🔔 **ENHANCED REAL-TIME NOTIFICATION CONTEXT**
// Enterprise-grade notification system with real-time capabilities

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

    // 🔄 **REAL-TIME CONNECTION SIMULATION**
    useEffect(() => {
        if (!user?.id) return;

        const setupRealTime = async () => {
            try {
                // Load existing notifications from localStorage
                const allNotifications: Notification[] = JSON.parse(localStorage.getItem('zzp-notifications') || '[]');
                const userNotifications = allNotifications
                    .filter(n => n.userId === parseInt(user.id))
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNotifications(userNotifications);

                // Simulate real-time connection
                setIsConnected(true);
                console.log('🔔 Real-time notification system connected!');

                // TODO: Add Supabase real-time subscription when database is ready
                /*
                const channel = supabase
                    .channel(`notifications:${user.id}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `userId=eq.${user.id}`,
                    }, (payload) => {
                        const newNotification = payload.new as Notification;
                        setNotifications(prev => [newNotification, ...prev]);
                        showBrowserNotification(newNotification);
                    })
                    .subscribe();
                */

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

        const newNotification: Notification = {
            ...notificationData,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            userId: parseInt(user.id),
        };

        // Save to localStorage
        const allNotifications: Notification[] = JSON.parse(localStorage.getItem('zzp-notifications') || '[]');
        const updatedAllNotifications = [newNotification, ...allNotifications];
        localStorage.setItem('zzp-notifications', JSON.stringify(updatedAllNotifications));

        // Update local state
        setNotifications(prev => [newNotification, ...prev]);

        // Show browser notification
        showBrowserNotification(newNotification);

        console.log('🔔 Notification added:', newNotification.type, '-', newNotification.message);
    };

    const markAsRead = async (id: string) => {
        const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
        );
        await saveNotifications(updatedNotifications);
    };

    const markAllAsRead = async () => {
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        await saveNotifications(updatedNotifications);
    };

    const deleteNotification = async (id: string) => {
        const updatedNotifications = notifications.filter(n => n.id !== id);
        await saveNotifications(updatedNotifications);
    };

    const clearAll = async () => {
        await saveNotifications([]);
    };

    const saveNotifications = async (updatedNotifications: Notification[]) => {
        if (!user?.id) return;

        // Update localStorage
        const allNotifications: Notification[] = JSON.parse(localStorage.getItem('zzp-notifications') || '[]');
        const otherUserNotifications = allNotifications.filter(n => n.userId !== parseInt(user.id));
        const newTotalNotifications = [...otherUserNotifications, ...updatedNotifications];
        localStorage.setItem('zzp-notifications', JSON.stringify(newTotalNotifications));
        
        // Update local state
        setNotifications(updatedNotifications);
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