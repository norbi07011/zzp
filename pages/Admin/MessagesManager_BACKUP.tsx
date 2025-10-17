import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { MessageReplyModal } from '../../components/Admin/MessageReplyModal';

type Message = {
  id: number;
  from: string;
  fromRole: 'client' | 'worker' | 'admin';
  to: string;
  toRole: 'client' | 'worker' | 'admin';
  subject: string;
  body: string;
  sentDate: string;
  isRead: boolean;
  category: 'inquiry' | 'support' | 'complaint' | 'feedback' | 'other';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  conversationId?: number;
  isReply?: boolean;
  attachments?: any[];
};

type Conversation = {
  id: number;
  subject: string;
  participants: string[];
  lastActivity: string;
  messageCount: number;
  status: 'open' | 'closed' | 'escalated';
  messages: Message[];
};

export const MessagesManager = () => {
  const { addToast } = useToasts();
  
  const initialMessages: Message[] = [
    { id: 1, from: 'Jan Kowalski', fromRole: 'client', to: 'Admin', toRole: 'admin', subject: 'Pytanie o weryfikację', body: 'Jak długo trwa proces weryfikacji pracownika?', sentDate: '2025-01-20', isRead: false, category: 'inquiry', priority: 'normal', conversationId: 1 },
    { id: 2, from: 'Anna Nowak', fromRole: 'worker', to: 'Admin', toRole: 'admin', subject: 'Problem z profilem', body: 'Nie mogę zaktualizować zdjęcia profilowego', sentDate: '2025-01-19', isRead: true, category: 'support', priority: 'high', conversationId: 2 },
    { id: 3, from: 'Piotr Wiśniewski', fromRole: 'client', to: 'Admin', toRole: 'admin', subject: 'Reklamacja', body: 'Pracownik nie wykonał pracy zgodnie z umową', sentDate: '2025-01-18', isRead: true, category: 'complaint', priority: 'urgent', conversationId: 3 },
    { id: 4, from: 'Tomasz Dąbrowski', fromRole: 'worker', to: 'Admin', toRole: 'admin', subject: 'Podziękowanie', body: 'Świetna platforma! Dzięki za pomoc', sentDate: '2025-01-17', isRead: true, category: 'feedback', priority: 'low', conversationId: 4 },
    { id: 5, from: 'Katarzyna Lewandowska', fromRole: 'client', to: 'Admin', toRole: 'admin', subject: 'Pytanie o subskrypcję', body: 'Jakie są różnice między planami?', sentDate: '2025-01-16', isRead: false, category: 'inquiry', priority: 'normal', conversationId: 5 },
    // Conversation replies
    { id: 6, from: 'Admin', fromRole: 'admin', to: 'Jan Kowalski', toRole: 'client', subject: 'Re: Pytanie o weryfikację', body: 'Proces weryfikacji trwa 2-3 dni robocze', sentDate: '2025-01-20', isRead: true, category: 'inquiry', priority: 'normal', conversationId: 1, isReply: true },
    { id: 7, from: 'Jan Kowalski', fromRole: 'client', to: 'Admin', toRole: 'admin', subject: 'Re: Pytanie o weryfikację', body: 'Dziękuję za informację!', sentDate: '2025-01-20', isRead: false, category: 'inquiry', priority: 'normal', conversationId: 1, isReply: true }
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Wszystkie');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessageForReply, setSelectedMessageForReply] = useState<Message | null>(null);
  const [viewMode, setViewMode] = useState<'messages' | 'conversations'>('messages');

  const categories = ['Wszystkie', 'inquiry', 'support', 'complaint', 'feedback', 'other'];

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    if (viewMode === 'conversations') {
      // Group by conversation and show only the latest message from each
      const conversationMap = new Map<number, Message>();
      messages.forEach(msg => {
        const convId = msg.conversationId || msg.id;
        const existing = conversationMap.get(convId);
        if (!existing || new Date(msg.sentDate) > new Date(existing.sentDate)) {
          conversationMap.set(convId, msg);
        }
      });
      filtered = Array.from(conversationMap.values());
    }
    
    return filtered.filter(msg => {
      const matchesSearch = 
        msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.body.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'Wszystkie' || msg.category === filterCategory;
      
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'read' && msg.isRead) ||
        (filterStatus === 'unread' && !msg.isRead);
        
      const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [messages, searchTerm, filterCategory, filterStatus, filterPriority, viewMode]);

  const handleMarkAsRead = (msgId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, isRead: true } : msg
    ));
  };

  const handleDeleteMessage = (msgId: number) => {
    if (confirm('Czy na pewno chcesz usunąć tę wiadomość?')) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      addToast('Wiadomość usunięta', 'success');
      if (selectedMessage?.id === msgId) setSelectedMessage(null);
    }
  };

  const handleReply = (msg: Message) => {
    setSelectedMessageForReply(msg);
    setShowReplyModal(true);
  };

  const handleReplySent = (replyData: any) => {
    const newMessage: Message = {
      id: Date.now(),
      from: replyData.from,
      fromRole: replyData.fromRole,
      to: replyData.to,
      toRole: replyData.toRole,
      subject: replyData.subject,
      body: replyData.body,
      sentDate: replyData.sentDate,
      isRead: false,
      category: replyData.category,
      priority: replyData.priority,
      conversationId: selectedMessageForReply?.conversationId || selectedMessageForReply?.id,
      isReply: true,
      attachments: replyData.attachments
    };
    
    setMessages(prev => [...prev, newMessage]);
    addToast('Odpowiedź została wysłana!', 'success');
  };

  const handleEscalateMessage = (msgId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, priority: 'urgent', category: 'complaint' } : msg
    ));
    addToast('Wiadomość została eskalowana do supervisora', 'info');
  };

  const handleArchiveConversation = (conversationId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.conversationId === conversationId ? { ...msg, isRead: true } : msg
    ));
    addToast('Konwersacja została zarchiwizowana', 'success');
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    urgent: messages.filter(m => m.priority === 'urgent').length,
    conversations: new Set(messages.map(m => m.conversationId || m.id)).size,
    inquiry: messages.filter(m => m.category === 'inquiry').length,
    complaint: messages.filter(m => m.category === 'complaint').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">💬 Zarządzanie Wiadomościami</h1>
            <p className="text-gray-300">Przeglądaj i odpowiadaj na wiadomości użytkowników</p>
          </div>
          <Link to="/admin" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all">
            ← Powrót
          </Link>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <button
              onClick={() => setViewMode('messages')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === 'messages' 
                  ? 'bg-blue-500 text-white shadow-glow-blue' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📧 Wszystkie wiadomości
            </button>
            <button
              onClick={() => setViewMode('conversations')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === 'conversations'
                  ? 'bg-purple-500 text-white shadow-glow-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Konwersacje
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
            <div className="text-blue-300 text-sm font-medium mb-2">Wszystkie</div>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-red-400/30">
            <div className="text-red-300 text-sm font-medium mb-2">Nieprzeczytane</div>
            <div className="text-4xl font-bold text-white">{stats.unread}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30">
            <div className="text-orange-300 text-sm font-medium mb-2">Pilne</div>
            <div className="text-4xl font-bold text-white">{stats.urgent}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
            <div className="text-purple-300 text-sm font-medium mb-2">Konwersacje</div>
            <div className="text-4xl font-bold text-white">{stats.conversations}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
            <div className="text-green-300 text-sm font-medium mb-2">Zapytania</div>
            <div className="text-4xl font-bold text-white">{stats.inquiry}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30">
            <div className="text-yellow-300 text-sm font-medium mb-2">Reklamacje</div>
            <div className="text-4xl font-bold text-white">{stats.complaint}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Szukaj wiadomości..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Filtruj po kategorii"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Filtruj po statusie"
            >
              <option value="all" className="bg-slate-800">Wszystkie</option>
              <option value="unread" className="bg-slate-800">Nieprzeczytane</option>
              <option value="read" className="bg-slate-800">Przeczytane</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Filtruj po priorytecie"
            >
              <option value="all" className="bg-slate-800">Wszystkie priorytety</option>
              <option value="urgent" className="bg-slate-800">🔴 Pilne</option>
              <option value="high" className="bg-slate-800">🟡 Wysokie</option>
              <option value="normal" className="bg-slate-800">🔵 Normalne</option>
              <option value="low" className="bg-slate-800">🟢 Niskie</option>
            </select>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Priorytet</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Od</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Temat</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Kategoria</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Data</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Konwersacja</th>
                  <th className="px-6 py-4 text-center text-white font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg, index) => {
                  const priorityIcons = {
                    urgent: '🔴',
                    high: '🟡', 
                    normal: '🔵',
                    low: '🟢'
                  };
                  
                  const categoryIcons = {
                    inquiry: '❓',
                    support: '🔧',
                    complaint: '⚠️',
                    feedback: '💬',
                    other: '�'
                  };
                  
                  const conversationMessages = messages.filter(m => 
                    (m.conversationId === msg.conversationId) || 
                    (m.conversationId === msg.id) || 
                    (msg.conversationId === m.id)
                  );
                  
                  return (
                    <tr 
                      key={msg.id} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                        !msg.isRead ? 'bg-blue-500/10' : ''
                      } ${msg.priority === 'urgent' ? 'bg-red-500/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!msg.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
                          {msg.isRead && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                          {msg.isReply && <span className="text-purple-400">↪️</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg" title={msg.priority}>
                          {priorityIcons[msg.priority || 'normal']}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{msg.from}</div>
                        <div className="text-gray-400 text-sm">
                          {msg.fromRole === 'client' && '📋 Klient'}
                          {msg.fromRole === 'worker' && '🚅 Pracownik'}
                          {msg.fromRole === 'admin' && '🛡️ Admin'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{msg.subject}</div>
                        <div className="text-gray-400 text-sm truncate max-w-xs">{msg.body}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10">
                          {categoryIcons[msg.category]} {msg.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{msg.sentDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400">#{msg.conversationId || msg.id}</span>
                          {conversationMessages.length > 1 && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                              {conversationMessages.length} msg
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                              title="Oznacz jako przeczytane"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleReply(msg)}
                            className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                            title="Odpowiedz"
                          >
                            ↪️
                          </button>
                          <button
                            onClick={() => setSelectedMessage(msg)}
                            className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
                            title="Podgląd"
                          >
                            👁️
                          </button>
                          {msg.priority !== 'urgent' && (
                            <button
                              onClick={() => handleEscalateMessage(msg.id)}
                              className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all"
                              title="Eskaluj"
                            >
                              ⚠️
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                            title="Usuń"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredMessages.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <div className="text-6xl mb-4">📧</div>
              <div className="text-xl mb-2">Brak wiadomości</div>
              <div>Nie znaleziono wiadomości spełniających kryteria</div>
            </div>
          )}
        </div>

      {/* Message Reply Modal */}
      {showReplyModal && selectedMessageForReply && (
        <MessageReplyModal
          isOpen={showReplyModal}
          originalMessage={selectedMessageForReply}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedMessageForReply(null);
          }}
          onSent={handleReplySent}
        />
      )}

      {/* Message Preview Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Podgląd wiadomości</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-white transition-colors text-3xl font-light"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Od:</label>
                    <div className="text-white font-medium">
                      {selectedMessage.from} ({selectedMessage.fromRole})
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Data:</label>
                    <div className="text-white">{selectedMessage.sentDate}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Temat:</label>
                  <div className="text-white font-medium">{selectedMessage.subject}</div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Treść:</label>
                  <div className="bg-white/10 rounded-xl p-4 text-white whitespace-pre-wrap">
                    {selectedMessage.body}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kategoria:</label>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10 text-white">
                      {selectedMessage.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Status:</label>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedMessage.isRead ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedMessage.isRead ? 'Przeczytana' : 'Nieprzeczytana'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    handleReply(selectedMessage);
                    setSelectedMessage(null);
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold"
                >
                  ↪️ Odpowiedz
                </button>
                {!selectedMessage.isRead && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                  >
                    ✓ Oznacz jako przeczytane
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MessagesManager;
