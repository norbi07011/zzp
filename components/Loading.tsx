import { createPortal } from 'react-dom';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({ isLoading, message, fullScreen = true }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  const content = (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-black/30 backdrop-blur-sm flex items-center justify-center z-50`}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 max-w-sm mx-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <svg className="animate-spin w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        {/* Message */}
        {message && (
          <p className="text-gray-700 font-medium text-center">{message}</p>
        )}

        {/* Pulsing dots */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  return fullScreen ? createPortal(content, document.body) : content;
};

// Simple inline spinner component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
}

export const Spinner = ({ size = 'md', color = 'blue' }: SpinnerProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-600';
    }
  };

  return (
    <svg className={`animate-spin ${getSizeClass()} ${getColorClass()}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Skeleton loader for content placeholders
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton = ({ variant = 'text', width, height, className = '' }: SkeletonProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
    }
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${getVariantClass()} ${className}`}
      style={{ width, height }}
      aria-label="Laden..."
      role="status"
    />
  );
};

// Card skeleton for dashboard cards
export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="rectangular" width="120px" height="24px" />
      <Skeleton variant="circular" width="40px" height="40px" />
    </div>
    <Skeleton variant="text" width="60%" />
    <div className="space-y-2">
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="90%" />
    </div>
  </div>
);

// Table skeleton for data tables
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="120px" height="20px" />
        ))}
      </div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="120px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
