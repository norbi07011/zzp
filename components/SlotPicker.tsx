import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  addWeeks, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isWeekend, 
  isBefore, 
  startOfDay,
  parseISO,
  addHours,
  setHours,
  setMinutes,
  type Locale
} from 'date-fns';
import { nl, enUS, pl, tr, de, fr, hu } from 'date-fns/locale';

interface TimeSlot {
  datetime: string; // ISO string "2025-10-07T09:00:00Z"
  available: number; // available spots
  capacity: number; // total capacity
  status: 'available' | 'booked' | 'full';
}

interface SlotPickerProps {
  value?: string; // Selected slot ISO datetime
  onChange: (slot: string) => void;
  language?: string;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ 
  value, 
  onChange, 
  language = 'nl' 
}) => {
  const { t } = useTranslation();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = this week, 1 = next week, 2 = week after
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({}); // key: YYYY-MM-DD, value: slots for that day
  const [selectedSlot, setSelectedSlot] = useState<string | null>(value || null);

  // Date-fns locale mapping
  const localeMap: Record<string, Locale> = {
    nl: nl,
    en: enUS,
    pl: pl,
    tr: tr,
    de: de,
    fr: fr,
    hu: hu,
    bg: enUS, // fallback
    ar: enUS  // fallback
  };

  const currentLocale = localeMap[language] || nl;

  // FIXED SLOT TIMES (from your spec: Mon-Fri 09:00, 11:00, 14:00)
  const SLOT_TIMES = ['09:00', '11:00', '14:00'];
  const MAX_CAPACITY = 6; // 6 spots per slot

  // Generate mock slots for current week view
  useEffect(() => {
    generateSlots();
  }, [currentWeekOffset]);

  const generateSlots = () => {
    const today = startOfDay(new Date());
    const weekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), currentWeekOffset); // Monday
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); // Sunday
    
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const newSlots: Record<string, TimeSlot[]> = {};
    
    daysInWeek.forEach(day => {
      // Skip weekends (Saturday=6, Sunday=0)
      if (isWeekend(day)) return;
      
      // Skip past days
      if (isBefore(day, today)) return;
      
      const dateKey = format(day, 'yyyy-MM-dd');
      newSlots[dateKey] = [];
      
      SLOT_TIMES.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDatetime = setMinutes(setHours(day, hours), minutes);
        
        // Skip past slots on today
        if (isBefore(slotDatetime, new Date())) return;
        
        // Generate mock availability (random 0-6)
        const available = Math.floor(Math.random() * 7); // 0-6
        const status: 'available' | 'booked' | 'full' = 
          available === 0 ? 'full' : 
          available < 3 ? 'booked' : 
          'available';
        
        newSlots[dateKey].push({
          datetime: slotDatetime.toISOString(),
          available: available,
          capacity: MAX_CAPACITY,
          status: status
        });
      });
    });
    
    setSlots(newSlots);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'full') return;
    
    setSelectedSlot(slot.datetime);
    onChange(slot.datetime);
  };

  const handlePreviousWeek = () => {
    if (currentWeekOffset > 0) {
      setCurrentWeekOffset(currentWeekOffset - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekOffset < 2) { // Max 3 weeks forward
      setCurrentWeekOffset(currentWeekOffset + 1);
    }
  };

  const today = startOfDay(new Date());
  const weekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), currentWeekOffset);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const sortedDates = Object.keys(slots).sort();

  return (
    <div className="slot-picker bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handlePreviousWeek}
          disabled={currentWeekOffset === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← {t('slotPicker.previousWeek', 'Poprzedni tydzień')}
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(weekStart, 'd MMMM', { locale: currentLocale })} - {format(weekEnd, 'd MMMM yyyy', { locale: currentLocale })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('slotPicker.selectSlot', 'Wybierz termin testu praktycznego')}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleNextWeek}
          disabled={currentWeekOffset >= 2}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('slotPicker.nextWeek', 'Następny tydzień')} →
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border-2 border-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">{t('slotPicker.available', 'Dostępne')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">{t('slotPicker.limited', 'Ograniczona dostępność')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 border-2 border-gray-400"></div>
          <span className="text-gray-600 dark:text-gray-400">{t('slotPicker.full', 'Zapełniony')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">{t('slotPicker.selected', 'Wybrany')}</span>
        </div>
      </div>

      {/* Slots grid */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('slotPicker.noSlots', 'Brak dostępnych terminów w tym tygodniu. Spróbuj wybrać następny tydzień.')}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(dateKey => {
            const daySlots = slots[dateKey];
            const date = parseISO(dateKey);
            
            return (
              <div key={dateKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="font-medium text-gray-900 dark:text-white mb-3">
                  {format(date, 'EEEE, d MMMM', { locale: currentLocale })}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {daySlots.map(slot => {
                    const isSelected = selectedSlot === slot.datetime;
                    const slotTime = format(parseISO(slot.datetime), 'HH:mm');
                    
                    let bgColor = '';
                    let borderColor = '';
                    let textColor = 'text-gray-900 dark:text-white';
                    let cursor = 'cursor-pointer';
                    
                    if (isSelected) {
                      bgColor = 'bg-blue-100 dark:bg-blue-900';
                      borderColor = 'border-blue-500';
                    } else if (slot.status === 'full') {
                      bgColor = 'bg-gray-100 dark:bg-gray-700';
                      borderColor = 'border-gray-400';
                      textColor = 'text-gray-400';
                      cursor = 'cursor-not-allowed';
                    } else if (slot.status === 'booked') {
                      bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                      borderColor = 'border-yellow-500';
                    } else {
                      bgColor = 'bg-green-50 dark:bg-green-900/20';
                      borderColor = 'border-green-500';
                    }
                    
                    return (
                      <button
                        key={slot.datetime}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.status === 'full'}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all
                          ${bgColor} ${borderColor} ${textColor} ${cursor}
                          hover:shadow-md disabled:hover:shadow-none
                          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}
                      >
                        <div className="text-lg font-bold">{slotTime}</div>
                        <div className="text-xs mt-1">
                          {slot.status === 'full' ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {t('slotPicker.fullLabel', 'Zapełniony')}
                            </span>
                          ) : (
                            <span className={slot.available < 3 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                              {slot.available}/{slot.capacity} {t('slotPicker.spots', 'miejsc')}
                            </span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected slot display */}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('slotPicker.selectedSlotLabel', 'Wybrany termin')}:</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(parseISO(selectedSlot), 'EEEE, d MMMM yyyy, HH:mm', { locale: currentLocale })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedSlot(null);
                onChange('');
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              {t('slotPicker.clear', 'Wyczyść')}
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">{t('slotPicker.infoTitle', 'Ważne')}:</span> {t('slotPicker.infoText', 'Testy praktyczne odbywają się od poniedziałku do piątku w godzinach 09:00, 11:00 i 14:00. Maksymalnie 6 osób na slot. Po wysłaniu formularza otrzymasz email z potwierdzeniem terminu w ciągu 24h.')}
        </p>
      </div>
    </div>
  );
};
