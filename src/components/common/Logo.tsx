import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG - Based on the image */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Hexagon outline */}
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="4"
          />
          
          {/* Inner hexagon */}
          <path
            d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
            fill="url(#gradient2)"
            opacity="0.1"
          />
          
          {/* Check mark with tech pattern */}
          <path
            d="M30 50 L45 65 L75 30"
            fill="none"
            stroke="url(#gradient3)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Tech dots */}
          <circle cx="55" cy="45" r="2" fill="#00D4FF" opacity="0.8" />
          <circle cx="60" cy="40" r="1.5" fill="#00D4FF" opacity="0.6" />
          <circle cx="65" cy="35" r="1" fill="#00D4FF" opacity="0.4" />
          
          {/* Green indicator dot */}
          <circle cx="85" cy="15" r="4" fill="#10B981" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>
            
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight ${textSizeClasses[size]}`}>
            <span className="text-primary-navy">ZZP</span>{' '}
            <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
              WERKPLAATS
            </span>
          </div>
          <div className="text-xs text-gray-500 -mt-1">
            Gecertificeerde Vakmensen voor Uw Bedrijf
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
