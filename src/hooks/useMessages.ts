// @ts-nocheck
/**
 * useMessages Hook
 * Custom hook for managing messages in admin panel
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllMessages,
  fetchUserMessages,
  fetchUnreadCount,
  markMessageAsRead,
  markMessagesAsRead,
  sendMessage,
  replyToMessage,
  deleteMessage,
  deleteMessages,
  getMessageStats,
  type Message,
  type MessageCategory,
  type MessagePriority,
} from '../services/messages';

export interface MessageStats {
  total: number;
  unread: number;
  byCategory: Record<MessageCategory, number>;
  byPriority: Record<MessagePriority, number>;
}

export const useMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    byCategory: { inquiry: 0, complaint: 0, support: 0, feedback: 0, other: 0 },
    byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
  });

  /**
   * Refresh messages from database
   */
  const refreshMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let messagesData: Message[];

      if (userId) {
        // Fetch messages for specific user
        messagesData = await fetchUserMessages(userId);
      } else {
        // Fetch all messages (admin view)
        messagesData = await fetchAllMessages();
      }

      setMessages(messagesData);

      // Fetch statistics
      const statsData = await getMessageStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing messages:', err);
      setError(err instanceof Error ? err.message : 'Błąd ładowania wiadomości');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await markMessageAsRead(messageId);
    
    if (success) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    }

    return success;
  }, []);

  /**
   * Mark multiple messages as read
   */
  const markMultipleAsRead = useCallback(async (messageIds: string[]): Promise<number> => {
    const count = await markMessagesAsRead(messageIds);
    
    if (count > 0) {
      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - count),
      }));
    }

    return count;
  }, []);

  /**
   * Send a new message
   */
  const send = useCallback(async (
    fromUserId: string,
    toUserId: string,
    subject: string,
    body: string,
    category: MessageCategory = 'other',
    priority: MessagePriority = 'normal',
    conversationId?: string,
    parentMessageId?: string
  ): Promise<Message | null> => {
    const newMessage = await sendMessage(
      fromUserId,
      toUserId,
      subject,
      body,
      category,
      priority,
      conversationId,
      parentMessageId
    );

    if (newMessage) {
      // Refresh messages to get updated list
      await refreshMessages();
    }

    return newMessage;
  }, [refreshMessages]);

  /**
   * Reply to a message
   */
  const reply = useCallback(async (
    messageId: string,
    fromUserId: string,
    body: string
  ): Promise<Message | null> => {
    const replyMessage = await replyToMessage(messageId, fromUserId, body);

    if (replyMessage) {
      await refreshMessages();
    }

    return replyMessage;
  }, [refreshMessages]);

  /**
   * Delete a message
   */
  const remove = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await deleteMessage(messageId);

    if (success) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    }

    return success;
  }, []);

  /**
   * Delete multiple messages
   */
  const removeMultiple = useCallback(async (messageIds: string[]): Promise<number> => {
    const count = await deleteMessages(messageIds);

    if (count > 0) {
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - count),
      }));
    }

    return count;
  }, []);

  /**
   * Get unread messages
   */
  const unreadMessages = messages.filter(msg => !msg.is_read);

  /**
   * Get messages by category
   */
  const getMessagesByCategory = useCallback((category: MessageCategory) => {
    return messages.filter(msg => msg.category === category);
  }, [messages]);

  /**
   * Get messages by priority
   */
  const getMessagesByPriority = useCallback((priority: MessagePriority) => {
    return messages.filter(msg => msg.priority === priority);
  }, [messages]);

  /**
   * Get urgent unread messages
   */
  const urgentUnreadMessages = messages.filter(
    msg => !msg.is_read && msg.priority === 'urgent'
  );

  // Initial load
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  return {
    // Data
    messages,
    unreadMessages,
    urgentUnreadMessages,
    stats,
    
    // State
    loading,
    error,
    
    // Actions
    refreshMessages,
    markAsRead,
    markMultipleAsRead,
    send,
    reply,
    remove,
    removeMultiple,
    
    // Helpers
    getMessagesByCategory,
    getMessagesByPriority,
  };
};
