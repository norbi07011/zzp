import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../src/lib/supabase'
import { 
  BuildingChatMessage, 
  BuildingNotification, 
  ProgressReport, 
  SafetyAlert, 
  ProjectChatGroup,
  ProjectRole,
  MessageType 
} from '../types'

interface UseProjectCommunicationProps {
  projectId: string
  userId: string
  userRole: ProjectRole
}

export function useProjectCommunication({ 
  projectId, 
  userId, 
  userRole 
}: UseProjectCommunicationProps) {
  const [messages, setMessages] = useState<BuildingChatMessage[]>([])
  const [chatGroups, setChatGroups] = useState<ProjectChatGroup[]>([])
  const [notifications, setNotifications] = useState<BuildingNotification[]>([])
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ==========================================
  // REAL-TIME SUBSCRIPTIONS (PLACEHOLDER)
  // ==========================================

  useEffect(() => {
    if (!projectId || !userId) return

    // TODO: Implement real-time subscriptions once communication tables exist
    // For now, we'll use polling or manual refresh

    return () => {
      // Cleanup subscriptions
    }
  }, [projectId, userId])

  // ==========================================
  // DATA FETCHING FUNCTIONS
  // ==========================================

  const fetchChatGroups = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch chat groups from Supabase (using generic typing for new tables)
      const { data: groups, error } = await supabase
        .from('project_chat_groups' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      // Transform Supabase data to our interface
      const transformedGroups: ProjectChatGroup[] = groups?.map((group: any) => ({
        id: group.id,
        project_id: group.project_id,
        name: group.name,
        group_type: group.group_type as any,
        description: group.description,
        created_by: group.created_by,
        members: group.members?.map((memberId: string) => ({
          user_id: memberId,
          user_name: 'Loading...', // TODO: Fetch user names from profiles
          user_role: 'worker' as ProjectRole,
          joined_at: group.created_at,
          is_admin: memberId === group.created_by,
          last_seen_at: new Date().toISOString()
        })) || [],
        unread_count: 0, // TODO: Calculate unread count
        is_active: true,
        created_at: group.created_at,
        updated_at: group.updated_at
      })) || []

      // If no groups exist, create a default general group
      if (transformedGroups.length === 0) {
        const { data: newGroup, error: createError } = await supabase
          .from('project_chat_groups' as any)
          .insert({
            project_id: projectId,
            name: 'Algemeen',
            description: 'Algemene communicatie voor dit project',
            group_type: 'project',
            members: [userId],
            created_by: userId
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default group:', createError)
        } else if (newGroup) {
          const group = newGroup as any
          transformedGroups.push({
            id: group.id,
            project_id: group.project_id,
            name: group.name,
            group_type: group.group_type,
            description: group.description,
            created_by: group.created_by,
            members: [{
              user_id: userId,
              user_name: 'Current User',
              user_role: userRole,
              joined_at: group.created_at,
              is_admin: true,
              last_seen_at: new Date().toISOString()
            }],
            unread_count: 0,
            is_active: true,
            created_at: group.created_at,
            updated_at: group.updated_at
          })
        }
      }
      
      setChatGroups(transformedGroups)
    } catch (err) {
      console.error('Error fetching chat groups:', err)
      setError('Błąd podczas ładowania grup czatu')
    } finally {
      setLoading(false)
    }
  }, [projectId, userId, userRole])

  const fetchMessages = useCallback(async (groupId?: string) => {
    try {
      setLoading(true)
      
      // Fetch messages from Supabase
      const { data: messages, error } = await supabase
        .from('project_messages' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(100) // Limit to last 100 messages

      if (error) {
        throw error
      }

      // Transform Supabase data to our interface
      const transformedMessages: BuildingChatMessage[] = messages?.map((msg: any) => ({
        id: msg.id,
        group_id: groupId || 'general',
        sender_id: msg.sender_id,
        sender_name: 'User', // TODO: Fetch from profiles
        sender_role: 'worker' as ProjectRole, // TODO: Determine role
        message_type: msg.message_type || 'text',
        content: msg.message,
        metadata: {
          // Transform to expected metadata format
          location: msg.location_data ? {
            lat: msg.location_data.lat || 0,
            lng: msg.location_data.lng || 0,
            address: msg.location_data.description
          } : undefined,
          file_url: msg.attachment_data?.url,
          file_name: msg.attachment_data?.name
        },
        is_read: msg.status === 'read',
        created_at: msg.created_at,
        updated_at: msg.updated_at
      })) || []

      setMessages(transformedMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Błąd podczas ładowania wiadomości')
    } finally {
      setLoading(false)
    }
  }, [projectId, userId, userRole])

  const fetchNotifications = useCallback(async () => {
    try {
      // For now, use mock notifications until proper tables are created
      const mockNotifications: BuildingNotification[] = [
        {
          id: `notif-${Date.now()}`,
          user_id: userId,
          project_id: projectId,
          notification_type: 'message',
          title: 'Welkom in het communicatiesysteem',
          content: 'Het communicatiesysteem voor bouwprojecten is nu actief.',
          metadata: {},
          is_read: false,
          created_at: new Date().toISOString()
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Błąd tijdens ładowania powiadomień')
    }
  }, [userId, projectId])

  const fetchProgressReports = useCallback(async () => {
    try {
      // Fetch progress reports from Supabase
      const { data: reports, error } = await supabase
        .from('progress_reports' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform to frontend format
      const transformedReports: ProgressReport[] = (reports || []).map((report: any) => ({
        id: report.id,
        project_id: report.project_id,
        task_name: report.task_name,
        task_description: report.task_description,
        completion_percentage: report.completion_percentage,
        status: report.status,
        reporter_id: report.reporter_id,
        reporter_name: 'Worker', // TODO: Join with profiles table
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
      setError('Błąd tijdens ładowania raportów postępu')
    }
  }, [projectId])

  const fetchSafetyAlerts = useCallback(async () => {
    try {
      // Fetch safety alerts from Supabase
      const { data: alerts, error } = await supabase
        .from('safety_alerts' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform to frontend format
      const transformedAlerts: SafetyAlert[] = (alerts || []).map((alert: any) => ({
        id: alert.id,
        project_id: alert.project_id,
        reporter_id: alert.reporter_id,
        reporter_name: 'Worker', // TODO: Join with profiles table
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
  // ACTION FUNCTIONS
  // ==========================================

  const sendMessage = useCallback(async (
    groupId: string,
    content: string,
    messageType: MessageType = 'text',
    metadata?: any
  ) => {
    try {
      // Insert message into Supabase
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

      // Transform and add to local state
      const message = newMessage as any
      const transformedMessage: BuildingChatMessage = {
        id: message.id,
        group_id: groupId,
        sender_id: message.sender_id,
        sender_name: 'Current User',
        sender_role: userRole,
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
      }

      setMessages(prev => [...prev, transformedMessage])
      return transformedMessage
    } catch (err) {
      console.error('Error sending message:', err)
      throw new Error('Błąd podczas wysyłania wiadomości')
    }
  }, [userId, userRole, projectId])

  const createProgressReport = useCallback(async (reportData: Omit<ProgressReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Insert progress report into Supabase
      const { data: newReport, error } = await supabase
        .from('progress_reports' as any)
        .insert({
          project_id: projectId,
          reporter_id: userId,
          task_name: reportData.task_name,
          task_description: reportData.task_description,
          completion_percentage: reportData.completion_percentage,
          status: reportData.status,
          location_data: reportData.location ? {
            lat: reportData.location.lat,
            lng: reportData.location.lng,
            description: reportData.location.address
          } : null,
          attachment_data: reportData.photos?.length ? {
            photos: reportData.photos
          } : null,
          notes: reportData.notes,
          hours_worked: reportData.hours_worked,
          materials_used: reportData.materials_used,
          issues_encountered: reportData.issues_encountered,
          next_steps: reportData.next_steps
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Transform to frontend format
      const report = newReport as any
      const transformedReport: ProgressReport = {
        id: report.id,
        project_id: report.project_id,
        task_name: report.task_name,
        task_description: report.task_description,
        completion_percentage: report.completion_percentage,
        status: report.status,
        reporter_id: report.reporter_id,
        reporter_name: 'Current User',
        reporter_role: userRole,
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
      }

      setProgressReports(prev => [transformedReport, ...prev])
      
      // Create notification
      await createNotification({
        user_id: userId,
        project_id: projectId,
        notification_type: 'progress_update',
        title: 'Nieuw voortgangsrapport',
        content: `Rapport voor taak: ${reportData.task_name}`,
        metadata: { progress_report_id: transformedReport.id }
      })

      return transformedReport
    } catch (err) {
      console.error('Error creating progress report:', err)
      throw new Error('Błąd tijdens tworzenia raportu postępu')
    }
  }, [userId, userRole, projectId])

  const createSafetyAlert = useCallback(async (alertData: Omit<SafetyAlert, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      // Insert safety alert into Supabase
      const { data: newAlert, error } = await supabase
        .from('safety_alerts' as any)
        .insert({
          project_id: projectId,
          reporter_id: userId,
          title: alertData.title,
          description: alertData.description,
          safety_level: alertData.safety_level,
          category: alertData.category,
          location_description: alertData.location_description,
          location_coordinates: alertData.location_coordinates,
          attachment_data: alertData.photos?.length ? {
            photos: alertData.photos
          } : null,
          actions_taken: alertData.actions_taken,
          assigned_to: alertData.assigned_to,
          resolution_notes: alertData.resolution_notes,
          status: 'open'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Transform to frontend format
      const alert = newAlert as any
      const transformedAlert: SafetyAlert = {
        id: alert.id,
        project_id: alert.project_id,
        reporter_id: alert.reporter_id,
        reporter_name: 'Current User',
        reporter_role: userRole,
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
      }

      setSafetyAlerts(prev => [transformedAlert, ...prev])

      // Create urgent notification
      await createNotification({
        user_id: userId,
        project_id: projectId,
        notification_type: 'safety_alert',
        title: '⚠️ Veiligheidsalert',
        content: alertData.title,
        metadata: { safety_alert_id: transformedAlert.id }
      })

      return transformedAlert
    } catch (err) {
      console.error('Error creating safety alert:', err)
      throw new Error('Błąd tijdens tworzenia veiligheidsalert')
    }
  }, [userId, userRole, projectId])

  const createNotification = useCallback(async (notificationData: Omit<BuildingNotification, 'id' | 'created_at' | 'is_read'>) => {
    try {
      // Insert notification into Supabase
      const { data: newNotification, error } = await supabase
        .from('building_notifications' as any)
        .insert({
          user_id: notificationData.user_id,
          project_id: notificationData.project_id,
          notification_type: notificationData.notification_type,
          title: notificationData.title,
          content: notificationData.content,
          metadata: notificationData.metadata,
          is_read: false
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Transform to frontend format
      const notification = newNotification as any
      const transformedNotification: BuildingNotification = {
        id: notification.id,
        user_id: notification.user_id,
        project_id: notification.project_id,
        notification_type: notification.notification_type,
        title: notification.title,
        content: notification.content,
        metadata: notification.metadata,
        is_read: notification.is_read,
        created_at: notification.created_at
      }
      
      setNotifications(prev => [transformedNotification, ...prev])
      return transformedNotification
    } catch (err) {
      console.error('Error creating notification:', err)
      throw new Error('Błąd podczas tworzenia powiadomienia')
    }
  }, [])

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      // Update notification in Supabase
      const { error } = await supabase
        .from('building_notifications' as any)
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        throw error
      }

      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

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
    if (chatGroups.length > 0) {
      fetchMessages()
    }
  }, [chatGroups, fetchMessages])

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
    
    // Computed
    unreadNotifications,
    urgentSafetyAlerts,
    recentProgressReports,
    
    // Actions
    sendMessage,
    createProgressReport,
    createSafetyAlert,
    markNotificationAsRead,
    
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