import React from 'react';
import { WeeklyAvailability, DayOfWeek, getDayShortLabel } from '../../../types';

interface AvailabilityCalendarProps {
  availability: WeeklyAvailability;
  onChange?: (newAvailability: WeeklyAvailability) => void;
  editable?: boolean;
  compact?: boolean;
}

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  onChange,
  editable = false,
  compact = false
}) => {
  const handleToggleDay = (day: DayOfWeek) => {
    if (!editable || !onChange) return;
    
    onChange({
      ...availability,
      [day]: !availability[day]
    });
  };

  const availableCount = Object.values(availability).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Dostępność w tygodniu
        </h3>
        <span className="text-xs text-gray-500">
          {availableCount} {availableCount === 1 ? 'dzień' : 'dni'}
        </span>
      </div>

      {/* Calendar Grid */}
      <div className={compact ? 'flex gap-2' : 'grid grid-cols-7 gap-2'}>
        {DAYS.map(day => {
          const isAvailable = availability[day];
          const dayLabel = getDayShortLabel(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleToggleDay(day)}
              disabled={!editable}
              className={`
                ${compact ? 'w-10 h-10' : 'aspect-square'}
                flex flex-col items-center justify-center
                rounded-lg border-2 transition-all
                ${isAvailable 
                  ? 'bg-blue-500 border-blue-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-400'
                }
                ${editable 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'cursor-default'
                }
                ${!editable && isAvailable 
                  ? 'shadow-sm' 
                  : ''
                }
              `}
            >
              <span className={compact ? 'text-xs font-medium' : 'text-sm font-medium'}>
                {dayLabel}
              </span>
              {!compact && (
                <span className="text-xs mt-1">
                  {isAvailable ? '✓' : '—'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend (tylko w editable mode) */}
      {editable && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Dostępny</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-gray-200"></div>
            <span>Niedostępny</span>
          </div>
        </div>
      )}

      {/* Helper text */}
      {editable && (
        <p className="text-xs text-gray-500 italic">
          Kliknij na dzień aby zmienić dostępność
        </p>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
