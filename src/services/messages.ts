// @ts-nocheck
/**
 * Messages Service Layer
 * Handles all message and conversation operations with Supabase
 * 
 * REQUIRED DATABASE SCHEMA (run this SQL first):
 * 
 * -- Messages table
 * CREATE TABLE messages (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   from_user_id UUID REFERENCES auth.users(id),
 *   to_user_id UUID REFERENCES auth.users(id),
 *   subject TEXT NOT NULL,
 *   body TEXT NOT NULL,
 *   sent_at TIMESTAMPTZ DEFAULT NOW(),
 *   is_read BOOLEAN DEFAULT FALSE,
 *   category TEXT CHECK (category IN ('inquiry', 'complaint', 'support', 'feedback', 'other')),
 *   priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
 *   conversation_id UUID,
 *   parent_message_id UUID REFERENCES messages(id),
 *   attachments TEXT[],
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Conversations table
 * CREATE TABLE conversations (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   participants UUID[] NOT NULL,
 *   subject TEXT,
 *   last_message TEXT,
 *   last_message_at TIMESTAMPTZ,
 *   message_count INT DEFAULT 0,
 *   is_active BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { supabase } from '@/lib/supabase';

// Type definitions
export type MessageCategory = 'inquiry' | 'complaint' | 'support' | 'feedback' | 'other';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string;
  body: string;
  sent_at: string;
  is_read: boolean;
  category: MessageCategory;
  priority: MessagePriority;
  conversation_id?: string;
  parent_message_id?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  from_user?: {
    id: string;
    profile: {
      full_name: string;
      email: string;
      role: string;
    };
  };
  to_user?: {
    id: string;
    profile: {
      full_name: string;
      email: string;
      role: string;
    };
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  subject?: string;
  last_message?: string;
  last_message_at?: string;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all messages with user profile data
 */
export const fetchAllMessages = async (): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:from_user_id(
          id,
          profile:profiles(full_name, email, role)
        ),
        to_user:to_user_id(
          id,
          profile:profiles(full_name, email, role)
        )
      `)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('fetchAllMessages error:', error);
    return [];
  }
};

/**
 * Fetch messages for a specific user (inbox)
 */
export const fetchUserMessages = async (userId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:from_user_id(
          id,
          profile:profiles(full_name, email, role)
        ),
        to_user:to_user_id(
          id,
          profile:profiles(full_name, email, role)
        )
      `)
      .eq('to_user_id', userId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('fetchUserMessages error:', error);
    return [];
  }
};

/**
 * Fetch unread messages count
 */
export const fetchUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('fetchUnreadCount error:', error);
    return 0;
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('markMessageAsRead error:', error);
    return false;
  }
};

/**
 * Mark multiple messages as read
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<number> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .in('id', messageIds);

    if (error) {
      console.error('Error marking messages as read:', error);
      return 0;
    }

    return messageIds.length;
  } catch (error) {
    console.error('markMessagesAsRead error:', error);
    return 0;
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (
  fromUserId: string,
  toUserId: string,
  subject: string,
  body: string,
  category: MessageCategory = 'other',
  priority: MessagePriority = 'normal',
  conversationId?: string,
  parentMessageId?: string
): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        subject,
        body,
        category,
        priority,
        conversation_id: conversationId,
        parent_message_id: parentMessageId,
        sent_at: new Date().toISOString(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update conversation if exists
    if (conversationId) {
      await updateConversationLastMessage(conversationId, body);
    }

    return data;
  } catch (error) {
    console.error('sendMessage error:', error);
    return null;
  }
};

/**
 * Reply to a message
 */
export const replyToMessage = async (
  messageId: string,
  fromUserId: string,
  body: string
): Promise<Message | null> => {
  try {
    // First fetch the original message
    const { data: originalMessage, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !originalMessage) {
      console.error('Error fetching original message:', fetchError);
      return null;
    }

    // Send reply
    return await sendMessage(
      fromUserId,
      originalMessage.from_user_id, // Reply to sender
      `Re: ${originalMessage.subject}`,
      body,
      originalMessage.category,
      originalMessage.priority,
      originalMessage.conversation_id,
      messageId
    );
  } catch (error) {
    console.error('replyToMessage error:', error);
    return null;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteMessage error:', error);
    return false;
  }
};

/**
 * Delete multiple messages
 */
export const deleteMessages = async (messageIds: string[]): Promise<number> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .in('id', messageIds);

    if (error) {
      console.error('Error deleting messages:', error);
      return 0;
    }

    return messageIds.length;
  } catch (error) {
    console.error('deleteMessages error:', error);
    return 0;
  }
};

/**
 * Fetch conversation by ID
 */
export const fetchConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('fetchConversation error:', error);
    return null;
  }
};

/**
 * Fetch all conversations
 */
export const fetchAllConversations = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('fetchAllConversations error:', error);
    return [];
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  participants: string[],
  subject: string
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participants,
        subject,
        message_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('createConversation error:', error);
    return null;
  }
};

/**
 * Update conversation last message
 */
const updateConversationLastMessage = async (
  conversationId: string,
  lastMessage: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        last_message: lastMessage,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('updateConversationLastMessage error:', error);
    return false;
  }
};

/**
 * Get message statistics
 */
export const getMessageStats = async (): Promise<{
  total: number;
  unread: number;
  byCategory: Record<MessageCategory, number>;
  byPriority: Record<MessagePriority, number>;
}> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('category, priority, is_read');

    if (error) throw error;

    const stats = {
      total: messages?.length || 0,
      unread: messages?.filter(m => !m.is_read).length || 0,
      byCategory: {
        inquiry: 0,
        complaint: 0,
        support: 0,
        feedback: 0,
        other: 0,
      } as Record<MessageCategory, number>,
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0,
      } as Record<MessagePriority, number>,
    };

    messages?.forEach(msg => {
      if (msg.category) stats.byCategory[msg.category]++;
      if (msg.priority) stats.byPriority[msg.priority]++;
    });

    return stats;
  } catch (error) {
    console.error('getMessageStats error:', error);
    return {
      total: 0,
      unread: 0,
      byCategory: { inquiry: 0, complaint: 0, support: 0, feedback: 0, other: 0 },
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
    };
  }
};
