import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../src/lib/supabase'
import { 
  BuildingChatMessage, 
  ProjectChatGroup as ChatGroup, 
  BuildingNotification, 
  ProgressReport, 
  SafetyAlert,
  ProjectRole 
} from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseProjectCommunicationProps {
  projectId: string
  userId: string
  userRole: ProjectRole
  enableRealtime?: boolean // New prop for real-time
}

export function useProjectCommunicationRealtime({
  projectId,
  userId,
  userRole,
  enableRealtime = true
}: UseProjectCommunicationProps) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [messages, setMessages] = useState<BuildingChatMessage[]>([])
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([])
  const [notifications, setNotifications] = useState<BuildingNotification[]>([])
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // ==========================================
  // REAL-TIME SUBSCRIPTIONS
  // ==========================================
  
  useEffect(() => {
    if (!enableRealtime || !projectId) return

    console.log(`🔄 Setting up real-time subscription for project: ${projectId}`)

    // Create real-time channel for this project
    const projectChannel = supabase.channel(`project-${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        }, 
        (payload) => {
          console.log('📨 Real-time message update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any
            const transformedMessage: BuildingChatMessage = {
              id: newMessage.id,
              group_id: 'general', // TODO: Get from group mapping
              sender_id: newMessage.sender_id,
              sender_name: newMessage.sender_id === userId ? 'You' : 'User',
              sender_role: newMessage.sender_id === userId ? userRole : 'worker',
              message_type: newMessage.message_type,
              content: newMessage.message,
              metadata: {
                location: newMessage.location_data ? {
                  lat: newMessage.location_data.lat,
                  lng: newMessage.location_data.lng,
                  address: newMessage.location_data.description
                } : undefined,
                file_url: newMessage.attachment_data?.url,
                file_name: newMessage.attachment_data?.name
              },
              is_read: false,
              created_at: newMessage.created_at,
              updated_at: newMessage.updated_at
            }

            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === transformedMessage.id)) {
                return prev
              }
              return [...prev, transformedMessage]
            })
          }
          
          if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as any
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...msg, content: updatedMessage.message, updated_at: updatedMessage.updated_at }
                : msg
            ))
          }
          
          if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as any
            setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'building_notifications',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('🔔 Real-time notification update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as any
            const transformedNotification: BuildingNotification = {
              id: newNotification.id,
              user_id: newNotification.user_id,
              project_id: newNotification.project_id,
              notification_type: newNotification.notification_type,
              title: newNotification.title,
              content: newNotification.content,
              metadata: newNotification.metadata,
              is_read: newNotification.is_read,
              created_at: newNotification.created_at
            }

            setNotifications(prev => {
              if (prev.some(notif => notif.id === transformedNotification.id)) {
                return prev
              }
              return [transformedNotification, ...prev]
            })
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Real-time connection status: ${status}`)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscriptions active')
        }
      })

    setChannel(projectChannel)

    // Cleanup on unmount
    return () => {
      console.log('🔌 Unsubscribing from real-time updates')
      projectChannel.unsubscribe()
    }
  }, [projectId, userId, userRole, enableRealtime])

  // ==========================================
  // DATA FETCHING FUNCTIONS (Same as before)
  // ==========================================

  const fetchChatGroups = useCallback(async () => {
    try {
      const { data: groups, error } = await supabase
        .from('project_chat_groups' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      const transformedGroups: ChatGroup[] = (groups || []).map((group: any) => ({
        id: group.id,
        project_id: group.project_id,
        name: group.name,
        description: group.description,
        group_type: group.group_type,
        is_active: group.is_active,
        created_by: group.created_by || 'system',
        created_at: group.created_at,
        updated_at: group.updated_at,
        unread_count: 0, // TODO: Calculate from messages
        members: [] // TODO: Implement members relationship
      }))

      setChatGroups(transformedGroups)
    } catch (err) {
      console.error('Error fetching chat groups:', err)
      setError('Błąd podczas ładowania grup czatu')
    }
  }, [projectId])

  const fetchMessages = useCallback(async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('project_messages' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) {
        throw error
      }

      const transformedMessages: BuildingChatMessage[] = (messagesData || []).map((message: any) => ({
        id: message.id,
        group_id: 'general', // TODO: Determine group from context
        sender_id: message.sender_id,
        sender_name: message.sender_id === userId ? 'You' : 'User',
        sender_role: message.sender_id === userId ? userRole : 'worker',
        message_type: message.message_type,
        content: message.message,
        metadata: {
          location: message.location_data ? {
            lat: message.location_data.lat,
            lng: message.location_data.lng,
            address: message.location_data.description
          } : undefined,
          file_url: message.attachment_data?.url,
          file_name: message.attachment_data?.name
        },
        is_read: false,
        created_at: message.created_at,
        updated_at: message.updated_at
      }))

      setMessages(transformedMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Błąd podczas ładowania wiadomości')
    }
  }, [projectId, userId, userRole])

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: notificationsData, error } = await supabase
        .from('building_notifications' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      const transformedNotifications: BuildingNotification[] = (notificationsData || []).map((notif: any) => ({
        id: notif.id,
        user_id: notif.user_id,
        project_id: notif.project_id,
        notification_type: notif.notification_type,
        title: notif.title,
        content: notif.content,
        metadata: notif.metadata,
        is_read: notif.is_read,
        created_at: notif.created_at
      }))

      setNotifications(transformedNotifications)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Błąd podczas ładowania powiadomień')
    }
  }, [userId, projectId])

  const fetchProgressReports = useCallback(async () => {
    try {
      const { data: reports, error } = await supabase
        .from('progress_reports' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const transformedReports: ProgressReport[] = (reports || []).map((report: any) => ({
        id: report.id,
        project_id: report.project_id,
        task_name: report.task_name,
        task_description: report.task_description,
        completion_percentage: report.completion_percentage,
        status: report.status,
        reporter_id: report.reporter_id,
        reporter_name: 'Worker',
        reporter_role: 'worker' as ProjectRole,
        location: report.location_data ? {
          lat: report.location_data.lat,
          lng: report.location_data.lng,
          address: report.location_data.description
        } : undefined,
        photos: report.attachment_data?.photos || [],
        notes: report.notes,
        hours_worked: report.hours_worked,
        materials_used: report.materials_used,
        issues_encountered: report.issues_encountered,
        next_steps: report.next_steps,
        created_at: report.created_at,
        updated_at: report.updated_at
      }))

      setProgressReports(transformedReports)
    } catch (err) {
      console.error('Error fetching progress reports:', err)
      setError('Błąd podczas ładowania raportów postępu')
    }
  }, [projectId])

  const fetchSafetyAlerts = useCallback(async () => {
    try {
      const { data: alerts, error } = await supabase
        .from('safety_alerts' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const transformedAlerts: SafetyAlert[] = (alerts || []).map((alert: any) => ({
        id: alert.id,
        project_id: alert.project_id,
        reporter_id: alert.reporter_id,
        reporter_name: 'Worker',
        reporter_role: 'worker' as ProjectRole,
        title: alert.title,
        description: alert.description,
        safety_level: alert.safety_level,
        category: alert.category,
        location_description: alert.location_description,
        location_coordinates: alert.location_coordinates,
        photos: alert.attachment_data?.photos || [],
        actions_taken: alert.actions_taken,
        status: alert.status,
        assigned_to: alert.assigned_to,
        resolution_notes: alert.resolution_notes,
        created_at: alert.created_at,
        updated_at: alert.updated_at
      }))

      setSafetyAlerts(transformedAlerts)
    } catch (err) {
      console.error('Error fetching safety alerts:', err)
      setError('Błąd podczas ładowania alertów bezpieczeństwa')
    }
  }, [projectId])

  // ==========================================
  // ACTION FUNCTIONS (Same as before)
  // ==========================================

  const sendMessage = useCallback(async (
    groupId: string,
    content: string,
    messageType: 'text' | 'voice' | 'image' | 'file' = 'text',
    metadata?: any
  ) => {
    try {
      const { data: newMessage, error } = await supabase
        .from('project_messages' as any)
        .insert({
          project_id: projectId,
          sender_id: userId,
          message: content,
          message_type: messageType,
          location_data: metadata?.location ? {
            lat: metadata.location.lat,
            lng: metadata.location.lng,
            description: metadata.location.address
          } : null,
          attachment_data: metadata?.file_url ? {
            url: metadata.file_url,
            name: metadata.file_name,
            type: metadata.file_type
          } : null,
          priority: metadata?.priority || 'normal',
          status: 'sent'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Real-time will handle adding to state
      return newMessage
    } catch (err) {
      console.error('Error sending message:', err)
      throw new Error('Błąd podczas wysyłania wiadomości')
    }
  }, [userId, userRole, projectId])

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================

  useEffect(() => {
    const loadInitialData = async () => {
      if (!projectId || !userId) return

      setLoading(true)
      setError(null)

      try {
        await Promise.all([
          fetchChatGroups(),
          fetchNotifications(),
          fetchProgressReports(),
          fetchSafetyAlerts()
        ])
      } catch (err) {
        console.error('Error loading initial data:', err)
        setError('Błąd podczas ładowania danych')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [projectId, userId, fetchChatGroups, fetchNotifications, fetchProgressReports, fetchSafetyAlerts])

  // Load messages after chat groups are loaded
  useEffect(() => {
    if (chatGroups.length > 0 || !loading) {
      fetchMessages()
    }
  }, [chatGroups, fetchMessages, loading])

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const urgentSafetyAlerts = safetyAlerts.filter(alert => 
    alert.safety_level === 'critical' && alert.status === 'open'
  )
  const recentProgressReports = progressReports.slice(0, 5)

  return {
    // Data
    messages,
    chatGroups,
    notifications,
    progressReports,
    safetyAlerts,
    
    // State
    loading,
    error,
    
    // Real-time
    isConnected: channel?.state === 'joined',
    
    // Computed
    unreadNotifications,
    urgentSafetyAlerts,
    recentProgressReports,
    
    // Actions
    sendMessage,
    
    // Refresh functions
    refetch: {
      messages: fetchMessages,
      groups: fetchChatGroups,
      notifications: fetchNotifications,
      progress: fetchProgressReports,
      safety: fetchSafetyAlerts
    }
  }
}