import { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';

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
};

type MessageTemplate = {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
};

type Attachment = {
  id: string;
  name: string;
  size: string;
  type: string;
};

interface MessageReplyModalProps {
  isOpen: boolean;
  originalMessage: Message;
  onClose: () => void;
  onSent: (replyData: any) => void;
}

export const MessageReplyModal: React.FC<MessageReplyModalProps> = ({ 
  isOpen, 
  originalMessage, 
  onClose, 
  onSent 
}) => {
  const { addToast } = useToasts();
  
  const [replyData, setReplyData] = useState({
    to: originalMessage.from,
    subject: `Re: ${originalMessage.subject}`,
    body: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    category: originalMessage.category,
    sendCopy: false,
    scheduleDate: '',
    autoEscalate: false
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'simple' | 'rich'>('simple');

  const messageTemplates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Potwierdzenie otrzymania',
      category: 'support',
      subject: 'Potwierdzenie otrzymania Twojej wiadomości',
      body: 'Dziękujemy za kontakt. Otrzymaliśmy Twoją wiadomość i odpowiemy w ciągu 24 godzin.\n\nPozdrawiam,\nZespół Obsługi Klienta'
    },
    {
      id: '2',
      name: 'Rozwiązanie problemu',
      category: 'support',
      subject: 'Rozwiązanie Twojego problemu',
      body: 'Problem został rozwiązany. Sprawdź czy wszystko działa poprawnie.\n\nW razie dalszych pytań, skontaktuj się z nami.\n\nPozdrawiam,\nZespół Techniczny'
    },
    {
      id: '3',
      name: 'Przeprosiny za opóźnienie',
      category: 'complaint',
      subject: 'Przeprosiny za opóźnienie',
      body: 'Przepraszamy za opóźnienie w realizacji usługi. Podejmujemy działania naprawcze.\n\nKompensacja zostanie przyznana automatycznie.\n\nPozdrawiam,\nMenedżer ds. Jakości'
    },
    {
      id: '4',
      name: 'Podziękowanie za feedback',
      category: 'feedback',
      subject: 'Dziękujemy za Twoją opinię',
      body: 'Bardzo dziękujemy za podzielenie się opinią. Twoje uwagi są dla nas bardzo cenne.\n\nBędziemy kontynuować ulepszanie naszych usług.\n\nPozdrawiam,\nZespół Rozwoju'
    },
    {
      id: '5',
      name: 'Eskalacja do supervisora',
      category: 'complaint',
      subject: 'Sprawa przekazana do supervisora',
      body: 'Twoja sprawa została przekazana do naszego supervisora, który skontaktuje się z Tobą w ciągu 2 godzin roboczych.\n\nNumer sprawy: #{case_number}\n\nPozdrawiam,\nZespół Obsługi'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      addToast(`Dodano ${files.length} załączników`, 'success');
    }
  };

  const applyTemplate = (template: MessageTemplate) => {
    setReplyData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      category: template.category as any
    }));
    setSelectedTemplate(template);
    setShowTemplates(false);
    addToast('Szablon zastosowany', 'success');
  };

  const insertVariable = (variable: string) => {
    const variables: Record<string, string> = {
      '{user_name}': originalMessage.from,
      '{case_number}': '#' + Date.now().toString().slice(-6),
      '{current_date}': new Date().toLocaleDateString('pl-PL'),
      '{company_name}': 'ZZP Werkplaats',
      '{support_email}': 'support@zzpwerkplaats.nl'
    };

    const value = variables[variable] || variable;
    setReplyData(prev => ({
      ...prev,
      body: prev.body + value
    }));
  };

  const handleSendReply = () => {
    if (!replyData.body.trim()) {
      addToast('Treść wiadomości nie może być pusta', 'error');
      return;
    }

    const replyMessage = {
      ...replyData,
      id: Date.now(),
      from: 'Admin',
      fromRole: 'admin' as const,
      toRole: originalMessage.fromRole,
      sentDate: new Date().toISOString().split('T')[0],
      isRead: false,
      attachments: attachments
    };

    addToast('Wysyłanie wiadomości...', 'info');
    
    // Simulate sending
    setTimeout(() => {
      onSent(replyMessage);
      addToast('Wiadomość została wysłana!', 'success');
      
      if (replyData.sendCopy) {
        addToast('Kopia została wysłana na Twój email', 'info');
      }
      
      if (replyData.autoEscalate) {
        addToast('Sprawa została automatycznie eskalowana', 'info');
      }
      
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">📧 Odpowiedź na wiadomość</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
          </div>
          
          {/* Original Message Preview */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Odpowiadasz na wiadomość od:</span>
              <span className="text-sm text-blue-400">{originalMessage.sentDate}</span>
            </div>
            <h3 className="text-white font-semibold">{originalMessage.from} ({originalMessage.fromRole})</h3>
            <p className="text-gray-300 text-sm">{originalMessage.subject}</p>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{originalMessage.body}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipient & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Do</label>
              <input
                type="text"
                value={replyData.to}
                onChange={(e) => setReplyData(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                placeholder="Adresat..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priorytet</label>
              <select
                value={replyData.priority}
                onChange={(e) => setReplyData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                aria-label="Wybierz priorytet wiadomości"
              >
                <option value="low" className="bg-slate-800">🟢 Niski</option>
                <option value="normal" className="bg-slate-800">🔵 Normalny</option>
                <option value="high" className="bg-slate-800">🟡 Wysoki</option>
                <option value="urgent" className="bg-slate-800">🔴 Pilny</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Temat</label>
            <input
              type="text"
              value={replyData.subject}
              onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              placeholder="Temat wiadomości..."
            />
          </div>

          {/* Templates & Editor Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
              >
                📋 Szablony ({messageTemplates.length})
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorMode('simple')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    editorMode === 'simple' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  Prosty
                </button>
                <button
                  onClick={() => setEditorMode('rich')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    editorMode === 'rich' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  Rich Text
                </button>
              </div>
            </div>

            {/* Quick Variables */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Wstaw:</span>
              {['{user_name}', '{case_number}', '{current_date}'].map(variable => (
                <button
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-xs transition-all"
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Panel */}
          {showTemplates && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">Wybierz szablon:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {messageTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-all"
                  >
                    <h5 className="text-white font-medium mb-1">{template.name}</h5>
                    <p className="text-gray-400 text-sm mb-2">{template.category}</p>
                    <p className="text-gray-500 text-xs line-clamp-2">{template.body}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Body */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Treść wiadomości</label>
            {editorMode === 'simple' ? (
              <textarea
                value={replyData.body}
                onChange={(e) => setReplyData(prev => ({ ...prev, body: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                rows={8}
                placeholder="Napisz swoją odpowiedź..."
              />
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                {/* Rich Text Editor Toolbar */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm">B</button>
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm italic">I</button>
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm underline">U</button>
                  <div className="w-px h-4 bg-white/20" />
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm">🔗</button>
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm">📷</button>
                  <button className="px-2 py-1 bg-white/10 rounded text-white text-sm">📊</button>
                </div>
                <textarea
                  value={replyData.body}
                  onChange={(e) => setReplyData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-transparent text-white resize-none outline-none"
                  rows={6}
                  placeholder="Napisz swoją odpowiedź (Rich Text)..."
                />
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Załączniki</label>
              <label className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg cursor-pointer transition-all">
                📎 Dodaj pliki
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">📎</span>
                      <div>
                        <p className="text-white text-sm">{file.name}</p>
                        <p className="text-gray-400 text-xs">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachments(prev => prev.filter(f => f.id !== file.id))}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">Opcje zaawansowane</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={replyData.sendCopy}
                  onChange={(e) => setReplyData(prev => ({ ...prev, sendCopy: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                />
                <span className="text-gray-300">Wyślij kopię na mój email</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={replyData.autoEscalate}
                  onChange={(e) => setReplyData(prev => ({ ...prev, autoEscalate: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                />
                <span className="text-gray-300">Automatycznie eskaluj do supervisora</span>
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={replyData.scheduleDate}
                  onChange={(e) => setReplyData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                  aria-label="Zaplanuj datę i czas wysyłki"
                  placeholder="Data i czas wysyłki"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <span className="text-gray-400 text-sm">Zaplanuj wysyłkę (opcjonalnie)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {selectedTemplate && (
                <span>Użyty szablon: <span className="text-purple-400">{selectedTemplate.name}</span></span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  addToast('Wiadomość zapisana jako szkic', 'info');
                }}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-xl font-semibold transition-all"
              >
                💾 Zapisz szkic
              </button>
              <button
                onClick={handleSendReply}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-glow-blue text-white rounded-xl font-semibold transition-all"
              >
                📧 Wyślij odpowiedź
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};