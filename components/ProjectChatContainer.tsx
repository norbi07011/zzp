import { useState, useRef, useEffect } from 'react'
import { Button } from '../src/modules/invoices/components/ui/button'
import { Input } from '../src/modules/invoices/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../src/modules/invoices/components/ui/card'
import { Badge } from '../src/modules/invoices/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../src/modules/invoices/components/ui/dialog'
import { Textarea } from '../src/modules/invoices/components/ui/textarea'
// Use basic div instead of ScrollArea for now
// import { ScrollArea } from '../src/modules/invoices/components/ui/scroll-area'
// Use basic div instead of Avatar for now  
// import { Avatar, AvatarFallback, AvatarImage } from '../src/modules/invoices/components/ui/avatar'

// Use simple SVG icons instead of problematic lucide imports
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MicIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PaperclipIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
)

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MapIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

// Typy dla komunikacji budowlanej
export interface BuildingChatMessage {
  id: string
  sender: string
  message: string
  timestamp: number
  projectId: string
  taskId?: string
  locationId?: string
  type: 'message' | 'progress_update' | 'safety_alert' | 'quality_check' | 'voice' | 'image' | 'file'
  attachment?: {
    url: string
    name: string
    size: number
    type: string
    location?: {
      lat: number
      lng: number
    }
  }
  reactions?: {
    [emoji: string]: string[]
  }
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  replyTo?: string
  isPinned?: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  requiresApproval?: boolean
  approvedBy?: string
  location?: {
    lat: number
    lng: number
    description: string
  }
}

export interface BuildingChatGroup {
  id: string
  name: string
  description?: string
  icon?: string
  members: string[]
  createdAt: number
  createdBy: string
  color?: string
  projectId?: string
  type: 'project' | 'team' | 'safety' | 'quality' | 'logistics' | 'admin'
  autoJoinRoles?: string[]
  location?: string
}

interface ProjectChatContainerProps {
  projectId: string
  currentUser: {
    id: string
    email: string
    name: string
    role: string
  }
  teamMembers: any[]
}

// Domyślne grupy dla każdego projektu budowlanego
const DEFAULT_BUILDING_GROUPS: BuildingChatGroup[] = [
  {
    id: 'general',
    name: 'Główny Projekt',
    type: 'project',
    icon: '🏗️',
    color: 'blue',
    members: [],
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['worker', 'supervisor', 'manager']
  },
  {
    id: 'safety',
    name: 'BHP i Bezpieczeństwo', 
    type: 'safety',
    icon: '⚠️',
    color: 'red',
    members: [],
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['all']
  },
  {
    id: 'quality',
    name: 'Kontrola Jakości',
    type: 'quality', 
    icon: '✅',
    color: 'green',
    members: [],
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['supervisor', 'manager', 'quality_inspector']
  },
  {
    id: 'logistics',
    name: 'Logistyka',
    type: 'logistics',
    icon: '📦',
    color: 'orange',
    members: [],
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['logistics_coordinator', 'manager']
  }
]

