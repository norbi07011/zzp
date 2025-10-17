import React, { useState, useEffect } from 'react';
import { useToasts } from '../../contexts/ToastContext';

type ReminderType = 'sms' | 'email' | 'push' | 'call';
type ReminderTemplate = {
  id: string;
  name: string;
  type: ReminderType;
  content: string;
  variables: string[];
  language: 'pl' | 'en' | 'de';
  isActive: boolean;
};

type ReminderSchedule = {
  id: string;
  appointmentId: number;
  reminderType: ReminderType;
  scheduledFor: Date;
  content: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
};

type PersonalizationData = {
  clientName: string;
  workerName: string;
  date: string;
  time: string;
  serviceType: string;
  location: string;
  duration: number;
  reminderHours: number;
  customMessage?: string;
};

interface SmartReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  appointmentData?: any;
  onReminderScheduled: (reminderData: any) => void;
}

export const SmartReminderModal: React.FC<SmartReminderModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  appointmentData,
  onReminderScheduled
}) => {
  const { addToast } = useToasts();

  // State management
  const [currentStep, setCurrentStep] = useState<'templates' | 'schedule' | 'personalize' | 'preview' | 'confirmation'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ReminderType[]>(['sms']);
  const [scheduledReminders, setScheduledReminders] = useState<ReminderSchedule[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  // Personalization data
  const [personalization, setPersonalization] = useState<PersonalizationData>({
    clientName: appointmentData?.clientName || 'Jan Kowalski',
    workerName: appointmentData?.workerName || 'Piotr Malarz',
    date: appointmentData?.date || '2025-01-25',
    time: appointmentData?.time || '14:00',
    serviceType: appointmentData?.serviceType || 'Malowanie',
    location: appointmentData?.location || 'Warszawa, ul. Przykładowa 1',
    duration: appointmentData?.duration || 120,
    reminderHours: 24,
    customMessage: ''
  });

  // Reminder schedules
  const [reminderSchedules, setReminderSchedules] = useState([
    { hours: 168, enabled: false, label: '1 tydzień przed' },
    { hours: 72, enabled: false, label: '3 dni przed' },
    { hours: 24, enabled: true, label: '1 dzień przed' },
    { hours: 4, enabled: true, label: '4 godziny przed' },
    { hours: 1, enabled: false, label: '1 godzina przed' },
    { hours: 0.25, enabled: false, label: '15 minut przed' }
  ]);

  // Mock templates
  const templates: ReminderTemplate[] = [
    {
      id: 'sms-basic',
      name: 'SMS - Podstawowe przypomnienie',
      type: 'sms',
      content: 'Cześć {clientName}! Przypominamy o spotkaniu {date} o {time} z {workerName}. Usługa: {serviceType}. Lokalizacja: {location}.',
      variables: ['clientName', 'date', 'time', 'workerName', 'serviceType', 'location'],
      language: 'pl',
      isActive: true
    },
    {
      id: 'sms-friendly',
      name: 'SMS - Przyjazne przypomnienie',
      type: 'sms',
      content: 'Dzień dobry {clientName}! 👋 Za {reminderHours}h mamy umówione spotkanie ({date}, {time}) z naszym specjalistą {workerName}. Czekamy na Ciebie! 😊',
      variables: ['clientName', 'reminderHours', 'date', 'time', 'workerName'],
      language: 'pl',
      isActive: true
    },
    {
      id: 'sms-professional',
      name: 'SMS - Profesjonalne',
      type: 'sms',
      content: 'Szanowny {clientName}, przypominamy o zaplanowanym spotkaniu w dniu {date} o godz. {time}. Specjalista: {workerName}. W razie pytań prosimy o kontakt.',
      variables: ['clientName', 'date', 'time', 'workerName'],
      language: 'pl',
      isActive: true
    },
    {
      id: 'email-detailed',
      name: 'Email - Szczegółowe',
      type: 'email',
      content: `Szanowny {clientName},

Przypominamy o nadchodzącym spotkaniu:

📅 Data: {date}
🕐 Godzina: {time}  
⏱️ Czas trwania: {duration} minut
👨‍🔧 Specjalista: {workerName}
🎯 Usługa: {serviceType}
📍 Lokalizacja: {location}

{customMessage}

W razie pytań lub konieczności przełożenia terminu, prosimy o kontakt.

Pozdrawiamy,
Zespół ZZP Werkplaats`,
      variables: ['clientName', 'date', 'time', 'duration', 'workerName', 'serviceType', 'location', 'customMessage'],
      language: 'pl',
      isActive: true
    },
    {
      id: 'push-quick',
      name: 'Push - Szybkie przypomnienie',
      type: 'push',
      content: '🔔 Spotkanie za {reminderHours}h: {time} z {workerName}',
      variables: ['reminderHours', 'time', 'workerName'],
      language: 'pl',
      isActive: true
    }
  ];

  // Process template with variables
  const processTemplate = (template: ReminderTemplate, data: PersonalizationData): string => {
    let content = template.content;
    
    // Replace all variables
    template.variables.forEach(variable => {
      const value = data[variable as keyof PersonalizationData];
      if (value !== undefined) {
        content = content.replace(new RegExp(`{${variable}}`, 'g'), value.toString());
      }
    });

    return content;
  };

  // Schedule reminders
  const scheduleReminders = async () => {
    setIsScheduling(true);
    
    const newReminders: ReminderSchedule[] = [];
    const appointmentDate = new Date(`${personalization.date}T${personalization.time}`);
    
    // Create reminders for each enabled schedule and type
    reminderSchedules.forEach(schedule => {
      if (!schedule.enabled) return;
      
      selectedTypes.forEach(type => {
        const reminderTime = new Date(appointmentDate.getTime() - (schedule.hours * 60 * 60 * 1000));
        
        // Find appropriate template
        const template = templates.find(t => t.type === type && t.isActive) || templates[0];
        const content = processTemplate(template, { ...personalization, reminderHours: schedule.hours });
        
        const reminder: ReminderSchedule = {
          id: `${type}-${schedule.hours}-${Date.now()}`,
          appointmentId: appointmentId || 0,
          reminderType: type,
          scheduledFor: reminderTime,
          content,
          status: reminderTime > new Date() ? 'scheduled' : 'sent'
        };
        
        newReminders.push(reminder);
      });
    });

    // Simulate scheduling delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setScheduledReminders(newReminders);
    setIsScheduling(false);
    setCurrentStep('confirmation');
    
    addToast(`Zaplanowano ${newReminders.length} przypomnień`, 'success');
  };

  // Analytics data
  const getAnalytics = () => {
    const mockStats = {
      totalSent: 1247,
      deliveryRate: 96.3,
      readRate: 78.5,
      responseRate: 23.8,
      optOutRate: 2.1,
      avgResponseTime: '14 minut',
      bestSendTime: '10:00-12:00',
      topPerformingTemplate: 'SMS - Przyjazne przypomnienie'
    };
    
    return mockStats;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📱 Smart Reminders</h2>
              <p className="text-green-100">Inteligentne przypomnienia z personalizacją AI</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-4 overflow-x-auto">
            {['templates', 'schedule', 'personalize', 'preview', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  currentStep === step ? 'text-white' : 'text-green-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step ? 'bg-white text-green-600' : 'bg-green-400/30'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden md:block text-sm">
                  {step === 'templates' && 'Szablony'}
                  {step === 'schedule' && 'Harmonogram'}
                  {step === 'personalize' && 'Personalizacja'}
                  {step === 'preview' && 'Podgląd'}
                  {step === 'confirmation' && 'Potwierdzenie'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          
          {/* Step 1: Template Selection */}
          {currentStep === 'templates' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">📝 Wybierz szablon</h3>
              
              {/* Reminder Types */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Typy przypomnień
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { type: 'sms' as ReminderType, icon: '📱', label: 'SMS', color: 'green' },
                    { type: 'email' as ReminderType, icon: '📧', label: 'Email', color: 'blue' },
                    { type: 'push' as ReminderType, icon: '🔔', label: 'Push', color: 'purple' },
                    { type: 'call' as ReminderType, icon: '📞', label: 'Dzwonek', color: 'red' }
                  ].map(({ type, icon, label, color }) => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTypes.includes(type)
                          ? `border-${color}-400 bg-${color}-500/20`
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes(prev => [...prev, type]);
                          } else {
                            setSelectedTypes(prev => prev.filter(t => t !== type));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-2xl">{icon}</span>
                      <span className="text-white font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {templates.filter(t => selectedTypes.includes(t.type)).map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-green-400 bg-green-500/20'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">
                        {template.type === 'sms' && '📱'}
                        {template.type === 'email' && '📧'}
                        {template.type === 'push' && '🔔'}
                        {template.type === 'call' && '📞'}
                      </span>
                      <div>
                        <h4 className="text-white font-semibold">{template.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {template.type.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {template.language.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl mb-4">
                      <div className="text-gray-300 text-sm font-mono">
                        {template.content.substring(0, 120)}
                        {template.content.length > 120 && '...'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {template.variables.map(variable => (
                        <span key={variable} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Preview */}
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">📊 Statystyki przypomnień</h4>
                
                {(() => {
                  const stats = getAnalytics();
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{stats.deliveryRate}%</div>
                        <div className="text-gray-400 text-sm">Dostarczalność</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.readRate}%</div>
                        <div className="text-gray-400 text-sm">Przeczytane</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{stats.responseRate}%</div>
                        <div className="text-gray-400 text-sm">Odpowiedzi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.avgResponseTime}</div>
                        <div className="text-gray-400 text-sm">Śr. czas odpowiedzi</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => setCurrentStep('schedule')}
                  disabled={selectedTypes.length === 0}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
                >
                  Następny krok →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Schedule Configuration */}
          {currentStep === 'schedule' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">⏰ Konfiguruj harmonogram</h3>
              
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">📅 Kiedy wysyłać przypomnienia</h4>
                
                <div className="space-y-4">
                  {reminderSchedules.map((schedule, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        schedule.enabled
                          ? 'border-green-400 bg-green-500/20'
                          : 'border-slate-600 bg-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={schedule.enabled}
                          onChange={(e) => {
                            const newSchedules = [...reminderSchedules];
                            newSchedules[index].enabled = e.target.checked;
                            setReminderSchedules(newSchedules);
                          }}
                          className="w-5 h-5 text-green-600"
                        />
                        <div>
                          <span className="text-white font-medium">{schedule.label}</span>
                          <div className="text-gray-400 text-sm">
                            {schedule.hours >= 24 
                              ? `${Math.floor(schedule.hours / 24)} dni przed spotkaniem`
                              : schedule.hours >= 1
                              ? `${schedule.hours} godzin przed spotkaniem`
                              : `${schedule.hours * 60} minut przed spotkaniem`
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {selectedTypes.map(type => (
                          <span key={type} className="w-6 h-6 text-sm flex items-center justify-center">
                            {type === 'sms' && '📱'}
                            {type === 'email' && '📧'}
                            {type === 'push' && '🔔'}
                            {type === 'call' && '📞'}
                          </span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Smart Suggestions */}
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6 mb-6">
                <h4 className="text-blue-300 font-semibold mb-3">🤖 Sugestie AI</h4>
                <div className="space-y-2 text-blue-200 text-sm">
                  <div>💡 Dla usług trwających powyżej 2h zalecamy przypomnienie 24h wcześniej</div>
                  <div>💡 SMS ma najwyższą skuteczność między 10:00-12:00</div>
                  <div>💡 Email szczegółowy działa najlepiej 3 dni przed spotkaniem</div>
                  <div>💡 Push notifications skuteczne 1-4h przed</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('templates')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Wstecz
                </button>
                <button
                  onClick={() => setCurrentStep('personalize')}
                  disabled={!reminderSchedules.some(s => s.enabled)}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
                >
                  Personalizacja →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Personalization */}
          {currentStep === 'personalize' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 Personalizacja</h3>
              
              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">👤 Dane personalizacji</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Imię klienta
                    </label>
                    <input
                      type="text"
                      value={personalization.clientName}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, clientName: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Imię klienta"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nazwa specjalisty
                    </label>
                    <input
                      type="text"
                      value={personalization.workerName}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, workerName: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Nazwa specjalisty"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Data spotkania
                    </label>
                    <input
                      type="date"
                      value={personalization.date}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Data spotkania"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Godzina spotkania
                    </label>
                    <input
                      type="time"
                      value={personalization.time}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Godzina spotkania"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Typ usługi
                    </label>
                    <input
                      type="text"
                      value={personalization.serviceType}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Typ usługi"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Czas trwania (minuty)
                    </label>
                    <input
                      type="number"
                      value={personalization.duration}
                      onChange={(e) => setPersonalization(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      min="30"
                      max="480"
                      step="30"
                      aria-label="Czas trwania w minutach"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Lokalizacja
                  </label>
                  <input
                    type="text"
                    value={personalization.location}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Warszawa, ul. Przykładowa 1"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Dodatkowa wiadomość
                  </label>
                  <textarea
                    value={personalization.customMessage}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows={3}
                    placeholder="Dodatkowe informacje dla klienta..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('schedule')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Wstecz
                </button>
                <button
                  onClick={() => setCurrentStep('preview')}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                >
                  Podgląd →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 'preview' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">👀 Podgląd przypomnień</h3>
              
              <div className="space-y-6 mb-6">
                {reminderSchedules.filter(s => s.enabled).map((schedule, scheduleIndex) => (
                  <div key={scheduleIndex} className="bg-slate-700 rounded-2xl p-6">
                    <h4 className="text-white font-semibold mb-4">
                      📅 {schedule.label}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedTypes.map(type => {
                        const template = templates.find(t => t.type === type && t.isActive) || templates[0];
                        const processedContent = processTemplate(template, { ...personalization, reminderHours: schedule.hours });
                        
                        return (
                          <div key={type} className="bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">
                                {type === 'sms' && '📱'}
                                {type === 'email' && '📧'}
                                {type === 'push' && '🔔'}
                                {type === 'call' && '📞'}
                              </span>
                              <span className="text-white font-medium">{type.toUpperCase()}</span>
                              <span className="text-gray-400 text-sm">({template.name})</span>
                            </div>
                            
                            <div className="bg-slate-900 p-3 rounded-lg">
                              <div className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                                {processedContent}
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-400">
                              Długość: {processedContent.length} znaków
                              {type === 'sms' && processedContent.length > 160 && (
                                <span className="text-yellow-400 ml-2">⚠️ Przekracza 160 znaków</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('personalize')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Edytuj
                </button>
                <button
                  onClick={scheduleReminders}
                  disabled={isScheduling}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isScheduling ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Planowanie...
                    </>
                  ) : (
                    '✅ Zaplanuj przypomnienia'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">✅ Potwierdzenie</h3>
              
              <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-6">
                <h4 className="text-green-300 font-semibold mb-4">🎉 Przypomnienia zaplanowane!</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{scheduledReminders.length}</div>
                    <div className="text-green-200 text-sm">Zaplanowane</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{selectedTypes.length}</div>
                    <div className="text-blue-200 text-sm">Kanały</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {reminderSchedules.filter(s => s.enabled).length}
                    </div>
                    <div className="text-purple-200 text-sm">Terminy</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scheduledReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {reminder.reminderType === 'sms' && '📱'}
                          {reminder.reminderType === 'email' && '📧'}
                          {reminder.reminderType === 'push' && '🔔'}
                          {reminder.reminderType === 'call' && '📞'}
                        </span>
                        <div>
                          <div className="text-white font-medium">{reminder.reminderType.toUpperCase()}</div>
                          <div className="text-green-200 text-sm">
                            {reminder.scheduledFor.toLocaleString('pl-PL')}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        reminder.status === 'scheduled' 
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {reminder.status === 'scheduled' ? '⏰ Zaplanowane' : '✅ Wysłane'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">📊 Przewidywane rezultaty</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">96%</div>
                    <div className="text-gray-400 text-sm">Dostarczalność</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">78%</div>
                    <div className="text-gray-400 text-sm">Odczytane</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">85%</div>
                    <div className="text-gray-400 text-sm">Obecność na spotkaniu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">24%</div>
                    <div className="text-gray-400 text-sm">Interakcje</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('preview')}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  ← Edytuj
                </button>
                <button
                  onClick={() => {
                    onReminderScheduled({
                      appointmentId,
                      reminders: scheduledReminders,
                      personalization,
                      settings: {
                        types: selectedTypes,
                        schedules: reminderSchedules.filter(s => s.enabled)
                      }
                    });
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                >
                  ✅ Zapisz i zakończ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};