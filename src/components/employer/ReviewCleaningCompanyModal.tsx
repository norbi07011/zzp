import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { StarRating } from "./ReviewWorkerModal";

interface ReviewCleaningCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  employerId: string;
  onSuccess?: () => void;
}

export const ReviewCleaningCompanyModal: React.FC<
  ReviewCleaningCompanyModalProps
> = ({ isOpen, onClose, companyId, companyName, employerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workDurationHours, setWorkDurationHours] = useState("");
  const [workType, setWorkType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Proszę wystawić ocenę (gwiazdki)");
      return;
    }

    if (!reviewText.trim()) {
      setError("Proszę dodać treść opinii");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from("cleaning_reviews")
        .insert({
          cleaning_company_id: companyId,
          employer_id: employerId,
          rating,
          review_text: reviewText.trim(),
          work_date: workDate || null,
          work_duration_hours: workDurationHours
            ? parseFloat(workDurationHours)
            : null,
          work_type: workType.trim() || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("✅ Cleaning company review created:", data);

      // Success
      onSuccess?.();
      onClose();

      // Reset form
      setRating(0);
      setReviewText("");
      setWorkDate("");
      setWorkDurationHours("");
      setWorkType("");
    } catch (err: any) {
      console.error("Error submitting review:", err);

      // Handle duplicate review error (unique constraint violation)
      if (
        err.code === "23505" &&
        err.message?.includes("unique_employer_review")
      ) {
        setError(
          "Już wystawiłeś opinię dla tej firmy. Możesz edytować swoją istniejącą opinię w panelu pracodawcy."
        );
      } else {
        setError(err.message || "Nie udało się wystawić opinii");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            ⭐ Wystaw opinię: {companyName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Wskazówka:</strong> Twoja opinia pomaga innym
              pracodawcom w wyborze firmy sprzątającej. Bądź szczery i
              konstruktywny.
            </p>
          </div>

          {/* Rating */}
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            label="Ogólna ocena"
          />

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treść opinii <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              placeholder="Opisz swoje doświadczenia współpracy: jakość usług, terminowość, profesjonalizm, komunikacja..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length} znaków
            </p>
          </div>

          {/* Work Details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Szczegóły zlecenia (opcjonalne)
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data wykonania
                </label>
                <input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Czas pracy (godziny)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={workDurationHours}
                  onChange={(e) => setWorkDurationHours(e.target.value)}
                  placeholder="np. 8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ prac
              </label>
              <input
                type="text"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                placeholder="np. Sprzątanie po remoncie, Czyszczenie okien"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !reviewText.trim()}
              className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "⏳ Wysyłanie..." : "⭐ Wystaw opinię"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
