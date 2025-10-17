import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'full' | 'icon' | 'text';
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
    className = '', 
    variant = 'full',
    size = 'md' 
}) => {
    const sizeClasses = {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-16'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl'
    };

    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    if (variant === 'icon') {
        return (
            <div className={`${iconSizes[size]} bg-gradient-indigo rounded-xl flex items-center justify-center shadow-glow ${className}`}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5">
                    <path 
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }

    if (variant === 'text') {
        return (
            <div className={`font-heading font-bold ${textSizes[size]} ${className}`}>
                <span className="bg-gradient-indigo bg-clip-text text-transparent">
                    ZZP Werkplaats
                </span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${iconSizes[size]} bg-gradient-indigo rounded-xl flex items-center justify-center shadow-glow transition-transform duration-300 hover:scale-110`}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5">
                    <path 
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className={`font-heading font-bold ${textSizes[size]} bg-gradient-indigo bg-clip-text text-transparent leading-none`}>
                    ZZP Werkplaats
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                    Verified Professionals
                </span>
            </div>
        </div>
    );
};
