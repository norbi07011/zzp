import React, { useState, useEffect } from 'react';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    CurrencyEuroIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
    ArrowPathIcon,
    CalendarDaysIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

// KPI Card Component
export interface KPICardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        period: string;
        type: 'increase' | 'decrease' | 'neutral';
    };
    icon: React.ComponentType<{ className?: string }>;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
    loading?: boolean;
    className?: string;
}

export function KPICard({
    title,
    value,
    change,
    icon: Icon,
    color = 'blue',
    loading = false,
    className = ''
}: KPICardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    const changeColorClasses = {
        increase: 'text-green-600 bg-green-100',
        decrease: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="ml-4 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow ${className}`}>
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeColorClasses[change.type]}`}>
                                {change.type === 'increase' && <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />}
                                {change.type === 'decrease' && <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                                {Math.abs(change.value)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs {change.period}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Chart Widget Component
export interface ChartData {
    label: string;
    value: number;
    color?: string;
}

export interface ChartWidgetProps {
    title: string;
    subtitle?: string;
    data: ChartData[];
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    loading?: boolean;
    onRefresh?: () => void;
    className?: string;
    height?: number;
}

export function ChartWidget({
    title,
    subtitle,
    data,
    type,
    loading = false,
    onRefresh,
    className = '',
    height = 300
}: ChartWidgetProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    const maxValue = Math.max(...data.map(d => d.value));

    const renderBarChart = () => (
        <div className="space-y-4" style={{ height }}>
            {data.map((item, index) => (
                <div key={index} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600 text-right pr-4">
                        {item.label}
                    </div>
                    <div className="flex-1 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                            <div
                                className={`h-6 rounded-full transition-all duration-1000 ${
                                    item.color || 'bg-blue-500'
                                }`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-12">
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercentage = 0;

        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 42 42" className="w-48 h-48">
                        <circle
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                        />
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -cumulativePercentage;
                            cumulativePercentage += percentage;

                            return (
                                <circle
                                    key={index}
                                    cx="21"
                                    cy="21"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={item.color || `hsl(${index * 137.5}, 70%, 50%)`}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{total}</div>
                            <div className="text-sm text-gray-500">Totaal</div>
                        </div>
                    </div>
                </div>
                <div className="ml-8 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color || `hsl(${index * 137.5}, 70%, 50%)` }}
                            ></div>
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900 ml-auto">
                                {item.value} ({Math.round((item.value / total) * 100)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {onRefresh && (
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>
            
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Geen gegevens beschikbaar</p>
                    </div>
                </div>
            ) : (
                <>
                    {type === 'bar' && renderBarChart()}
                    {(type === 'pie' || type === 'doughnut') && renderPieChart()}
                    {type === 'line' && (
                        <div className="text-center text-gray-500 py-20">
                            Lijndiagram komt binnenkort beschikbaar
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Activity Feed Widget
export interface ActivityItem {
    id: string;
    type: 'user' | 'job' | 'payment' | 'system';
    title: string;
    description: string;
    timestamp: string;
    user?: {
        name: string;
        avatar?: string;
    };
    metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
    title: string;
    activities: ActivityItem[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    className?: string;
}

export function ActivityFeed({
    title,
    activities,
    loading = false,
    onLoadMore,
    hasMore = false,
    className = ''
}: ActivityFeedProps) {
    const getActivityIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'user':
                return UserGroupIcon;
            case 'job':
                return BoltIcon;
            case 'payment':
                return CurrencyEuroIcon;
            case 'system':
                return CalendarDaysIcon;
            default:
                return BoltIcon;
        }
    };

    const getActivityColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'user':
                return 'bg-blue-100 text-blue-600';
            case 'job':
                return 'bg-green-100 text-green-600';
            case 'payment':
                return 'bg-yellow-100 text-yellow-600';
            case 'system':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m geleden`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}u geleden`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)}d geleden`;
        }
    };

    if (loading && activities.length === 0) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            
            {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Geen recente activiteiten</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                            <div key={activity.id} className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-sm text-gray-500">{activity.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
                                </div>
                            </div>
                        );
                    })}
                    
                    {hasMore && (
                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={onLoadMore}
                                disabled={loading}
                                className="w-full text-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Laden...' : 'Meer laden'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Quick Actions Widget
export interface QuickAction {
    id: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    onClick: () => void;
    disabled?: boolean;
}

export interface QuickActionsProps {
    title: string;
    actions: QuickAction[];
    className?: string;
}

export function QuickActions({
    title,
    actions,
    className = ''
}: QuickActionsProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
        green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
        red: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200'
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`p-4 rounded-lg border border-dashed transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[action.color]}`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium">{action.title}</p>
                                    {action.description && (
                                        <p className="text-sm opacity-75 mt-1">{action.description}</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default {
    KPICard,
    ChartWidget,
    ActivityFeed,
    QuickActions
};