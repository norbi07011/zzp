import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  size = 'md',
  readonly = false,
  showLabel = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStars = () => {
    return Array.from({ length: maxStars }, (_, index) => {
      const isFilled = index < rating;
      const isHalfFilled = rating > index && rating < index + 1;

      return (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(index)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            transition-all duration-200
            ${!readonly ? 'hover:text-yellow-400' : ''}
          `}
        >
          {isFilled ? (
            <svg
              className="fill-current text-yellow-400"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ) : isHalfFilled ? (
            <svg
              className="fill-current text-yellow-400"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`half-fill-${index}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#half-fill-${index})`}
                d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
              />
            </svg>
          ) : (
            <svg
              className="fill-current text-gray-300"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          )}
        </button>
      );
    });
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Brak oceny';
    if (rating <= 1) return 'Bardzo słaba';
    if (rating <= 2) return 'Słaba';
    if (rating <= 3) return 'Przeciętna';
    if (rating <= 4) return 'Dobra';
    return 'Excellent';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {renderStars()}
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-700">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({getRatingLabel(rating)})
          </span>
        </div>
      )}
    </div>
  );
};