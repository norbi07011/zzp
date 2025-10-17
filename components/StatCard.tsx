import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  description, 
  trend, 
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    secondary: 'from-secondary-400 to-secondary-600',
    accent: 'from-accent-400 to-accent-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-yellow-400 to-yellow-600'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➖'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-300/50 dark:hover:border-primary-700/50 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
          {icon}
        </div>
        {trend && (
          <div className="text-xl">
            {trendIcons[trend]}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
