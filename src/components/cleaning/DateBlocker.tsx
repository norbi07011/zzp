/**
 * =====================================================
 * DATE BLOCKER COMPONENT
 * =====================================================
 * Allows blocking specific dates with reason (vacation, holiday, fully booked)
 * Features: Calendar picker, reason input, type selection, list of blocked dates
 */

import { useState } from "react";
import type { UnavailableDate, UnavailableDateType } from "../../../types";

interface DateBlockerProps {
  blockedDates: UnavailableDate[];
  onBlock: (date: UnavailableDate) => void;
  onUnblock: (date: string) => void;
}

const DateBlocker = ({
  blockedDates,
  onBlock,
  onUnblock,
}: DateBlockerProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [endDate, setEndDate] = useState(""); // NOWE: Data końcowa (opcjonalnie)
  const [reason, setReason] = useState("");
  const [type, setType] = useState<UnavailableDateType>("vacation");
  const [showForm, setShowForm] = useState(false);

  const handleBlock = () => {
    if (!selectedDate) {
      alert("Wybierz datę początkową");
      return;
    }

    if (!reason.trim()) {
      alert("Podaj powód blokady");
      return;
    }

    // Validate date range
    if (endDate && endDate < selectedDate) {
      alert("Data końcowa nie może być wcześniejsza niż data początkowa");
      return;
    }

    // Generate all dates in range
    const datesToBlock: string[] = [];
    const startDateObj = new Date(selectedDate);
    const endDateObj = endDate ? new Date(endDate) : startDateObj;

    for (
      let d = new Date(startDateObj);
      d <= endDateObj;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];

      // Check if already blocked
      if (blockedDates.some((bd) => bd.date === dateStr)) {
        if (
          confirm(
            `Data ${dateStr} jest już zablokowana. Kontynuować z pozostałymi datami?`
          )
        ) {
          continue;
        } else {
          return;
        }
      }

      datesToBlock.push(dateStr);
    }

    // Block all dates in range
    datesToBlock.forEach((dateStr) => {
      onBlock({
        date: dateStr,
        reason: reason.trim(),
        type,
      });
    });

    // Reset form
    setSelectedDate("");
    setEndDate("");
    setReason("");
    setType("vacation");
    setShowForm(false);
  };

  const getTypeLabel = (type: UnavailableDateType): string => {
    const labels: Record<UnavailableDateType, string> = {
      vacation: "Urlop",
      holiday: "Święto",
      fully_booked: "Zajęte",
      other: "Inne",
    };
    return labels[type];
  };

  const getTypeColor = (type: UnavailableDateType): string => {
    const colors: Record<UnavailableDateType, string> = {
      vacation: "bg-blue-100 text-blue-800",
      holiday: "bg-red-100 text-red-800",
      fully_booked: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* ADD BLOCKED DATE BUTTON */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Zablokuj datę
        </button>
      )}

      {/* BLOCK DATE FORM */}
      {showForm && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Nowa blokada daty</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data początkowa
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date Picker (NOWE!) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data końcowa{" "}
              <span className="text-xs text-gray-500">
                (opcjonalnie - dla zakresu dat)
              </span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={selectedDate || today}
              disabled={!selectedDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {endDate && selectedDate
                ? `Zostaną zablokowane wszystkie dni od ${new Date(
                    selectedDate
                  ).toLocaleDateString("pl-PL")} do ${new Date(
                    endDate
                  ).toLocaleDateString("pl-PL")}`
                : "Pozostaw puste jeśli chcesz zablokować tylko jeden dzień"}
            </p>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ blokady
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as UnavailableDateType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vacation">🏖️ Urlop</option>
              <option value="holiday">🎄 Święto</option>
              <option value="fully_booked">📅 Zajęte (pełna rezerwacja)</option>
              <option value="other">📝 Inne</option>
            </select>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Powód
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. Wakacje w Hiszpanii, Boże Narodzenie..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/100 znaków
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBlock}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Zablokuj
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedDate("");
                setEndDate("");
                setReason("");
                setType("vacation");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* LIST OF BLOCKED DATES */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          � Niedostępne terminy
          <span className="text-sm font-normal text-gray-500">
            ({blockedDates.length})
          </span>
        </h3>

        {blockedDates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">Brak niedostępnych terminów</p>
            <p className="text-gray-400 text-xs mt-1">
              Zaznacz daty lub okresy kiedy nie przyjmujesz nowych zleceń
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedDates
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((blocked) => (
                <div
                  key={blocked.date}
                  className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800">
                        {formatDate(blocked.date)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                          blocked.type
                        )}`}
                      >
                        {getTypeLabel(blocked.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{blocked.reason}</p>
                  </div>
                  <button
                    onClick={() => onUnblock(blocked.date)}
                    className="ml-4 text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Usuń blokadę"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateBlocker;
