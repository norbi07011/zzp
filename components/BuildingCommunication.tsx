import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../src/modules/invoices/components/ui/card'
import { Button } from '../src/modules/invoices/components/ui/button'
import { Input } from '../src/modules/invoices/components/ui/input'
import { Textarea } from '../src/modules/invoices/components/ui/textarea'
import { Badge } from '../src/modules/invoices/components/ui/badge'
import { useProjectCommunication } from '../hooks/useProjectCommunication'

interface BuildingCommunicationProps {
  projectId: string
  userId?: string // Make optional for demo
}

export function BuildingCommunication({ projectId, userId = 'demo-user' }: BuildingCommunicationProps) {
  const [newMessage, setNewMessage] = useState('')
  
  const {
    messages,
    chatGroups,
    notifications,
    progressReports,
    safetyAlerts,
    loading,
    error,
    sendMessage
  } = useProjectCommunication({
    projectId,
    userId,
    userRole: 'worker' // TODO: Determine actual role
  })

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    try {
      await sendMessage('general', newMessage.trim())
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          💬 Komunikacja Projektu
        </h2>
        {loading && <Badge variant="secondary">Ładowanie...</Badge>}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              ⚠️ {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm text-gray-600">Wiadomości</p>
                <p className="font-semibold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-sm text-gray-600">Grupy</p>
                <p className="font-semibold">{chatGroups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm text-gray-600">Raporty</p>
                <p className="font-semibold">{progressReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm text-gray-600">Alerty BHP</p>
                <p className="font-semibold">{safetyAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Czat Projektowy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages Display */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <span className="text-4xl block mb-2">💬</span>
                  <p>Brak wiadomości</p>
                  <p className="text-sm">Napisz pierwszą wiadomość aby rozpocząć komunikację</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {message.sender_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {message.sender_role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString('pl-PL')}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm">{message.content}</p>
                        {message.metadata?.location && (
                          <div className="mt-2 text-xs text-gray-500">
                            📍 {message.metadata.location.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Napisz wiadomość..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none"
                rows={2}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                className="self-end"
              >
                📤
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Grupy</CardTitle>
            </CardHeader>
            <CardContent>
              {chatGroups.length === 0 ? (
                <p className="text-sm text-gray-500">Brak grup</p>
              ) : (
                <div className="space-y-2">
                  {chatGroups.map((group) => (
                    <div key={group.id} className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.members.length} członków</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔔 Powiadomienia</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">Brak powiadomień</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="p-2 bg-blue-50 rounded">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}