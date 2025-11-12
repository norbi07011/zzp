/**
 * MESSU-BOUW Style Card Component
 * Rounded-2xl cards with hover effects
 */

import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
  colored?: "blue" | "gray" | "gradient";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
  onClick,
  gradient = false,
  colored,
}) => {
  // Base styles - MESSU-BOUW pattern
  const baseStyles = "rounded-2xl p-6 transition-all duration-300";

  // Background styles
  let bgStyles = "bg-white shadow-lg";

  if (colored === "blue") {
    bgStyles = "bg-primary-500 text-white shadow-md";
  } else if (colored === "gray") {
    bgStyles = "bg-gray-400 text-white shadow-md opacity-80";
  } else if (colored === "gradient" || gradient) {
    bgStyles =
      "bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 shadow-sm";
  }

  // Hover styles
  const hoverStyles = hover
    ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    : "";

  return (
    <div
      className={`
        ${baseStyles}
        ${bgStyles}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Stat Card variant (for dashboard metrics)
export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  colored?: "blue" | "gray" | "gradient";
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  colored = "blue",
  iconBg = "bg-primary-500",
}) => {
  const isColored = colored === "blue" || colored === "gray";

  return (
    <Card colored={colored} hover={true}>
      {icon && (
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center ${
              isColored ? "bg-white/20" : ""
            }`}
          >
            {icon}
          </div>
        </div>
      )}
      <p
        className={`text-sm ${isColored ? "opacity-90" : "text-gray-600"} mb-1`}
      >
        {label}
      </p>
      <p
        className={`text-3xl font-bold ${isColored ? "" : "text-primary-700"}`}
      >
        {value}
      </p>
    </Card>
  );
};
