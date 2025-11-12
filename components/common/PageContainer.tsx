// =====================================================
// PAGE CONTAINER COMPONENT
// =====================================================
// Reusable container with modern Invoice Module styling
// Provides consistent gradient background, spacing, and layout
// =====================================================

import { ReactNode } from "react";
import React from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export const PageContainer = ({
  children,
  maxWidth = "7xl",
  className = "",
}: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`${maxWidthClasses[maxWidth]} mx-auto p-6 space-y-8 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

// =====================================================
// PAGE HEADER COMPONENT
// =====================================================
// Modern gradient header with title, subtitle, and optional action button
// =====================================================

interface PageHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export const PageHeader = ({
  icon,
  title,
  subtitle,
  actionButton,
}: PageHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h1>
          {subtitle && <p className="text-blue-100 text-lg">{subtitle}</p>}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"></div>
    </div>
  );
};

// =====================================================
// STATS GRID COMPONENT
// =====================================================
// Grid of modern stat cards with gradient backgrounds
// =====================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "red" | "blue" | "green" | "purple" | "orange" | "teal";
}

const colorClasses = {
  red: {
    gradient: "from-red-500/10 to-red-600/10",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    glow: "bg-red-200/30",
  },
  blue: {
    gradient: "from-blue-500/10 to-blue-600/10",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    glow: "bg-blue-200/30",
  },
  green: {
    gradient: "from-green-500/10 to-green-600/10",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    glow: "bg-green-200/30",
  },
  purple: {
    gradient: "from-purple-500/10 to-purple-600/10",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    glow: "bg-purple-200/30",
  },
  orange: {
    gradient: "from-orange-500/10 to-orange-600/10",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    glow: "bg-orange-200/30",
  },
  teal: {
    gradient: "from-teal-500/10 to-teal-600/10",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    glow: "bg-teal-200/30",
  },
};

export const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colors = colorClasses[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
      ></div>
      <div className="relative flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 ${colors.iconBg} rounded-xl`}>{icon}</div>
      </div>
      <div className="relative text-3xl font-bold text-gray-900 font-mono">
        {value}
      </div>
      <div
        className={`absolute -bottom-2 -right-2 w-16 h-16 ${colors.glow} rounded-full blur-lg`}
      ></div>
    </div>
  );
};

interface StatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const StatsGrid = ({ children, columns = 4 }: StatsGridProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
  };

  return <div className={`grid ${gridCols[columns]} gap-6`}>{children}</div>;
};

// =====================================================
// CONTENT CARD COMPONENT
// =====================================================
// Modern card with gradient background and backdrop blur
// =====================================================

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ children, className = "", noPadding = false }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 shadow-xl transition-all duration-300 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
        <div className={`relative ${noPadding ? "" : "p-6"}`}>{children}</div>
      </div>
    );
  }
);

ContentCard.displayName = "ContentCard";
