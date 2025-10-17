import React, { useState } from 'react';
import { Conversation, Message } from '../types';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Mock data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participants: [1, 2],
    lastMessage: {
      id: 'm1',
      conversationId: '1',
      senderId: 2,
      recipientId: 1,
      text: 'Dziękuję za szybką odpowiedź! Kiedy możesz zacząć?',
      timestamp: '2025-01-15T14:30:00',
      isRead: false,
    },
    unreadCount: 2,
    createdAt: '2025-01-15T10:00:00',
    jobRelated: 101,
  },
  {
    id: '2',
    participants: [1, 3],
    lastMessage: {
      id: 'm2',
      conversationId: '2',
      senderId: 1,
      recipientId: 3,
      text: 'Jasne, mogę przyjechać na oględziny jutro o 10:00',
      timestamp: '2025-01-14T16:45:00',
      isRead: true,
    },
    unreadCount: 0,
    createdAt: '2025-01-14T09:00:00',
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 2,
      recipientId: 1,
      text: 'Cześć! Widzę że masz doświadczenie w instalacjach elektrycznych.',
      timestamp: '2025-01-15T10:00:00',
      isRead: true,
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 1,
      recipientId: 2,
      text: 'Dzień dobry! Tak, pracuję jako elektryk od 8 lat.',
      timestamp: '2025-01-15T10:15:00',
      isRead: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 2,
      recipientId: 1,
      text: 'Świetnie! Mam projekt modernizacji instalacji w biurowcu. Czy mógłbyś wycenić taką pracę?',
      timestamp: '2025-01-15T10:20:00',
      isRead: true,
    },
    {
      id: 'm4',
      conversationId: '1',
      senderId: 1,
      recipientId: 2,
      text: 'Oczywiście! Potrzebuję więcej szczegółów - ile metrów kwadratowych, ile pomieszczeń?',
      timestamp: '2025-01-15T14:00:00',
      isRead: true,
    },
    {
      id: 'm5',
      conversationId: '1',
      senderId: 2,
      recipientId: 1,
      text: 'Dziękuję za szybką odpowiedź! Kiedy możesz zacząć?',
      timestamp: '2025-01-15T14:30:00',
      isRead: false,
    },
  ],
  '2': [
    {
      id: 'm6',
      conversationId: '2',
      senderId: 3,
      recipientId: 1,
      text: 'Hej, potrzebuję hydraulika na pilnie.',
      timestamp: '2025-01-14T09:00:00',
      isRead: true,
    },
    {
      id: 'm7',
      conversationId: '2',
      senderId: 1,
      recipientId: 3,
      text: 'Jasne, mogę przyjechać na oględziny jutro o 10:00',
      timestamp: '2025-01-14T16:45:00',
      isRead: true,
    },
  ],
};

const MOCK_USERS: Record<number, { name: string; avatar: string; online: boolean }> = {
  1: { name: 'Jan Kowalski', avatar: '/avatars/jan.jpg', online: true },
  2: { name: 'Biuro ABC Sp. z o.o.', avatar: '/avatars/abc.jpg', online: false },
  3: { name: 'Maria Nowak', avatar: '/avatars/maria.jpg', online: true },
};

export const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = 1; // Mock current user

  const getOtherParticipant = (conversation: Conversation) => {
    const otherId = conversation.participants.find(id => id !== currentUserId) || 0;
    return MOCK_USERS[otherId];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Wczoraj';
    } else {
      return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    // Here you would actually send the message
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const filteredConversations = MOCK_CONVERSATIONS.filter(conv => {
    const other = getOtherParticipant(conv);
    return other.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Wiadomości</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj konwersacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const other = getOtherParticipant(conversation);
            const isSelected = selectedConversation === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  isSelected ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {other.name.charAt(0)}
                    </div>
                    {other.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{other.name}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage?.timestamp || conversation.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {conversation.lastMessage?.senderId === currentUserId && 'Ty: '}
                      {conversation.lastMessage?.text || 'Rozpocznij konwersację'}
                    </p>
                    {conversation.jobRelated && (
                      <p className="text-xs text-primary-600 mt-1">Zlecenie #{conversation.jobRelated}</p>
                    )}
                  </div>

                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                  {getOtherParticipant(MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)!).name.charAt(0)}
                </div>
                {getOtherParticipant(MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)!).online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {getOtherParticipant(MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)!).name}
                </p>
                <p className="text-xs text-gray-500">
                  {getOtherParticipant(MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)!).online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Opcje rozmowy">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {MOCK_MESSAGES[selectedConversation]?.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isMine && (
                        message.isRead ? (
                          <CheckIcon className="w-3.5 h-3.5 text-primary-600" />
                        ) : (
                          <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" aria-label="Załącz plik">
                <PaperClipIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Napisz wiadomość..."
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Wyślij wiadomość"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Naciśnij Enter aby wysłać, Shift+Enter dla nowej linii</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wybierz konwersację</h3>
            <p className="text-gray-600">Kliknij na konwersację aby rozpocząć czat</p>
          </div>
        </div>
      )}
    </div>
  );
};
