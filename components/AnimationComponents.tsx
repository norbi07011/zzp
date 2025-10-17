import React, { useEffect, useState } from 'react';

interface SuccessAnimationProps {
    message: string;
    onComplete?: () => void;
    duration?: number;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
    message, 
    onComplete,
    duration = 3000 
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-6 animate-scale-in">
                {/* Success Icon with Animation */}
                <div className="relative">
                    {/* Outer Ring */}
                    <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse-slow">
                        {/* Inner Circle */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-glow-green">
                            {/* Checkmark */}
                            <svg 
                                className="w-16 h-16 text-white animate-draw-check" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={3} 
                                    d="M5 13l4 4L19 7" 
                                />
                            </svg>
                        </div>
                    </div>
                    {/* Confetti Particles */}
                    <div className="absolute inset-0" aria-hidden="true">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full animate-confetti"
                                data-animation-delay={`${i * 0.1}s`}
                                data-color={['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][i % 6]}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                <div className="text-center">
                    <h3 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                        Sukces! 🎉
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
    useEffect(() => {
        if (active) {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 animate-confetti-fall"
                    data-left={`${Math.random() * 100}%`}
                    data-color={['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][i % 6]}
                    data-delay={`${Math.random() * 2}s`}
                    data-duration={`${2 + Math.random() * 2}s`}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
};

interface PulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger';
}

export const PulseButton: React.FC<PulseButtonProps> = ({ 
    children, 
    variant = 'primary',
    className = '',
    ...props 
}) => {
    const [isPulsing, setIsPulsing] = useState(false);

    const variantClasses = {
        primary: 'bg-gradient-indigo hover:shadow-glow',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-glow-green',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-glow-red'
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
        props.onClick?.(e);
    };

    return (
        <button
            {...props}
            onClick={handleClick}
            className={`relative px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${variantClasses[variant]} ${isPulsing ? 'animate-pulse-once' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

interface RippleEffectProps {
    x: number;
    y: number;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ x, y }) => {
    return (
        <div
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none w-10 h-10"
            data-left={x - 20}
            data-top={y - 20}
            aria-hidden="true"
        />
    );
};

interface BadgeNotificationProps {
    count: number;
    className?: string;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ count, className = '' }) => {
    const [isNew, setIsNew] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 2000);
        return () => clearTimeout(timer);
    }, [count]);

    if (count === 0) return null;

    return (
        <div className={`absolute -top-1 -right-1 ${className}`}>
            <div className={`flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg ${isNew ? 'animate-bounce' : ''}`}>
                {count > 99 ? '99+' : count}
            </div>
        </div>
    );
};

interface ShimmerEffectProps {
    className?: string;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({ className = '' }) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
    );
};
