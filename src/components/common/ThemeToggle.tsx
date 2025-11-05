import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore - Lucide React compatibility
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn relative w-16 h-8 rounded-full transition-all duration-300 flex items-center px-1"
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-slider absolute w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center">
        {theme === 'dark' ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-yellow-600" />
        )}
      </div>
    </button>
  );
};
