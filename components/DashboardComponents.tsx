import React from 'react';

interface BreadcrumbItem {
    label: string;
    icon?: string;
    isActive?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
    return (
        <nav className={`flex items-center gap-2 text-sm ${className}`}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="text-gray-400 dark:text-gray-500">
                            /
                        </span>
                    )}
                    <span 
                        className={`flex items-center gap-1.5 ${
                            item.isActive 
                                ? 'text-primary-600 dark:text-primary-400 font-semibold' 
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                    </span>
                </React.Fragment>
            ))}
        </nav>
    );
};

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    breadcrumbs?: BreadcrumbItem[];
    children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
    title, 
    subtitle, 
    icon,
    breadcrumbs,
    children 
}) => {
    return (
        <div className="mb-8 animate-fade-in">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                        {icon && <span className="text-5xl">{icon}</span>}
                        <span className="bg-gradient-indigo bg-clip-text text-transparent">
                            {title}
                        </span>
                    </h1>
                    {subtitle && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                            {subtitle}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
            
            <div className="mt-6 w-24 h-1 bg-gradient-indigo rounded-full"></div>
        </div>
    );
};

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface TabNavigationProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
    tabs, 
    activeTab, 
    onTabChange,
    className = '' 
}) => {
    return (
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-premium rounded-2xl shadow-premium border border-white/40 dark:border-slate-700/40 p-2 mb-8 animate-fade-in ${className}`}>
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                isActive
                                    ? 'bg-gradient-indigo text-white shadow-lg scale-105'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:scale-102'
                            }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    isActive 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
