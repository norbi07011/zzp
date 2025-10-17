import React, { useState } from 'react';
import { useToasts } from '../../contexts/ToastContext';

interface Certificate {
  id: number;
  workerId: number;
  workerName: string;
  type: 'VCA' | 'SCC' | 'BHV' | 'Forklift' | 'Wózek widłowy' | 'Inne';
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  documentUrl?: string;
  issuer?: string;
  certificateNumber?: string;
  lastReminderSent?: string;
  reminderCount?: number;
}

interface ReminderSettings {
  enabled: boolean;
  daysBefore: number[];
  emailTemplate: string;
  smsEnabled: boolean;
  autoRenewal: boolean;
  escalationDays: number;
}

interface CertificateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: Certificate[];
  onSettingsUpdated: (settings: ReminderSettings) => void;
}

export const CertificateReminderModal: React.FC<CertificateReminderModalProps> = ({
  isOpen,
  onClose,
  certificates,
  onSettingsUpdated
}) => {
  const { addToast } = useToasts();
  
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    daysBefore: [30, 14, 7, 1],
    emailTemplate: `Szanowny/a {workerName},

Informujemy, że Twój certyfikat {certificateType} o numerze {certificateNumber} wygasa w dniu {expiryDate}.

Aby uniknąć przerw w pracy, prosimy o odnowienie certyfikatu w jak najkrótszym czasie.

Szczegóły certyfikatu:
- Typ: {certificateType}
- Numer: {certificateNumber}
- Data wygaśnięcia: {expiryDate}
- Wydawca: {issuer}

W przypadku pytań prosimy o kontakt z działem HR.

Pozdrawienia,
Zespół ZZP Werkplaats`,
    smsEnabled: true,
    autoRenewal: false,
    escalationDays: 3
  });

  const [selectedTab, setSelectedTab] = useState<'settings' | 'preview' | 'schedule' | 'history'>('settings');
  const [isProcessing, setIsProcessing] = useState(false);

  const expiringCertificates = certificates.filter(cert => {
    const daysToExpiry = Math.ceil((new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 30 && daysToExpiry > 0;
  });

  const expiredCertificates = certificates.filter(cert => 
    new Date(cert.expiryDate) < new Date()
  );

  const handleSendReminders = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate sending reminders
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const remindersSent = expiringCertificates.length + expiredCertificates.length;
      addToast(`Wysłano ${remindersSent} przypomnień o wygasających certyfikatach`, 'success');
      
      onSettingsUpdated(reminderSettings);
    } catch (error) {
      addToast('Błąd podczas wysyłania przypomnień', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleReminders = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addToast('Automatyczne przypomnienia zostały skonfigurowane', 'success');
      onSettingsUpdated(reminderSettings);
    } catch (error) {
      addToast('Błąd podczas konfiguracji przypomnień', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const previewEmailTemplate = (cert: Certificate) => {
    return reminderSettings.emailTemplate
      .replace('{workerName}', cert.workerName)
      .replace('{certificateType}', cert.type)
      .replace('{certificateNumber}', cert.certificateNumber || 'N/A')
      .replace('{expiryDate}', cert.expiryDate)
      .replace('{issuer}', cert.issuer || 'N/A');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">🔔 Zarządzanie Powiadomieniami</h3>
              <p className="text-gray-400">Automatyczne przypomnienia o wygasających certyfikatach</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-3xl font-light"
            >
              ×
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30">
              <div className="text-yellow-300 text-sm font-medium mb-2">Wygasające (30 dni)</div>
              <div className="text-4xl font-bold text-white">{expiringCertificates.length}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-red-400/30">
              <div className="text-red-300 text-sm font-medium mb-2">Wygasłe</div>
              <div className="text-4xl font-bold text-white">{expiredCertificates.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
              <div className="text-blue-300 text-sm font-medium mb-2">Przypomnienia dzisiaj</div>
              <div className="text-4xl font-bold text-white">
                {reminderSettings.daysBefore.includes(1) ? expiringCertificates.filter(c => {
                  const days = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return days === 1;
                }).length : 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
              <div className="text-green-300 text-sm font-medium mb-2">Auto-renewal</div>
              <div className="text-4xl font-bold text-white">
                {reminderSettings.autoRenewal ? '✅' : '❌'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              {[
                { key: 'settings', label: 'Ustawienia', icon: '⚙️' },
                { key: 'preview', label: 'Podgląd', icon: '👀' },
                { key: 'schedule', label: 'Harmonogram', icon: '📅' },
                { key: 'history', label: 'Historia', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedTab === tab.key
                      ? 'bg-blue-500 text-white shadow-glow-blue'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Settings Tab */}
            {selectedTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Settings */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white">⚙️ Podstawowe ustawienia</h4>
                  
                  <div className="bg-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Włącz przypomnienia</label>
                      <button
                        onClick={() => setReminderSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                        aria-label="Przełącz przypomnienia"
                        className={`w-12 h-6 rounded-full transition-all ${
                          reminderSettings.enabled ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                          reminderSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Powiadomienia SMS</label>
                      <button
                        onClick={() => setReminderSettings(prev => ({ ...prev, smsEnabled: !prev.smsEnabled }))}
                        aria-label="Przełącz powiadomienia SMS"
                        className={`w-12 h-6 rounded-full transition-all ${
                          reminderSettings.smsEnabled ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                          reminderSettings.smsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Auto-odnowienie</label>
                      <button
                        onClick={() => setReminderSettings(prev => ({ ...prev, autoRenewal: !prev.autoRenewal }))}
                        aria-label="Przełącz automatyczne odnowienie"
                        className={`w-12 h-6 rounded-full transition-all ${
                          reminderSettings.autoRenewal ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                          reminderSettings.autoRenewal ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Eskalacja po (dni):</label>
                      <input
                        type="number"
                        value={reminderSettings.escalationDays}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, escalationDays: parseInt(e.target.value) }))}
                        placeholder="7"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                </div>

                {/* Reminder Days */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white">📅 Dni przypomnienia</h4>
                  
                  <div className="bg-white/10 rounded-xl p-6">
                    <p className="text-gray-300 mb-4">Wysyłaj przypomnienia na X dni przed wygaśnięciem:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 3, 7, 14, 21, 30, 60, 90].map(days => (
                        <button
                          key={days}
                          onClick={() => {
                            setReminderSettings(prev => ({
                              ...prev,
                              daysBefore: prev.daysBefore.includes(days)
                                ? prev.daysBefore.filter(d => d !== days)
                                : [...prev.daysBefore, days].sort((a, b) => b - a)
                            }));
                          }}
                          className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                            reminderSettings.daysBefore.includes(days)
                              ? 'bg-blue-500 text-white border-2 border-blue-400'
                              : 'bg-white/10 text-gray-300 border-2 border-transparent hover:border-blue-400/30'
                          }`}
                        >
                          {days} {days === 1 ? 'dzień' : 'dni'}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
                      <p className="text-blue-300 text-sm">
                        Wybrane: {reminderSettings.daysBefore.sort((a, b) => b - a).join(', ')} dni przed wygaśnięciem
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Template */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-lg font-semibold text-white">📧 Szablon email</h4>
                  <div className="bg-white/10 rounded-xl p-6">
                    <textarea
                      value={reminderSettings.emailTemplate}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, emailTemplate: e.target.value }))}
                      className="w-full h-48 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Wpisz szablon email..."
                    />
                    <div className="mt-4 text-sm text-gray-400">
                      <p className="mb-2">Dostępne zmienne:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '{workerName}', '{certificateType}', '{certificateNumber}', 
                          '{expiryDate}', '{issuer}', '{daysToExpiry}'
                        ].map(variable => (
                          <span 
                            key={variable}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded cursor-pointer hover:bg-blue-500/30"
                            onClick={() => {
                              const textarea = document.querySelector('textarea');
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const newText = reminderSettings.emailTemplate.substring(0, start) + variable + reminderSettings.emailTemplate.substring(end);
                                setReminderSettings(prev => ({ ...prev, emailTemplate: newText }));
                              }
                            }}
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {selectedTab === 'preview' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">👀 Podgląd przypomnień</h4>
                
                {expiringCertificates.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {expiringCertificates.slice(0, 4).map(cert => {
                      const daysToExpiry = Math.ceil((new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={cert.id} className="bg-white/10 rounded-xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white font-semibold">{cert.workerName}</h5>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              daysToExpiry <= 7 ? 'bg-red-500/20 text-red-300' :
                              daysToExpiry <= 14 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {daysToExpiry} dni
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-400 space-y-1">
                            <p>Certyfikat: {cert.type}</p>
                            <p>Wygasa: {cert.expiryDate}</p>
                            <p>Numer: {cert.certificateNumber || 'N/A'}</p>
                          </div>

                          <div className="border-t border-white/20 pt-4">
                            <h6 className="text-white font-medium mb-2">📧 Podgląd email:</h6>
                            <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 max-h-32 overflow-y-auto">
                              {previewEmailTemplate(cert)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h4 className="text-xl font-semibold text-white mb-2">Brak wygasających certyfikatów</h4>
                    <p className="text-gray-400">Wszystkie certyfikaty są aktualne</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {selectedTab === 'schedule' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">📅 Harmonogram wysyłki</h4>
                
                <div className="bg-white/10 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-400/30">
                        <h5 className="text-yellow-300 font-semibold mb-2">🟡 Dzisiaj</h5>
                        <p className="text-white text-2xl font-bold">
                          {expiringCertificates.filter(c => {
                            const days = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return reminderSettings.daysBefore.includes(days);
                          }).length}
                        </p>
                        <p className="text-yellow-200 text-sm">przypomnień do wysłania</p>
                      </div>
                      
                      <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
                        <h5 className="text-blue-300 font-semibold mb-2">🔵 Jutro</h5>
                        <p className="text-white text-2xl font-bold">
                          {expiringCertificates.filter(c => {
                            const days = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) - 1;
                            return reminderSettings.daysBefore.includes(days);
                          }).length}
                        </p>
                        <p className="text-blue-200 text-sm">zaplanowanych</p>
                      </div>
                      
                      <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
                        <h5 className="text-purple-300 font-semibold mb-2">🟣 Ten tydzień</h5>
                        <p className="text-white text-2xl font-bold">
                          {expiringCertificates.filter(c => {
                            const days = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return days <= 7 && reminderSettings.daysBefore.some(d => d <= days);
                          }).length}
                        </p>
                        <p className="text-purple-200 text-sm">w kolejce</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 p-6">
                    <h5 className="text-white font-semibold mb-4">📋 Nadchodzące wysyłki</h5>
                    <div className="space-y-3">
                      {reminderSettings.daysBefore.sort((a, b) => a - b).map(days => {
                        const certsForDay = expiringCertificates.filter(c => {
                          const daysToExpiry = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysToExpiry === days;
                        });

                        if (certsForDay.length === 0) return null;

                        return (
                          <div key={days} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                              <span className="text-white font-medium">
                                Za {days} {days === 1 ? 'dzień' : 'dni'} przed wygaśnięciem
                              </span>
                              <p className="text-gray-400 text-sm">{certsForDay.length} przypomnień</p>
                            </div>
                            <div className="text-blue-400">
                              {certsForDay.map(c => c.workerName).join(', ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {selectedTab === 'history' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">📊 Historia przypomnień</h4>
                
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">127</div>
                      <div className="text-gray-400 text-sm">Wysłanych email</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">43</div>
                      <div className="text-gray-400 text-sm">Wysłanych SMS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">89%</div>
                      <div className="text-gray-400 text-sm">Wskaźnik otwarć</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">76%</div>
                      <div className="text-gray-400 text-sm">Odnowienia na czas</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { date: '2025-01-05', worker: 'Jan Kowalski', type: 'Email', cert: 'VCA', status: 'delivered' },
                      { date: '2025-01-04', worker: 'Anna Nowak', type: 'SMS', cert: 'SCC', status: 'delivered' },
                      { date: '2025-01-03', worker: 'Piotr Wiśniewski', type: 'Email', cert: 'BHV', status: 'opened' },
                      { date: '2025-01-02', worker: 'Katarzyna Lewandowska', type: 'Email', cert: 'Forklift', status: 'clicked' },
                      { date: '2025-01-01', worker: 'Tomasz Dąbrowski', type: 'SMS', cert: 'VCA', status: 'failed' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-gray-400 text-sm">{item.date}</div>
                          <div className="text-white font-medium">{item.worker}</div>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {item.cert}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">{item.type}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'delivered' ? 'bg-blue-500/20 text-blue-300' :
                            item.status === 'opened' ? 'bg-yellow-500/20 text-yellow-300' :
                            item.status === 'clicked' ? 'bg-green-500/20 text-green-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {item.status === 'delivered' && '📤 Dostarczono'}
                            {item.status === 'opened' && '👀 Otworzono'}
                            {item.status === 'clicked' && '✅ Kliknięto'}
                            {item.status === 'failed' && '❌ Niepowodzenie'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-white/20">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
            >
              Anuluj
            </button>
            <button
              onClick={handleScheduleReminders}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold disabled:opacity-50"
            >
              {isProcessing ? '⏳ Konfigurowanie...' : '⚙️ Zapisz ustawienia'}
            </button>
            <button
              onClick={handleSendReminders}
              disabled={isProcessing || expiringCertificates.length === 0}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold disabled:opacity-50"
            >
              {isProcessing ? '📤 Wysyłanie...' : `🔔 Wyślij przypomnienia (${expiringCertificates.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};