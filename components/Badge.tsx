import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type: 'verified' | 'vca' | 'level' | 'status' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ children, type, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const typeClasses = {
    verified: 'bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-lg border border-accent-300 hover:shadow-glow',
    vca: 'bg-gradient-to-r from-secondary-400 to-secondary-600 text-white shadow-lg border border-secondary-300 hover:shadow-glow',
    level: 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg border border-primary-300 hover:shadow-glow',
    status: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600',
    premium: 'bg-gradient-premium text-white shadow-lg border border-purple-300 hover:shadow-glow animate-glow'
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full transition-all duration-300 hover:scale-105 transform ${
      sizeClasses[size]
    } ${
      typeClasses[type]
    }`}>
      {children}
    </span>
  );
};