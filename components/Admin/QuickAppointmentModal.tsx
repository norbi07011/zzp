// @ts-nocheck
import { useState } from "react";
import { X } from "lucide-react";

interface QuickAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const QuickAppointmentModal = ({
  isOpen,
  onClose,
  onSave,
}: QuickAppointmentModalProps) => {
  const [formData, setFormData] = useState({
    title: "", // "Spotkanie z babcią", "Przegląd projektu", etc.
    date: "",
    time: "",
    duration_minutes: 60,
    location: "",
    notes: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.title || !formData.date || !formData.time) {
      alert("Wypełnij tytuł, datę i godzinę!");
      return;
    }

    // Combine date + time into test_date timestamp
    const test_date = `${formData.date}T${formData.time}:00+00:00`;

    // Prepare data for createAppointment
    const appointmentData = {
      test_date,
      duration_minutes: parseInt(formData.duration_minutes as any),
      location: formData.location || null,
      notes: `${formData.title}${
        formData.notes ? "\n\n" + formData.notes : ""
      }`,
      status: "pending",
      appointment_type: "meeting", // Generic meeting (not test)
      priority: formData.priority,
      // worker_id and client_id are NULL (optional meeting)
      worker_id: null,
      client_id: null,
      reminder_sms: false,
      reminder_email: false,
    };

    onSave(appointmentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            📅 Szybkie Spotkanie
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tytuł spotkania *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="np. Spotkanie z babcią, Przegląd projektu..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Godzina *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>

          {/* Duration + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                min="15"
                step="15"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priorytet
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="low" className="bg-slate-800">
                  🟢 Niski
                </option>
                <option value="normal" className="bg-slate-800">
                  ⚪ Normalny
                </option>
                <option value="high" className="bg-slate-800">
                  🟠 Wysoki
                </option>
                <option value="urgent" className="bg-slate-800">
                  🔴 Pilny
                </option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lokalizacja (opcjonalne)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="np. Biuro, Zoom, Dom klienta..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dodatkowe notatki (opcjonalne)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Dodatkowe informacje..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
            >
              ✅ Zapisz spotkanie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
