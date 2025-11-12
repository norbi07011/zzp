/**
 * MESSU-BOUW Style Button Component
 * Rounded-full primary buttons with hover effects
 */

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base styles - MESSU-BOUW pattern
  const baseStyles =
    "font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg disabled:bg-gray-400",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md hover:shadow-lg disabled:bg-gray-100",
    ghost:
      "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 disabled:border-gray-300 disabled:text-gray-400",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg disabled:bg-gray-400",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Width style
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