export function ProjectChatContainer({ projectId, currentUser, teamMembers }: ProjectChatContainerProps) {
  // Stan
  const [activeChannel, setActiveChannel] = useState('general')
  const [messages, setMessages] = useState<BuildingChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [channels] = useState<BuildingChatGroup[]>(DEFAULT_BUILDING_GROUPS)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [showSafetyDialog, setShowSafetyDialog] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Przykładowe wiadomości
  useEffect(() => {
    const sampleMessages: BuildingChatMessage[] = [
      {
        id: '1',
        sender: 'Jan Kowalski',
        message: 'Rozpoczynam prace przy malowaniu ściany północnej',
        timestamp: Date.now() - 3600000, // 1 godz temu
        projectId,
        type: 'message',
        status: 'read',
        priority: 'normal'
      },
      {
        id: '2',
        sender: 'Anna Nowak',
        message: '📊 Raport postępu: 75% ukończone - malowanie salonu',
        timestamp: Date.now() - 1800000, // 30 min temu
        projectId,
        type: 'progress_update',
        status: 'sent',
        priority: 'normal',
        requiresApproval: true,
        taskId: 'task-123'
      },
      {
        id: '3',
        sender: 'Marek Supervisor',
        message: '⚠️ UWAGA: Wykryto pęknięcie w tynku - sektor A3. Wymaga sprawdzenia przed kontynuowaniem.',
        timestamp: Date.now() - 900000, // 15 min temu
        projectId,
        type: 'safety_alert',
        status: 'delivered',
        priority: 'urgent',
        location: {
          lat: 52.2297,
          lng: 21.0122,
          description: 'Sektor A3, ściana północna'
        }
      }
    ]
    setMessages(sampleMessages)
  }, [projectId])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: BuildingChatMessage = {
      id: Date.now().toString(),
      sender: currentUser.name,
      message: newMessage.trim(),
      timestamp: Date.now(),
      projectId,
      type: 'message',
      status: 'sending',
      priority: 'normal'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id 
            ? { ...m, status: 'sent' as const }
            : m
        )
      )
    }, 1000)
  }

  const getChannelColor = (color?: string): string => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
    }
    return colors[color || 'blue'] || colors.blue
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'progress_update':
        return <ChartIcon />
      case 'safety_alert':
        return <AlertIcon />
      case 'quality_check':
        return <CheckIcon />
      default:
        return null
    }
  }

  const getPriorityBadge = (priority?: string) => {
    if (priority === 'urgent') {
      return <Badge variant="error" className="text-xs">🚨 PILNE</Badge>
    }
    if (priority === 'high') {
      return <Badge variant="warning" className="text-xs border-orange-500 text-orange-700">⚡ Wysokie</Badge>
    }
    return null
  }

  const filteredMessages = messages.filter(msg => {
    if (activeChannel === 'general') return msg.type === 'message' || msg.type === 'progress_update'
    if (activeChannel === 'safety') return msg.type === 'safety_alert'
    if (activeChannel === 'quality') return msg.type === 'quality_check'
    if (activeChannel === 'logistics') return msg.type === 'message' // logistyka
    return true
  })

  return (
    <div className="flex h-full">
      {/* Sidebar z kanałami */}
      <div className="w-64 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Kanały Komunikacji</h3>
          <p className="text-sm text-gray-600">Projekt #{projectId}</p>
        </div>
        
        <div className="p-2 space-y-1">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                activeChannel === channel.id 
                  ? 'bg-blue-100 border border-blue-300' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{channel.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{channel.name}</div>
                  <div className="text-xs text-gray-500">{channel.description}</div>
                </div>
                {/* Unread count placeholder */}
                {channel.id === 'safety' && (
                  <Badge variant="error" className="text-xs">1</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Główny czat */}
      <div className="flex-1 flex flex-col">
        {/* Header czatu */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {channels.find(c => c.id === activeChannel)?.icon}
              </span>
              <div>
                <h2 className="font-semibold">
                  {channels.find(c => c.id === activeChannel)?.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {teamMembers.length} członków zespołu
                </p>
              </div>
            </div>
            
            {/* Przyciski akcji */}
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedTaskId('current-task')
                  setShowProgressDialog(true)
                }}
              >
                <ChartIcon />
                Raport Postępu
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSafetyDialog(true)}
              >
                <ShieldIcon />
                Alert BHP
              </Button>
            </div>
          </div>
        </div>
        
        {/* Lista wiadomości */}
        <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {filteredMessages.map(message => (
              <div key={message.id} className="group">
                <div className={`flex items-start space-x-3 ${
                  message.sender === currentUser.name ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs flex items-center justify-center">
                    {message.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${
                    message.sender === currentUser.name ? 'flex flex-col items-end' : ''
                  }`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.sender === currentUser.name
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                    } ${message.isPinned ? 'ring-2 ring-yellow-400' : ''}`}>
                      
                      {/* Header wiadomości */}
                      <div className="flex items-center space-x-2 mb-1">
                        {getMessageIcon(message.type)}
                        <span className="font-medium text-sm">
                          {message.sender}
                        </span>
                        {getPriorityBadge(message.priority)}
                        {message.requiresApproval && (
                          <Badge variant="secondary" className="text-xs">
                            👨‍💼 Wymaga zatwierdzenia
                          </Badge>
                        )}
                      </div>
                      
                      {/* Treść wiadomości */}
                      <div className="text-sm leading-relaxed">
                        {message.message}
                      </div>
                      
                      {/* Lokalizacja (jeśli jest) */}
                      {message.location && (
                        <div className="mt-2 text-xs opacity-80 flex items-center space-x-1">
                          <MapIcon />
                          <span>{message.location.description}</span>
                        </div>
                      )}
                      
                      {/* Załącznik (placeholder) */}
                      {message.attachment && (
                        <div className="mt-2 p-2 bg-black/10 rounded border">
                          <div className="flex items-center space-x-2">
                            <PaperclipIcon />
                            <span className="text-xs">{message.attachment.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Meta informacje */}
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(message.timestamp), { 
                          addSuffix: true, 
                          locale: pl 
                        })}
                      </span>
                      {/* Status wiadomości */}
                      {message.sender === currentUser.name && (
                        <span className="flex items-center space-x-1">
                          {message.status === 'sent' && <span>✓</span>}
                          {message.status === 'delivered' && <span>✓✓</span>}
                          {message.status === 'read' && <span className="text-blue-500">✓✓</span>}
                          {message.status === 'sending' && <span>⏳</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Input wiadomości */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder={`Napisz wiadomość do kanału ${channels.find(c => c.id === activeChannel)?.name}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="min-h-[40px] max-h-[120px] resize-none"
              />
            </div>
            
            {/* Przyciski akcji */}
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost">
                <PaperclipIcon />
              </Button>
              <Button size="sm" variant="ghost">
                <ImageIcon />
              </Button>
              <Button size="sm" variant="ghost">
                <MicIcon />
              </Button>
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialogi */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>📊 Raport Postępu Prac</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">
              Dialog raportowania postępu będzie tutaj zaimplementowany...
            </p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowProgressDialog(false)}>
                Zamknij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSafetyDialog} onOpenChange={setShowSafetyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Alert BHP</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">
              Dialog alertów BHP będzie tutaj zaimplementowany...
            </p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowSafetyDialog(false)}>
                Zamknij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}