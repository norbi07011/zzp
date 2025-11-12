import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import cleaningCompanyService from "../../services/cleaningCompanyService";
import type { CleaningCompany } from "../../../types";

interface LeaveReviewModalProps {
  company: CleaningCompany;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * MODUŁ 9: System opinii dla pracodawców
 *
 * Funkcjonalność:
 * - Pracodawca może wystawić opinię firmie sprzątającej
 * - Weryfikacja czy już wystawił opinię (zapobieganie duplikatom)
 * - Rating 1-5 gwiazdek + opcjonalny tekst
 * - Szczegóły pracy: data, czas trwania, typ
 * - Auto-update average_rating przez trigger
 */
const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  company,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workDurationHours, setWorkDurationHours] = useState("");
  const [workType, setWorkType] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<boolean>(false);
  const [checkingReview, setCheckingReview] = useState(true);

  // Sprawdź czy pracodawca już wystawił opinię
  useEffect(() => {
    if (isOpen && user?.id) {
      checkExistingReview();
    }
  }, [isOpen, user?.id]);

  const checkExistingReview = async () => {
    if (!user?.id) return;

    setCheckingReview(true);
    try {
      // Najpierw pobierz employer_id z tabeli employers
      const { data: employerData } = await supabase
        .from("employers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!employerData) {
        setError(
          "Nie znaleziono profilu pracodawcy. Czy jesteś zalogowany jako employer?"
        );
        setCheckingReview(false);
        return;
      }

      // Sprawdź czy istnieje opinia
      const review = await cleaningCompanyService.getMyReview(
        company.id,
        employerData.id
      );
      setExistingReview(!!review);
    } catch (err) {
      console.error("Error checking existing review:", err);
      setError("Błąd podczas sprawdzania opinii");
    } finally {
      setCheckingReview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Walidacja
    if (!user) {
      setError("Musisz być zalogowany aby wystawić opinię");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Ocena musi być w zakresie 1-5");
      return;
    }

    if (existingReview) {
      setError("Już wystawiłeś opinię tej firmie");
      return;
    }

    setSubmitting(true);

    try {
      // Pobierz employer_id
      const { data: employerData } = await supabase
        .from("employers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!employerData) {
        throw new Error("Nie znaleziono profilu pracodawcy");
      }

      // Dodaj opinię
      await cleaningCompanyService.addReview({
        cleaningCompanyId: company.id,
        employerId: employerData.id,
        rating,
        reviewText: reviewText.trim() || undefined,
        workDate: workDate || undefined,
        workDurationHours: workDurationHours
          ? parseFloat(workDurationHours)
          : undefined,
        workType: workType || undefined,
      });

      // Reset formularza
      setRating(5);
      setReviewText("");
      setWorkDate("");
      setWorkDurationHours("");
      setWorkType("");

      // Success callback
      if (onSuccess) {
        onSuccess();
      }

      // Pokaż komunikat sukcesu
      alert("✅ Opinia została dodana!");
      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(
        err instanceof Error ? err.message : "Błąd podczas dodawania opinii"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setRating(5);
    setHoverRating(0);
    setReviewText("");
    setWorkDate("");
    setWorkDurationHours("");
    setWorkType("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ⭐ Wystaw opinię
            </h2>
            <p className="text-sm text-gray-600 mt-1">{company.company_name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {checkingReview && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Sprawdzam możliwość wystawienia opinii...
              </p>
            </div>
          )}

          {/* Already Reviewed */}
          {!checkingReview && existingReview && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="font-medium">⚠️ Już wystawiłeś opinię tej firmie</p>
              <p className="text-sm mt-1">
                Każdy pracodawca może wystawić tylko jedną opinię dla każdej
                firmy.
              </p>
            </div>
          )}

          {/* Review Form */}
          {!checkingReview && !existingReview && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">❌ {error}</p>
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocena <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-5xl transition-transform hover:scale-110"
                    >
                      {star <= (hoverRating || rating) ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 5 && "⭐⭐⭐⭐⭐ Doskonale!"}
                  {rating === 4 && "⭐⭐⭐⭐ Bardzo dobrze"}
                  {rating === 3 && "⭐⭐⭐ Dobrze"}
                  {rating === 2 && "⭐⭐ Słabo"}
                  {rating === 1 && "⭐ Bardzo słabo"}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treść opinii (opcjonalnie)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="Opisz swoją współpracę z firmą..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Opcjonalne, ale mile widziane 😊</span>
                  <span>{reviewText.length}/2000</span>
                </div>
              </div>

              {/* Work Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  📋 Szczegóły pracy (opcjonalnie)
                </h3>

                {/* Work Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data wykonania pracy
                  </label>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Work Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Czas trwania (godziny)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={workDurationHours}
                    onChange={(e) => setWorkDurationHours(e.target.value)}
                    placeholder="np. 4.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Work Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rodzaj pracy
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Wybierz rodzaj...</option>
                    <option value="after_construction">
                      Sprzątanie po remoncie
                    </option>
                    <option value="deep_cleaning">Gruntowne sprzątanie</option>
                    <option value="regular_cleaning">
                      Regularne sprzątanie
                    </option>
                    <option value="office_cleaning">Sprzątanie biura</option>
                    <option value="window_cleaning">Mycie okien</option>
                    <option value="carpet_cleaning">Czyszczenie dywanów</option>
                    <option value="other">Inne</option>
                  </select>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  💡 Wskazówki
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Bądź uczciwy i obiektywny</li>
                  <li>✓ Opisz konkretne aspekty usługi</li>
                  <li>✓ Opinia pomaga innym pracodawcom</li>
                  <li>✓ Firma może odpowiedzieć na opinię</li>
                </ul>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!checkingReview && !existingReview && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || rating < 1}
              className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                submitting || rating < 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "⏳ Wysyłam..." : "⭐ Wystaw opinię"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveReviewModal;
