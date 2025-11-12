/**
 * TestSchedulerPageNew - COMPLETE REDESIGN
 * Calendar view for managing test appointment slots
 *
 * Features:
 * - 7-day calendar grid (Mon-Sun)
 * - Color-coded slot status (🟢 available, 🟡 partial, 🔴 full)
 * - Create/Edit/Delete slot modals
 * - Assign worker to slot modal
 * - 4 statistics cards
 * - Week navigation
 */

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, User } from "lucide-react";
import {
  testAppointmentService,
  type TestSlot,
  type SlotFormData,
  type SlotStats,
  type AssignedWorker,
} from "../../services/testAppointmentService";
import { useAuth } from "../../contexts/AuthContext";

export const TestSchedulerPageNew: React.FC = () => {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date())
  );
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [stats, setStats] = useState<SlotStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TestSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotWorkers, setSlotWorkers] = useState<AssignedWorker[]>([]);
  const [approvedApps, setApprovedApps] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<SlotFormData>({
    test_date: "",
    duration_minutes: 120,
    capacity: 10,
    location: "Amsterdam Warehouse",
    test_type: "ZZP Exam",
    examiner_name: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [weekSlots, statsData] = await Promise.all([
        testAppointmentService.getWeekSlots(currentWeekStart),
        testAppointmentService.getSlotStats(),
      ]);
      setSlots(weekSlots);
      setStats(statsData);
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Handlers
  const handleCreateSlot = async () => {
    try {
      await testAppointmentService.createTestSlot(formData);
      setShowCreateModal(false);
      resetForm();
      await loadData();
      alert("✅ Slot utworzony!");
    } catch (error: any) {
      alert("❌ Błąd: " + error.message);
    }
  };

  const handleUpdateSlot = async () => {
    if (!selectedSlot) return;
    try {
      await testAppointmentService.updateTestSlot(selectedSlot.id, formData);
      setShowEditModal(false);
      resetForm();
      await loadData();
      alert("✅ Slot zaktualizowany!");
    } catch (error: any) {
      alert("❌ Błąd: " + error.message);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten slot?")) return;
    try {
      await testAppointmentService.deleteTestSlot(slotId);
      await loadData();
      alert("✅ Slot usunięty!");
    } catch (error: any) {
      alert("❌ " + error.message);
    }
  };

  const handleAssignWorker = async (
    workerId: string,
    workerName: string,
    workerEmail: string
  ) => {
    if (!selectedSlot) return;
    try {
      await testAppointmentService.assignWorkerToSlot(
        workerId,
        workerName,
        workerEmail,
        selectedSlot.test_date,
        selectedSlot.location
      );
      setShowAssignModal(false);
      await loadData();
      alert(`✅ ${workerName} został przypisany do slotu!`);
    } catch (error: any) {
      alert("❌ " + error.message);
    }
  };

  const openCreateModal = (date: string) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      test_date: date,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (slot: TestSlot) => {
    setSelectedSlot(slot);
    setFormData({
      test_date: slot.test_date,
      duration_minutes: slot.duration_minutes || 120,
      capacity: slot.capacity || 10,
      location: slot.location || "Amsterdam Warehouse",
      test_type: slot.test_type || "ZZP Exam",
      examiner_name: slot.examiner_name || "",
      notes: "",
    });
    setShowEditModal(true);
  };

  const openAssignModal = async (slot: TestSlot) => {
    setSelectedSlot(slot);
    try {
      const [workers, apps] = await Promise.all([
        testAppointmentService.getSlotWorkers(slot.test_date, slot.location),
        testAppointmentService.getApprovedApplications(),
      ]);
      setSlotWorkers(workers);
      setApprovedApps(apps);
      setShowAssignModal(true);
    } catch (error) {
      console.error("❌ Error loading assign data:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      test_date: "",
      duration_minutes: 120,
      capacity: 10,
      location: "Amsterdam Warehouse",
      test_type: "ZZP Exam",
      examiner_name: "",
      notes: "",
    });
    setSelectedSlot(null);
  };

  // Calendar helpers
  const getDaysOfWeek = (): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSlotsForDay = (day: Date): TestSlot[] => {
    const dayStr = day.toISOString().split("T")[0];
    return slots.filter((slot) => slot.test_date.startsWith(dayStr));
  };

  const getDayColor = (daySlots: TestSlot[]): string => {
    if (daySlots.length === 0) return "bg-gray-100";

    const totalCapacity = daySlots.reduce(
      (sum, slot) => sum + (slot.capacity || 10),
      0
    );
    const totalBooked = daySlots.reduce(
      (sum, slot) => sum + (slot.booked_count || 0),
      0
    );
    const fillRate = totalCapacity > 0 ? totalBooked / totalCapacity : 0;

    if (fillRate >= 0.9) return "bg-red-50 border-red-300";
    if (fillRate >= 0.5) return "bg-yellow-50 border-yellow-300";
    return "bg-green-50 border-green-300";
  };

  const getDayStatus = (
    daySlots: TestSlot[]
  ): { icon: string; label: string } => {
    if (daySlots.length === 0) return { icon: "⚪", label: "Brak slotów" };

    const totalCapacity = daySlots.reduce(
      (sum, slot) => sum + (slot.capacity || 10),
      0
    );
    const totalBooked = daySlots.reduce(
      (sum, slot) => sum + (slot.booked_count || 0),
      0
    );
    const fillRate = totalCapacity > 0 ? totalBooked / totalCapacity : 0;

    if (fillRate >= 0.9) return { icon: "🔴", label: "Pełne" };
    if (fillRate >= 0.5) return { icon: "🟡", label: "Średnie" };
    return { icon: "🟢", label: "Wolne" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Ładowanie kalendarza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Harmonogram Egzaminów ZZP
          </h1>
          <p className="text-gray-600">
            Zarządzaj terminami egzaminów i przypisuj kandydatów do slotów
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Sloty ten tydzień
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.this_week_slots}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Wolne miejsca
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.available_capacity}
                  </p>
                </div>
                <span className="text-4xl">➕</span>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Zaplanowane osoby
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.booked_workers}
                  </p>
                </div>
                <User className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">
                    Ukończone
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {stats.completed_tests}
                  </p>
                </div>
                <span className="text-4xl">✅</span>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>◀️</span>
              Poprzedni tydzień
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {formatWeekRange(currentWeekStart)}
            </h2>

            <button
              onClick={goToNextWeek}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Następny tydzień
              <span>▶️</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {getDaysOfWeek().map((day, index) => {
            const daySlots = getSlotsForDay(day);
            const dayColor = getDayColor(daySlots);
            const dayStatus = getDayStatus(daySlots);
            const dayNames = [
              "Poniedziałek",
              "Wtorek",
              "Środa",
              "Czwartek",
              "Piątek",
              "Sobota",
              "Niedziela",
            ];

            return (
              <div
                key={index}
                className={`${dayColor} border rounded-lg p-4 min-h-[400px] flex flex-col`}
              >
                {/* Day Header */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600">
                    {dayNames[index]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {day.getDate()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.toLocaleDateString("pl-PL", { month: "long" })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl">{dayStatus.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {dayStatus.label}
                    </span>
                  </div>
                </div>

                {/* Add Slot Button */}
                <button
                  onClick={() =>
                    openCreateModal(
                      day.toISOString().split("T")[0] + "T10:00:00"
                    )
                  }
                  className="w-full mb-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  Dodaj slot
                </button>

                {/* Slots List */}
                <div className="space-y-2 flex-1">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white border border-gray-300 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(slot.test_date).toLocaleTimeString(
                            "pl-PL",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {slot.booked_count || 0}/{slot.capacity || 10}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {slot.location}
                      </p>

                      {slot.examiner_name && (
                        <p className="text-xs text-gray-600 mb-2">
                          👤 {slot.examiner_name}
                        </p>
                      )}

                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => openAssignModal(slot)}
                          className="flex-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                          title="Przypisz osobę"
                        >
                          👤➕
                        </button>
                        <button
                          onClick={() => openEditModal(slot)}
                          className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                          title="Edytuj"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <SlotFormModal
            title={showCreateModal ? "Utwórz nowy slot" : "Edytuj slot"}
            formData={formData}
            setFormData={setFormData}
            onSubmit={showCreateModal ? handleCreateSlot : handleUpdateSlot}
            onCancel={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          />
        )}

        {/* Assign Worker Modal */}
        {showAssignModal && selectedSlot && (
          <AssignWorkerModal
            slot={selectedSlot}
            workers={slotWorkers}
            approvedApps={approvedApps}
            onAssign={handleAssignWorker}
            onCancel={() => setShowAssignModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components
const SlotFormModal: React.FC<{
  title: string;
  formData: SlotFormData;
  setFormData: React.Dispatch<React.SetStateAction<SlotFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ title, formData, setFormData, onSubmit, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data i godzina
            </label>
            <input
              type="datetime-local"
              value={formData.test_date.slice(0, 16)}
              onChange={(e) =>
                setFormData({ ...formData, test_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Czas trwania (minuty)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration_minutes: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pojemność (liczba osób)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokalizacja
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ testu
            </label>
            <select
              value={formData.test_type}
              onChange={(e) =>
                setFormData({ ...formData, test_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ZZP Exam">ZZP Exam</option>
              <option value="Skills Assessment">Skills Assessment</option>
              <option value="Language Test">Language Test</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Egzaminator (opcjonalnie)
            </label>
            <input
              type="text"
              value={formData.examiner_name}
              onChange={(e) =>
                setFormData({ ...formData, examiner_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignWorkerModal: React.FC<{
  slot: TestSlot;
  workers: AssignedWorker[];
  approvedApps: any[];
  onAssign: (workerId: string, workerName: string, workerEmail: string) => void;
  onCancel: () => void;
}> = ({ slot, workers, approvedApps, onAssign, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Przypisz osobę do slotu</h2>
        <p className="text-gray-600 mb-6">
          {new Date(slot.test_date).toLocaleDateString("pl-PL")} o{" "}
          {new Date(slot.test_date).toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Currently Assigned */}
        {workers.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Przypisane osoby ({workers.length}/{slot.capacity})
            </h3>
            <div className="space-y-2">
              {workers.map((worker) => (
                <div
                  key={worker.worker_id}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <User className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {worker.worker_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {worker.worker_email}
                    </p>
                  </div>
                  <span className="text-green-600 font-medium">
                    ✓ Przypisany
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Candidates */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Dostępni kandydaci ({approvedApps.length})
          </h3>
          {approvedApps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Brak zatwierdzonych wniosków
            </p>
          ) : (
            <div className="space-y-2">
              {approvedApps.map((app: any) => {
                const workerData = app.workers || {};
                const workerId = app.worker_id;
                const workerName =
                  `${workerData.first_name || ""} ${
                    workerData.last_name || ""
                  }`.trim() || app.full_name;
                const workerEmail = workerData.email || app.email;

                const isAlreadyAssigned = workers.some(
                  (w) => w.worker_id === workerId
                );

                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{workerName}</p>
                      <p className="text-sm text-gray-600">{workerEmail}</p>
                      {app.specializations &&
                        app.specializations.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {app.specializations.join(", ")}
                          </p>
                        )}
                    </div>
                    {isAlreadyAssigned ? (
                      <span className="text-green-600 font-medium">
                        Już przypisany
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onAssign(workerId, workerName, workerEmail)
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Przypisz
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const startStr = start.toLocaleDateString("pl-PL", options);
  const endStr = end.toLocaleDateString("pl-PL", options);

  return `${startStr} - ${endStr}`;
}

export default TestSchedulerPageNew;
