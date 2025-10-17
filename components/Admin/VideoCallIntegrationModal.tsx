import React, { useState, useEffect } from 'react';
import { useToasts } from '../../contexts/ToastContext';

type VideoProvider = 'zoom' | 'teams' | 'meet' | 'custom';

type VideoCallSettings = {
  provider: VideoProvider;
  autoGenerate: boolean;
  requirePassword: boolean;
  enableWaitingRoom: boolean;
  recordMeeting: boolean;
  sendInvites: boolean;
  customInstructions: string;
};

type MeetingRoom = {
  id: string;
  provider: VideoProvider;
  meetingId: string;
  password?: string;
  joinUrl: string;
  hostUrl?: string;
  dialInNumbers?: string[];
  isActive: boolean;
  expiresAt?: Date;
};

interface VideoCallIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  appointmentData?: any;
  onVideoCallCreated: (callData: any) => void;
}

export const VideoCallIntegrationModal: React.FC<VideoCallIntegrationModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  appointmentData,
  onVideoCallCreated
}) => {
  const { addToast } = useToasts();

  // State management
  const [currentStep, setCurrentStep] = useState<'setup' | 'configure' | 'testing' | 'confirmation'>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoom, setGeneratedRoom] = useState<MeetingRoom | null>(null);
  const [testCallResult, setTestCallResult] = useState<'pending' | 'success' | 'failed' | null>(null);

  // Video call settings
  const [settings, setSettings] = useState<VideoCallSettings>({
    provider: 'zoom',
    autoGenerate: true,
    requirePassword: true,
    enableWaitingRoom: true,
    recordMeeting: false,
    sendInvites: true,
    customInstructions: ''
  });

  // Provider configurations
  const providerConfigs = {
    zoom: {
      name: 'Zoom',
      icon: '📹',
      color: 'blue',
      features: ['Waiting Room', 'Recording', 'Screen Share', 'Breakout Rooms'],
      requirements: ['Zoom Account', 'API Key'],
      maxParticipants: 100,
      description: 'Professional video conferencing with advanced features'
    },
    teams: {
      name: 'Microsoft Teams',
      icon: '💼',
      color: 'purple',
      features: ['Office 365 Integration', 'File Sharing', 'Whiteboard', 'Recording'],
      requirements: ['Microsoft 365 Account', 'Teams License'],
      maxParticipants: 250,
      description: 'Integrated with Microsoft ecosystem'
    },
    meet: {
      name: 'Google Meet',
      icon: '🎥',
      color: 'green',
      features: ['Google Calendar Integration', 'Live Captions', 'Recording', 'Phone Dial-in'],
      requirements: ['Google Account', 'Meet License'],
      maxParticipants: 500,
      description: 'Simple and reliable video meetings'
    },
    custom: {
      name: 'Custom/Other',
      icon: '🔧',
      color: 'gray',
      features: ['Manual Setup', 'Any Provider', 'Custom Integration'],
      requirements: ['Manual Configuration'],
      maxParticipants: 'Varies',
      description: 'Use any video platform or manual setup'
    }
  };

  // Mock meeting generation
  const generateMeetingRoom = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const config = providerConfigs[settings.provider];
    const meetingId = `${settings.provider}-${Date.now()}`;
    const password = settings.requirePassword ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;
    
    const mockRoom: MeetingRoom = {
      id: meetingId,
      provider: settings.provider,
      meetingId: settings.provider === 'zoom' ? 
        `${Math.floor(Math.random() * 900000000) + 100000000}` : // 9-digit meeting ID
        `meet-${meetingId.slice(-8)}`,
      password,
      joinUrl: generateJoinUrl(settings.provider, meetingId, password),
      hostUrl: settings.provider !== 'custom' ? `https://${settings.provider}.us/j/${meetingId}?role=host` : undefined,
      dialInNumbers: generateDialInNumbers(),
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    setGeneratedRoom(mockRoom);
    setIsGenerating(false);
    setCurrentStep('configure');
  };

  const generateJoinUrl = (provider: VideoProvider, meetingId: string, password?: string) => {
    const baseUrls = {
      zoom: 'https://zoom.us/j/',
      teams: 'https://teams.microsoft.com/l/meetup-join/',
      meet: 'https://meet.google.com/',
      custom: 'https://custom-platform.com/join/'
    };

    const url = baseUrls[provider] + meetingId;
    return password ? `${url}?pwd=${password}` : url;
  };

  const generateDialInNumbers = () => {
    return [
      '+48 22 123 4567',
      '+48 12 345 6789',
      '+1 646 558 8656',
      '+44 20 3481 5237'
    ];
  };

  // Test connection
  const testConnection = async () => {
    setTestCallResult('pending');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Random success/failure for demo
    const success = Math.random() > 0.2; // 80% success rate
    setTestCallResult(success ? 'success' : 'failed');
    
    if (success) {
      addToast('Połączenie z platformą video poprawne!', 'success');
      setCurrentStep('confirmation');
    } else {
      addToast('Błąd połączenia. Sprawdź konfigurację.', 'error');
    }
  };

  // Finalize setup
  const finalizeVideoCall = () => {
    if (!generatedRoom) return;

    const videoCallData = {
      appointmentId,
      room: generatedRoom,
      settings,
      createdAt: new Date(),
      invitesSent: settings.sendInvites,
      testResult: testCallResult
    };

    onVideoCallCreated(videoCallData);
    addToast(`Video call ${generatedRoom.provider} utworzony!`, 'success');
    onClose();
  };

  // Email template generation
  const generateInviteEmail = () => {
    if (!generatedRoom || !appointmentData) return '';

    return `Szanowny Kliencie,

Zapraszamy na video spotkanie:

📅 Data: ${appointmentData.date}
🕐 Godzina: ${appointmentData.time}
👨‍🔧 Specjalista: ${appointmentData.workerName}
🎯 Usługa: ${appointmentData.serviceType}

🎥 Dołącz do spotkania ${providerConfigs[settings.provider].name}:
${generatedRoom.joinUrl}

${generatedRoom.password ? `🔐 Hasło: ${generatedRoom.password}` : ''}

📞 Połączenie telefoniczne:
${generatedRoom.dialInNumbers?.join(', ')}
ID spotkania: ${generatedRoom.meetingId}

${settings.customInstructions}

Pozdrawiamy,
Zespół ZZP Werkplaats`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🎥 Video Call Integration</h2>
              <p className="text-purple-100">Automatyczne tworzenie spotkań wideo z zewnętrznymi platformami</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-4">
            {['setup', 'configure', 'testing', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  currentStep === step ? 'text-white' : 'text-purple-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step ? 'bg-white text-purple-600' : 'bg-purple-400/30'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden md:block">
                  {step === 'setup' && 'Wybór platformy'}
                  {step === 'configure' && 'Konfiguracja'}
                  {step === 'testing' && 'Test połączenia'}
                  {step === 'confirmation' && 'Potwierdzenie'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          
          {/* Step 1: Provider Selection */}
          {currentStep === 'setup' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 Wybierz platformę video</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(providerConfigs).map(([key, config]) => (
                  <div
                    key={key}
                    onClick={() => setSettings(prev => ({ ...prev, provider: key as VideoProvider }))}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      settings.provider === key
                        ? `border-${config.color}-400 bg-${config.color}-500/20`
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{config.icon}</div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{config.name}</h4>
                        <p className="text-gray-400 text-sm">{config.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-300 text-sm font-medium mb-2">Funkcje:</div>
                        <div className="flex flex-wrap gap-2">
                          {config.features.map(feature => (
                            <span key={feature} className="px-2 py-1 bg-slate-600 text-gray-300 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-300 text-sm font-medium mb-2">Wymagania:</div>
                        <div className="text-gray-400 text-sm">
                          {config.requirements.join(', ')}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max uczestników:</span>
                        <span className="text-white font-medium">{config.maxParticipants}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Settings */}
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">⚙️ Podstawowe ustawienia</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-center justify-between p-4 bg-slate-600 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-medium">Auto-generowanie</span>
                      <div className="text-gray-400 text-sm">Automatycznie utwórz pokój video</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoGenerate}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                      className="w-5 h-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-600 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-medium">Hasło zabezpieczające</span>
                      <div className="text-gray-400 text-sm">Wymagaj hasła do dołączenia</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requirePassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, requirePassword: e.target.checked }))}
                      className="w-5 h-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-600 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-medium">Poczekalnia</span>
                      <div className="text-gray-400 text-sm">Uczestnicy czekają na zatwierdzenie</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableWaitingRoom}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableWaitingRoom: e.target.checked }))}
                      className="w-5 h-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-600 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-medium">Nagrywanie</span>
                      <div className="text-gray-400 text-sm">Automatyczne nagrywanie spotkania</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.recordMeeting}
                      onChange={(e) => setSettings(prev => ({ ...prev, recordMeeting: e.target.checked }))}
                      className="w-5 h-5 text-blue-600"
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Dodatkowe instrukcje dla klienta
                  </label>
                  <textarea
                    value={settings.customInstructions}
                    onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                    placeholder="Np. 'Prosimy dołączyć 5 minut przed czasem spotkania...'"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  onClick={generateMeetingRoom}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    <>
                      🚀 Utwórz spotkanie
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 'configure' && generatedRoom && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">⚙️ Konfiguracja spotkania</h3>
              
              {/* Generated Room Info */}
              <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-6">
                <h4 className="text-green-300 font-semibold mb-4 flex items-center gap-2">
                  ✅ Spotkanie utworzone pomyślnie
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-green-200 text-sm">Platforma:</label>
                      <div className="text-white font-mono text-lg">
                        {providerConfigs[generatedRoom.provider].icon} {providerConfigs[generatedRoom.provider].name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-green-200 text-sm">ID spotkania:</label>
                      <div className="text-white font-mono text-lg">{generatedRoom.meetingId}</div>
                    </div>
                    
                    {generatedRoom.password && (
                      <div>
                        <label className="text-green-200 text-sm">Hasło:</label>
                        <div className="text-white font-mono text-lg">{generatedRoom.password}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-green-200 text-sm">Link dla uczestników:</label>
                      <div className="text-white font-mono text-sm bg-green-500/10 p-2 rounded break-all">
                        {generatedRoom.joinUrl}
                      </div>
                    </div>
                    
                    {generatedRoom.hostUrl && (
                      <div>
                        <label className="text-green-200 text-sm">Link hosta:</label>
                        <div className="text-white font-mono text-sm bg-green-500/10 p-2 rounded break-all">
                          {generatedRoom.hostUrl}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dial-in Numbers */}
                <div className="mt-4">
                  <label className="text-green-200 text-sm">Numery dial-in:</label>
                  <div className="text-white text-sm mt-1">
                    {generatedRoom.dialInNumbers?.join(' • ')}
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  📧 Podgląd zaproszenia email
                </h4>
                
                <div className="bg-slate-800 p-4 rounded-xl">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                    {generateInviteEmail()}
                  </pre>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendInvites}
                      onChange={(e) => setSettings(prev => ({ ...prev, sendInvites: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">Wyślij zaproszenia automatycznie</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('setup')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Wstecz
                </button>
                <button
                  onClick={() => setCurrentStep('testing')}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                >
                  Test połączenia →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Testing */}
          {currentStep === 'testing' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">🔧 Test połączenia</h3>
              
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">🧪 Sprawdzanie połączenia z platformą</h4>
                
                {testCallResult === null && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎥</div>
                    <p className="text-gray-300 mb-6">Kliknij aby przetestować połączenie z platformą video</p>
                    <button
                      onClick={testConnection}
                      className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                    >
                      🚀 Rozpocznij test
                    </button>
                  </div>
                )}

                {testCallResult === 'pending' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-blue-300 text-lg font-medium">Testowanie połączenia...</p>
                    <p className="text-gray-400 text-sm mt-2">Sprawdzanie dostępności serwera, jakości połączenia i uprawnień</p>
                  </div>
                )}

                {testCallResult === 'success' && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-green-300 text-lg font-medium mb-2">Test zakończony pomyślnie!</p>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div>✓ Połączenie z serwerem: OK</div>
                      <div>✓ Jakość audio/video: Doskonała</div>
                      <div>✓ Uprawnienia API: Aktywne</div>
                      <div>✓ Funkcje specjalne: Dostępne</div>
                    </div>
                  </div>
                )}

                {testCallResult === 'failed' && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-red-300 text-lg font-medium mb-2">Test nie powiódł się</p>
                    <div className="text-gray-300 text-sm space-y-1 mb-4">
                      <div>⚠️ Błąd autoryzacji API</div>
                      <div>⚠️ Sprawdź ustawienia konta</div>
                      <div>⚠️ Możliwe problemy z siecią</div>
                    </div>
                    <button
                      onClick={testConnection}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                    >
                      🔄 Spróbuj ponownie
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('configure')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Wstecz
                </button>
                <button
                  onClick={() => setCurrentStep('confirmation')}
                  disabled={testCallResult !== 'success'}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
                >
                  Kontynuuj →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && generatedRoom && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">✅ Potwierdzenie</h3>
              
              <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-6">
                <h4 className="text-green-300 font-semibold mb-4">🎉 Video call gotowy!</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-green-200">Platforma:</span>
                    <span className="text-white font-medium">
                      {providerConfigs[generatedRoom.provider].icon} {providerConfigs[generatedRoom.provider].name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-green-200">ID spotkania:</span>
                    <span className="text-white font-mono">{generatedRoom.meetingId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-green-200">Status:</span>
                    <span className="text-green-300">🟢 Aktywne</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-green-200">Zaproszenia:</span>
                    <span className="text-white">{settings.sendInvites ? '📧 Zostaną wysłane' : '❌ Nie będą wysłane'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-green-200">Wygaśnięcie:</span>
                    <span className="text-white">{generatedRoom.expiresAt?.toLocaleString('pl-PL')}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">🚀 Szybkie akcje</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedRoom.joinUrl)}
                    className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl text-left hover:bg-blue-500/30 transition-all"
                  >
                    <div className="text-blue-300 font-medium">📋 Kopiuj link</div>
                    <div className="text-blue-200 text-sm">Skopiuj link do schowka</div>
                  </button>
                  
                  <button
                    onClick={() => window.open(generatedRoom.joinUrl, '_blank')}
                    className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-left hover:bg-green-500/30 transition-all"
                  >
                    <div className="text-green-300 font-medium">🎥 Test video</div>
                    <div className="text-green-200 text-sm">Otwórz pokój testowy</div>
                  </button>
                  
                  <button
                    onClick={() => {/* Mock send email */}}
                    className="p-4 bg-purple-500/20 border border-purple-400/30 rounded-xl text-left hover:bg-purple-500/30 transition-all"
                  >
                    <div className="text-purple-300 font-medium">📧 Wyślij zaproszenia</div>
                    <div className="text-purple-200 text-sm">Email do klienta i pracownika</div>
                  </button>
                  
                  <button
                    onClick={() => {/* Mock calendar */}}
                    className="p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl text-left hover:bg-yellow-500/30 transition-all"
                  >
                    <div className="text-yellow-300 font-medium">📅 Dodaj do kalendarza</div>
                    <div className="text-yellow-200 text-sm">Eksportuj do Outlook/Google</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('testing')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Wstecz
                </button>
                <button
                  onClick={finalizeVideoCall}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                >
                  ✅ Potwierdź i zakończ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};