/**
 * =====================================================
 * REVIEW CARD - Single Review Display with Response
 * =====================================================
 * Features: Star rating, employer info, review text, company response
 */

import { useState } from 'react';
import type { CleaningReview } from '../../../types';

interface ReviewCardProps {
  review: CleaningReview;
  onRespond?: (reviewId: string, responseText: string) => Promise<void>;
  showResponseForm?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onRespond,
  showResponseForm = true,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [responseText, setResponseText] = useState(review.response_text || '');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">{rating}.0</span>
      </div>
    );
  };

  const handleSubmitResponse = async () => {
    if (!onRespond || !responseText.trim()) return;

    try {
      setSubmitting(true);
      await onRespond(review.id, responseText);
      setShowReplyForm(false);
      alert('✅ Odpowiedź dodana!');
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('❌ Nie udało się dodać odpowiedzi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Employer Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {review.employer?.company_name?.[0]?.toUpperCase() || 'E'}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.employer?.company_name || 'Pracodawca'}
              </h4>
              <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
            </div>
          </div>

          {/* Rating */}
          {renderStars(review.rating)}
        </div>

        {/* Work Details Badge */}
        {review.work_date && (
          <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
            📅 {formatDate(review.work_date)}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        {review.review_text && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.review_text}
          </p>
        )}

        {/* Work Metadata */}
        {(review.work_type || review.work_duration_hours) && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            {review.work_type && (
              <span className="flex items-center gap-1">
                🏗️ {review.work_type}
              </span>
            )}
            {review.work_duration_hours && (
              <span className="flex items-center gap-1">
                ⏱️ {review.work_duration_hours}h
              </span>
            )}
          </div>
        )}
      </div>

      {/* Company Response */}
      {review.response_text ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-blue-900">Odpowiedź firmy</span>
            {review.response_date && (
              <span className="text-xs text-blue-600">
                • {formatDate(review.response_date)}
              </span>
            )}
          </div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.response_text}</p>
        </div>
      ) : (
        showResponseForm && onRespond && (
          <div className="mt-4">
            {!showReplyForm ? (
              <button
                onClick={() => setShowReplyForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Odpowiedz na opinię
              </button>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-2">Twoja odpowiedź</h5>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Dziękujemy za opinię! ..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={submitting}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setResponseText(review.response_text || '');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={submitting}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={submitting || !responseText.trim()}
                    className={`
                      flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                      ${submitting || !responseText.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Wysyłanie...
                      </>
                    ) : (
                      'Opublikuj odpowiedź'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ReviewCard;
