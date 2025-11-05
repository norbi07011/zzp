import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { supabase } from '@/lib/supabase';

interface ReviewFormProps {
  workerId: string;
  employerId: string;
  workerName: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  workerId,
  employerId,
  workerName,
  onReviewSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Proszę wybrać ocenę (gwiazdki)');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Komentarz musi mieć co najmniej 10 znaków');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('[REVIEW] Submitting review:', {
        reviewer_id: employerId,
        reviewee_id: workerId,
        worker_id: workerId,
        employer_id: employerId,
        rating,
        comment: comment.trim()
      });

      const { data, error: submitError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: employerId,
          reviewee_id: workerId,
          worker_id: workerId,
          employer_id: employerId,
          rating,
          comment: comment.trim(),
          status: 'pending'
        })
        .select();

      if (submitError) {
        console.error('[REVIEW] Error submitting review:', submitError);
        
        if (submitError.code === '23505') {
          setError('Już wystawiłeś opinię temu pracownikowi');
        } else {
          setError('Błąd podczas zapisywania opinii: ' + submitError.message);
        }
        return;
      }

      console.log('[REVIEW] Review submitted successfully:', data);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent
      onReviewSubmitted();
      
    } catch (err) {
      console.error('[REVIEW] Unexpected error:', err);
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dodaj opinię o {workerName}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ocena *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            readonly={false}
            showLabel={true}
            size="lg"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komentarz *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Opisz swoje doświadczenia z tym pracownikiem..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/500 znaków (minimum 10)
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Dodaj opinię'}
          </button>
        </div>
      </form>
    </div>
  );
};