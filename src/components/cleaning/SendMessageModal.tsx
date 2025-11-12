import React, { useState } from "react";
import { CleaningCompany } from "../../../types";
import { sendMessage } from "../../services/messages";
import { useAuth } from "../../../contexts/AuthContext";

interface SendMessageModalProps {
  company: CleaningCompany;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  company,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"inquiry" | "other">("inquiry");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Musisz być zalogowany aby wysłać wiadomość");
      return;
    }

    if (!subject.trim() || !body.trim()) {
      setError("Tytuł i treść wiadomości są wymagane");
      return;
    }

    if (!company.profile_id) {
      setError("Nie można wysłać wiadomości - brak ID profilu firmy");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await sendMessage(
        user.id,
        company.profile_id,
        subject.trim(),
        body.trim(),
        category,
        "normal"
      );

      // Reset form
      setSubject("");
      setBody("");
      setCategory("inquiry");

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject("");
      setBody("");
      setCategory("inquiry");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Wyślij wiadomość</h2>
              <p className="text-blue-100 text-sm mt-1">
                Do: {company.company_name}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={sending}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "inquiry" | "other")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            >
              <option value="inquiry">Zapytanie ofertowe</option>
              <option value="other">Inne</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="np. Zapytanie o sprzątanie biura"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {subject.length}/200 znaków
            </p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wiadomość <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Opisz szczegóły swojego zapytania..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={sending}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {body.length}/2000 znaków
            </p>
          </div>

          {/* Helper text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Wskazówki:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Opisz rodzaj pracy (np. sprzątanie po remoncie, mycie okien)
                  </li>
                  <li>Podaj preferowany termin i częstotliwość</li>
                  <li>Określ powierzchnię lub szacowany czas pracy</li>
                  <li>Firma odpowie na Twoje zapytanie wkrótce</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={sending}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={sending || !subject.trim() || !body.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Wysyłanie...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Wyślij wiadomość
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;
