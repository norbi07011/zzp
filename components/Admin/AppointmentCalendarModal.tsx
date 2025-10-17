import React, { useState, useEffect, useMemo } from 'react';
import { useToasts } from '../../contexts/ToastContext';

type TimeSlot = {
  id: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  workerId?: number;
  appointmentId?: number;
};

type CalendarDay = {
  date: string;
  dayName: string;
  isToday: boolean;
  isWeekend: boolean;
  timeSlots: TimeSlot[];
  availability: 'full' | 'partial' | 'busy' | 'unavailable';
};

type Worker = {
  id: number;
  name: string;
  avatar: string;
  specializations: string[];
  workingHours: { start: string; end: string };
  isAvailable: boolean;
};

type DraggedItem = {
  type: 'appointment' | 'worker';
  id: number;
  data: any;
};

interface AppointmentCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAppointment: (appointmentData: any) => void;
  existingAppointments?: any[];
  workers?: Worker[];
}

export const AppointmentCalendarModal: React.FC<AppointmentCalendarModalProps> = ({
  isOpen,
  onClose,
  onScheduleAppointment,
  existingAppointments = [],
  workers = []
}) => {
  const { addToast } = useToasts();

  // State management
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [showConflicts, setShowConflicts] = useState(false);
  const [schedulingStep, setSchedulingStep] = useState<'calendar' | 'details' | 'conflicts' | 'confirmation'>('calendar');
  
  // New appointment data
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceType: '',
    estimatedDuration: 120,
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    notes: '',
    selectedSlot: null as TimeSlot | null,
    selectedDate: '',
    reminders: {
      sms: true,
      email: true,
      timeBefore: 24 // hours
    }
  });

  // Mock workers data if not provided
  const mockWorkers: Worker[] = [
    {
      id: 1,
      name: 'Piotr Malarz',
      avatar: '🎨',
      specializations: ['Malowanie', 'Gipsowanie', 'Tapetowanie'],
      workingHours: { start: '08:00', end: '16:00' },
      isAvailable: true
    },
    {
      id: 2,
      name: 'Tomasz Stolarz',
      avatar: '🔨',
      specializations: ['Meble', 'Stolarka', 'Renowacja'],
      workingHours: { start: '07:00', end: '15:00' },
      isAvailable: true
    },
    {
      id: 3,
      name: 'Marek Elektryk',
      avatar: '⚡',
      specializations: ['Instalacje', 'Naprawy', 'Modernizacja'],
      workingHours: { start: '09:00', end: '17:00' },
      isAvailable: false
    },
    {
      id: 4,
      name: 'Adam Hydraulik',
      avatar: '🔧',
      specializations: ['Instalacje wodne', 'Ogrzewanie', 'Kanalizacja'],
      workingHours: { start: '08:00', end: '16:00' },
      isAvailable: true
    }
  ];

  const availableWorkers = workers.length > 0 ? workers : mockWorkers;

  // Generate calendar data
  const calendarData = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday

    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Generate time slots (8:00 - 18:00, 30min intervals)
      const timeSlots: TimeSlot[] = [];
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotId = `${dateStr}-${time}`;
          
          // Check if slot is occupied
          const existingAppointment = existingAppointments.find(apt => 
            apt.date === dateStr && apt.time === time
          );

          timeSlots.push({
            id: slotId,
            time,
            duration: 30,
            isAvailable: !existingAppointment && !isWeekend,
            workerId: existingAppointment?.workerId,
            appointmentId: existingAppointment?.id
          });
        }
      }

      // Calculate availability
      const availableSlots = timeSlots.filter(slot => slot.isAvailable).length;
      const totalSlots = timeSlots.length;
      const availabilityRatio = availableSlots / totalSlots;
      
      let availability: CalendarDay['availability'] = 'unavailable';
      if (availabilityRatio > 0.8) availability = 'full';
      else if (availabilityRatio > 0.5) availability = 'partial';
      else if (availabilityRatio > 0) availability = 'busy';

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('pl-PL', { weekday: 'long' }),
        isToday,
        isWeekend,
        timeSlots,
        availability
      });
    }

    return days;
  }, [currentWeek, existingAppointments]);

  // Conflict detection
  const detectConflicts = (slot: TimeSlot, workerId: number, duration: number) => {
    const conflicts = [];
    const slotDate = slot.id.split('-')[0];
    const slotTime = slot.time;
    
    // Check worker availability
    const worker = availableWorkers.find(w => w.id === workerId);
    if (!worker?.isAvailable) {
      conflicts.push('Pracownik niedostępny');
    }

    // Check working hours
    if (worker) {
      const [slotHour, slotMinute] = slotTime.split(':').map(Number);
      const [startHour, startMinute] = worker.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = worker.workingHours.end.split(':').map(Number);
      
      const slotMinutes = slotHour * 60 + slotMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (slotMinutes < startMinutes || slotMinutes + duration > endMinutes) {
        conflicts.push('Poza godzinami pracy');
      }
    }

    // Check overlapping appointments
    const overlapping = existingAppointments.filter(apt => {
      if (apt.date !== slotDate || apt.workerId !== workerId) return false;
      
      const [aptHour, aptMinute] = apt.time.split(':').map(Number);
      const aptStart = aptHour * 60 + aptMinute;
      const aptEnd = aptStart + apt.duration;
      
      const [newHour, newMinute] = slotTime.split(':').map(Number);
      const newStart = newHour * 60 + newMinute;
      const newEnd = newStart + duration;
      
      return (newStart < aptEnd && newEnd > aptStart);
    });

    if (overlapping.length > 0) {
      conflicts.push(`Nakłada się z ${overlapping.length} spotkaniem(ami)`);
    }

    return conflicts;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: DraggedItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlot: TimeSlot) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    if (draggedItem.type === 'worker' && targetSlot.isAvailable) {
      // Quick assign worker to time slot
      setSelectedWorker(availableWorkers.find(w => w.id === draggedItem.id) || null);
      setNewAppointment(prev => ({
        ...prev,
        selectedSlot: targetSlot,
        selectedDate: targetSlot.id.split('-')[0]
      }));
      setSchedulingStep('details');
    }

    setDraggedItem(null);
  };

  // Smart suggestions
  const generateSuggestions = () => {
    if (!selectedWorker || !newAppointment.estimatedDuration) return [];

    const suggestions = [];
    const worker = selectedWorker;
    
    // Find next available slots for this worker
    for (const day of calendarData) {
      if (day.isWeekend) continue;
      
      for (const slot of day.timeSlots) {
        const conflicts = detectConflicts(slot, worker.id, newAppointment.estimatedDuration);
        
        if (conflicts.length === 0 && slot.isAvailable) {
          suggestions.push({
            date: day.date,
            time: slot.time,
            slot,
            score: Math.random() * 100, // Mock scoring algorithm
            reason: 'Optimal time slot'
          });
        }
      }
    }

    return suggestions.slice(0, 5);
  };

  const suggestions = generateSuggestions();

  // Navigation handlers
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleScheduleConfirm = () => {
    if (!newAppointment.selectedSlot || !selectedWorker) {
      addToast('Wybierz termin i pracownika', 'error');
      return;
    }

    const conflicts = detectConflicts(
      newAppointment.selectedSlot, 
      selectedWorker.id, 
      newAppointment.estimatedDuration
    );

    if (conflicts.length > 0 && schedulingStep !== 'conflicts') {
      setShowConflicts(true);
      setSchedulingStep('conflicts');
      return;
    }

    // Create appointment
    const appointmentData = {
      clientName: newAppointment.clientName,
      clientPhone: newAppointment.clientPhone,
      clientEmail: newAppointment.clientEmail,
      workerName: selectedWorker.name,
      workerId: selectedWorker.id,
      date: newAppointment.selectedDate,
      time: newAppointment.selectedSlot.time,
      duration: newAppointment.estimatedDuration,
      serviceType: newAppointment.serviceType,
      priority: newAppointment.priority,
      notes: newAppointment.notes,
      status: 'confirmed',
      reminders: newAppointment.reminders
    };

    onScheduleAppointment(appointmentData);
    addToast('Spotkanie zaplanowane!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📅 Smart Calendar</h2>
              <p className="text-blue-100">Inteligentne planowanie spotkań z drag & drop</p>
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
            {['calendar', 'details', 'conflicts', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  schedulingStep === step ? 'text-white' : 'text-blue-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    schedulingStep === step ? 'bg-white text-blue-600' : 'bg-blue-400/30'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden md:block">
                  {step === 'calendar' && 'Wybierz termin'}
                  {step === 'details' && 'Szczegóły'}
                  {step === 'conflicts' && 'Konflikty'}
                  {step === 'confirmation' && 'Potwierdzenie'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar - Workers & Controls */}
          <div className="w-80 bg-slate-700 p-6 overflow-y-auto">
            
            {/* View Mode */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Widok</label>
              <div className="flex gap-2">
                {['week', 'day', 'month'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    {mode === 'week' && '📅 Tydzień'}
                    {mode === 'day' && '📆 Dzień'} 
                    {mode === 'month' && '🗓️ Miesiąc'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Worker */}
            {selectedWorker && (
              <div className="mb-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <div className="text-blue-300 text-sm font-medium mb-2">Wybrany pracownik</div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedWorker.avatar}</div>
                  <div>
                    <div className="text-white font-semibold">{selectedWorker.name}</div>
                    <div className="text-blue-200 text-xs">
                      {selectedWorker.workingHours.start} - {selectedWorker.workingHours.end}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Workers */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Dostępni pracownicy
                <span className="text-gray-400 text-xs ml-2">(przeciągnij na kalendarz)</span>
              </label>
              <div className="space-y-2">
                {availableWorkers.map(worker => (
                  <div
                    key={worker.id}
                    draggable={worker.isAvailable}
                    onDragStart={(e) => handleDragStart(e, { type: 'worker', id: worker.id, data: worker })}
                    onClick={() => setSelectedWorker(worker)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      worker.isAvailable
                        ? 'bg-slate-600 border-slate-500 hover:bg-slate-500 cursor-move'
                        : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                    } ${
                      selectedWorker?.id === worker.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{worker.avatar}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{worker.name}</div>
                        <div className="text-gray-400 text-xs">
                          {worker.workingHours.start} - {worker.workingHours.end}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {worker.specializations.slice(0, 2).map(spec => (
                            <span key={spec} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        worker.isAvailable ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-3">
                  🎯 Sugestie AI
                </label>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setNewAppointment(prev => ({
                          ...prev,
                          selectedSlot: suggestion.slot,
                          selectedDate: suggestion.date
                        }));
                        setSchedulingStep('details');
                      }}
                      className="p-3 bg-green-500/20 border border-green-400/30 rounded-xl cursor-pointer hover:bg-green-500/30 transition-all"
                    >
                      <div className="text-green-300 font-medium text-sm">
                        {suggestion.date} {suggestion.time}
                      </div>
                      <div className="text-green-200 text-xs">{suggestion.reason}</div>
                      <div className="text-green-400 text-xs font-medium">
                        Score: {Math.round(suggestion.score)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {schedulingStep === 'calendar' && (
              <>
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigateWeek('prev')}
                      className="p-2 bg-slate-600 hover:bg-slate-500 rounded-xl text-white transition-all"
                    >
                      ←
                    </button>
                    <h3 className="text-xl font-semibold text-white">
                      {currentWeek.toLocaleDateString('pl-PL', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <button
                      onClick={() => navigateWeek('next')}
                      className="p-2 bg-slate-600 hover:bg-slate-500 rounded-xl text-white transition-all"
                    >
                      →
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setCurrentWeek(new Date())}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                  >
                    Dziś
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {calendarData.map(day => (
                    <div key={day.date} className="min-h-[400px]">
                      {/* Day Header */}
                      <div className={`p-3 rounded-t-xl border-b ${
                        day.isToday 
                          ? 'bg-blue-500 text-white border-blue-400' 
                          : day.isWeekend
                          ? 'bg-slate-600 text-gray-300 border-slate-500'
                          : 'bg-slate-700 text-white border-slate-600'
                      }`}>
                        <div className="font-semibold text-sm">{day.dayName}</div>
                        <div className="text-lg font-bold">
                          {new Date(day.date).getDate()}
                        </div>
                        <div className={`w-2 h-2 rounded-full mt-1 ${
                          day.availability === 'full' ? 'bg-green-400' :
                          day.availability === 'partial' ? 'bg-yellow-400' :
                          day.availability === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      </div>

                      {/* Time Slots */}
                      <div className="bg-slate-800 rounded-b-xl p-2 space-y-1 h-96 overflow-y-auto">
                        {day.timeSlots.filter((_, index) => index % 2 === 0).map(slot => ( // Show every hour
                          <div
                            key={slot.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, slot)}
                            onClick={() => {
                              if (slot.isAvailable && selectedWorker) {
                                setNewAppointment(prev => ({
                                  ...prev,
                                  selectedSlot: slot,
                                  selectedDate: day.date
                                }));
                                setSchedulingStep('details');
                              }
                            }}
                            className={`p-2 rounded text-xs cursor-pointer transition-all ${
                              slot.isAvailable
                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-400/30'
                                : slot.appointmentId
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            <div className="font-medium">{slot.time}</div>
                            {slot.appointmentId && (
                              <div className="text-xs mt-1">Zajęte</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {schedulingStep === 'details' && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-6">📝 Szczegóły spotkania</h3>
                
                <div className="bg-slate-700 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Client Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Informacje o kliencie</h4>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Imię i nazwisko *
                        </label>
                        <input
                          type="text"
                          value={newAppointment.clientName}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Jan Kowalski"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Telefon *
                        </label>
                        <input
                          type="tel"
                          value={newAppointment.clientPhone}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="+48 123 456 789"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newAppointment.clientEmail}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, clientEmail: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="jan@example.com"
                        />
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Szczegóły usługi</h4>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Typ usługi *
                        </label>
                        <select
                          value={newAppointment.serviceType}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, serviceType: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label="Wybierz typ usługi"
                        >
                          <option value="">Wybierz usługę</option>
                          <option value="Malowanie">Malowanie</option>
                          <option value="Elektryka">Usługi elektryczne</option>
                          <option value="Hydraulika">Hydraulika</option>
                          <option value="Stolarka">Stolarka</option>
                          <option value="Inne">Inne</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Czas trwania (minuty)
                        </label>
                        <input
                          type="number"
                          value={newAppointment.estimatedDuration}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          min="30"
                          max="480"
                          step="30"
                          aria-label="Czas trwania spotkania w minutach"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Priorytet
                        </label>
                        <select
                          value={newAppointment.priority}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label="Wybierz priorytet spotkania"
                        >
                          <option value="low">🟢 Niski</option>
                          <option value="normal">🟡 Normalny</option>
                          <option value="high">🟠 Wysoki</option>
                          <option value="urgent">🔴 Pilny</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Notatki
                    </label>
                    <textarea
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      placeholder="Dodatkowe informacje o spotkaniu..."
                    />
                  </div>

                  {/* Reminders */}
                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-3">
                      Przypomnienia
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-3 bg-slate-600 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAppointment.reminders.sms}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            reminders: { ...prev.reminders, sms: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-white">📱 SMS</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-600 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAppointment.reminders.email}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            reminders: { ...prev.reminders, email: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-white">📧 Email</span>
                      </label>

                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Przypomnienie przed</label>
                        <select
                          value={newAppointment.reminders.timeBefore}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            reminders: { ...prev.reminders, timeBefore: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                          aria-label="Czas przypomnienia przed spotkaniem"
                        >
                          <option value={1}>1 godzina</option>
                          <option value={2}>2 godziny</option>
                          <option value={24}>1 dzień</option>
                          <option value={48}>2 dni</option>
                          <option value={168}>1 tydzień</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Time Summary */}
                {newAppointment.selectedSlot && (
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
                    <h4 className="text-blue-300 font-semibold mb-2">📅 Wybrany termin</h4>
                    <div className="text-white">
                      <div>📅 {newAppointment.selectedDate}</div>
                      <div>🕐 {newAppointment.selectedSlot.time}</div>
                      <div>⏱️ {newAppointment.estimatedDuration} minut</div>
                      <div>👨‍🔧 {selectedWorker?.name}</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSchedulingStep('calendar')}
                    className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                  >
                    ← Wstecz
                  </button>
                  <button
                    onClick={handleScheduleConfirm}
                    disabled={!newAppointment.clientName || !newAppointment.clientPhone || !newAppointment.serviceType}
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
                  >
                    Zaplanuj spotkanie →
                  </button>
                </div>
              </div>
            )}

            {schedulingStep === 'conflicts' && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-6">⚠️ Wykryte konflikty</h3>
                
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 mb-6">
                  <h4 className="text-red-300 font-semibold mb-4">Potencjalne problemy:</h4>
                  
                  {selectedWorker && newAppointment.selectedSlot && (
                    <div className="space-y-3">
                      {detectConflicts(newAppointment.selectedSlot, selectedWorker.id, newAppointment.estimatedDuration).map((conflict, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                          <div className="text-red-400 text-xl">⚠️</div>
                          <div className="text-red-200">{conflict}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSchedulingStep('details')}
                    className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all"
                  >
                    ← Wstecz
                  </button>
                  <button
                    onClick={() => setSchedulingStep('calendar')}
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                  >
                    Wybierz inny termin
                  </button>
                  <button
                    onClick={handleScheduleConfirm}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                  >
                    Zaplanuj mimo konfliktów
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};