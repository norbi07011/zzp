import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    color = 'primary',
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const colorClasses = {
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        white: 'text-white',
        gray: 'text-gray-400'
    };

    return (
        <ArrowPathIcon 
            className={`
                ${sizeClasses[size]} 
                ${colorClasses[color]} 
                animate-spin 
                ${className}
            `} 
        />
    );
};

interface SkeletonCardProps {
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
    return (
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-premium rounded-3xl shadow-premium border border-white/40 dark:border-slate-700/40 p-6 animate-pulse ${className}`}>
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-1/2" />
                </div>
            </div>
            
            {/* Content Lines */}
            <div className="space-y-3">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-full" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-5/6" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-4/6" />
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16" />
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20" />
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16" />
            </div>
        </div>
    );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
    icon = '📭', 
    title, 
    description, 
    action,
    className = '' 
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="text-8xl mb-6 animate-bounce-slow opacity-50">
                {icon}
            </div>
            <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-8 py-4 bg-gradient-indigo text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
    title = 'Ups! Coś poszło nie tak',
    message,
    onRetry,
    className = '' 
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="text-8xl mb-6">
                😞
            </div>
            <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-8 py-4 bg-white dark:bg-slate-700 border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                >
                    🔄 Spróbuj ponownie
                </button>
            )}
        </div>
    );
};

interface LoadingOverlayProps {
    message?: string;
    className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
    message = 'Ładowanie...', 
    className = '' 
}) => {
    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-scale-in">
                <LoadingSpinner size="lg" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {message}
                </p>
            </div>
        </div>
    );
};

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
    progress, 
    label,
    showPercentage = true,
    className = '' 
}) => {
    const normalizedProgress = Math.min(100, Math.max(0, progress));
    
    return (
        <div className={className}>
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-2">
                    {label && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {progress}%
                        </span>
                    )}
                </div>
            )}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-indigo transition-all duration-500 ease-out"
                    role="progressbar"
                    {...{
                        'aria-label': label || 'Progress bar',
                        'aria-valuenow': Math.round(normalizedProgress),
                        'aria-valuemin': 0,
                        'aria-valuemax': 100
                    }}
                    data-width={`${normalizedProgress}%`}
                />
            </div>
        </div>
    );
};

// ============ ADVANCED LOADING COMPONENTS ============

// Enhanced Skeleton Components
interface SkeletonProps {
    width?: string;
    height?: string;
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    className = '',
    variant = 'rectangular',
    animation = 'pulse'
}) => {
    const variantClasses = {
        text: 'rounded',
        rectangular: 'rounded-none',
        circular: 'rounded-full',
        rounded: 'rounded-lg'
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: ''
    };

    return (
        <div
            className={`
                bg-gray-200 dark:bg-gray-600
                ${variantClasses[variant]} 
                ${animationClasses[animation]}
                ${className}
            `}
            style={{ width, height }}
        />
    );
};

// Text Skeleton Lines
interface TextSkeletonProps {
    lines?: number;
    className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ lines = 3, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    height="1rem"
                    width={i === lines - 1 ? '75%' : '100%'}
                    variant="text"
                />
            ))}
        </div>
    );
};

// Table Skeleton
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
    rows = 5, 
    columns = 4, 
    className = '' 
}) => {
    return (
        <div className={`border rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="border-b bg-gray-50 dark:bg-gray-800 p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }, (_, i) => (
                        <Skeleton key={i} height="1rem" width="80%" />
                    ))}
                </div>
            </div>
            
            {/* Rows */}
            <div className="divide-y">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }, (_, colIndex) => (
                                <Skeleton 
                                    key={colIndex} 
                                    height="1rem" 
                                    width={colIndex === 0 ? '90%' : '70%'} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Loading States Hook
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
    progress?: number;
    status?: 'idle' | 'loading' | 'success' | 'error';
}

export const useLoadingState = (initialState: Partial<LoadingState> = {}) => {
    const [state, setState] = useState<LoadingState>({
        isLoading: false,
        error: null,
        progress: 0,
        status: 'idle',
        ...initialState
    });

    const setLoading = useCallback((loading: boolean, progress?: number) => {
        setState(prev => ({
            ...prev,
            isLoading: loading,
            status: loading ? 'loading' : prev.status,
            progress: progress ?? prev.progress,
            error: loading ? null : prev.error
        }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({
            ...prev,
            error,
            isLoading: false,
            status: error ? 'error' : 'idle'
        }));
    }, []);

    const setSuccess = useCallback(() => {
        setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            status: 'success',
            progress: 100
        }));
    }, []);

    const setProgress = useCallback((progress: number) => {
        setState(prev => ({
            ...prev,
            progress: Math.min(100, Math.max(0, progress))
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            progress: 0,
            status: 'idle'
        });
    }, []);

    return {
        ...state,
        setLoading,
        setError,
        setSuccess,
        setProgress,
        reset
    };
};

// Async Operation Wrapper
interface AsyncWrapperProps {
    children: React.ReactNode;
    loading?: React.ReactNode;
    error?: React.ReactNode;
    loadingState: LoadingState;
    fallback?: React.ReactNode;
    minLoadingTime?: number;
}

export const AsyncWrapper: React.FC<AsyncWrapperProps> = ({
    children,
    loading,
    error,
    loadingState,
    fallback,
    minLoadingTime = 0
}) => {
    const [showLoading, setShowLoading] = useState(loadingState.isLoading);

    useEffect(() => {
        if (loadingState.isLoading) {
            setShowLoading(true);
        } else if (minLoadingTime > 0) {
            const timer = setTimeout(() => {
                setShowLoading(false);
            }, minLoadingTime);
            return () => clearTimeout(timer);
        } else {
            setShowLoading(false);
        }
    }, [loadingState.isLoading, minLoadingTime]);

    if (showLoading || loadingState.isLoading) {
        return <>{loading || <LoadingSpinner />}</>;
    }

    if (loadingState.error) {
        return <>{error || (
            <div className="flex items-center gap-2 text-red-600 p-4">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{loadingState.error}</span>
            </div>
        )}</>;
    }

    if (loadingState.status === 'success' && fallback) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// Button with Loading State
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    children,
    loading = false,
    loadingText,
    size = 'md',
    variant = 'primary',
    disabled,
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 
                font-medium rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${className}
            `}
        >
            {loading && <LoadingSpinner size="sm" color="white" />}
            {loading ? (loadingText || 'Loading...') : children}
        </button>
    );
};

// Full Page Loading
interface FullPageLoadingProps {
    message?: string;
    progress?: number;
    showProgress?: boolean;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
    message = 'Loading...',
    progress,
    showProgress = false
}) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <LoadingSpinner size="xl" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {message}
                </h3>
                {showProgress && typeof progress === 'number' && (
                    <ProgressBar 
                        progress={progress} 
                        label="Progress"
                        showPercentage 
                        className="mt-4"
                    />
                )}
            </div>
        </div>
    );
};
