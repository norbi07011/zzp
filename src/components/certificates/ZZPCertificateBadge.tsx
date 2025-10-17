/**
 * ZZP CERTIFICATE BADGE
 * Displays official ZZP certification on worker profile (if certified)
 * Shows: certificate number, issue date, expiry date, status
 * Visibility: Public (employers can see)
 */

import React from 'react';
import { Award, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface ZZPCertificateBadgeProps {
  certificateNumber: string; // Format: ZZP-2025-00123
  issuedAt: string; // ISO date string
  expiresAt?: string | null; // ISO date string (7 years from issuedAt)
  status?: 'certified' | 'expired' | 'revoked'; // Certificate status
  practicalScore?: number; // Exam score 1-10 (optional display)
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ZZPCertificateBadge: React.FC<ZZPCertificateBadgeProps> = ({
  certificateNumber,
  issuedAt,
  expiresAt,
  status = 'certified',
  practicalScore,
  className = '',
  size = 'medium'
}) => {
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  const isRevoked = status === 'revoked';
  const isValid = status === 'certified' && !isExpired;

  // Size variants
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Status badge styling
  const getStatusBadge = () => {
    if (isRevoked) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
          <XCircle className="w-3 h-3" />
          Ingetrokken
        </div>
      );
    }
    if (isExpired) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
          <AlertTriangle className="w-3 h-3" />
          Verlopen
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
        <CheckCircle className="w-3 h-3" />
        Geldig
      </div>
    );
  };

  // Border and background color based on status
  const getBorderColor = () => {
    if (isRevoked) return 'border-red-300 bg-red-50';
    if (isExpired) return 'border-yellow-300 bg-yellow-50';
    return 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50';
  };

  // Small variant (for lists)
  if (size === 'small') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 border-2 rounded-lg ${getBorderColor()}`}>
          <Award className={`${iconSizes.small} ${isValid ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`font-bold ${textSizes.small} ${isValid ? 'text-green-900' : 'text-gray-600'}`}>
            {certificateNumber}
          </span>
          {getStatusBadge()}
        </div>
      </div>
    );
  }

  // Medium/Large variants (for profile pages)
  return (
    <div className={`border-2 rounded-xl ${getBorderColor()} ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${isValid ? 'bg-green-500' : 'bg-gray-400'} rounded-full p-2`}>
            <Award className={`${iconSizes[size]} text-white`} />
          </div>
          <div>
            <p className={`${textSizes[size]} text-gray-600`}>
              ZZP Werkplaats Certificaat
            </p>
            <p className={`font-bold text-lg ${isValid ? 'text-green-900' : 'text-gray-700'}`}>
              {certificateNumber}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Certificate Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Uitgegeven: {new Date(issuedAt).toLocaleDateString('nl-NL')}</span>
        </div>
        
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              Geldig tot: {new Date(expiresAt).toLocaleDateString('nl-NL')}
              {isExpired && <span className="ml-2 text-red-600 font-semibold">(Verlopen)</span>}
            </span>
          </div>
        )}

        {practicalScore !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Praktijkscore:</span>
              <span className={`text-xl font-bold ${
                practicalScore >= 9 ? 'text-green-600' :
                practicalScore >= 7 ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {practicalScore}/10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Warning for expiring soon */}
      {expiresAt && !isExpired && !isRevoked && (
        (() => {
          const daysUntilExpiry = Math.ceil(
            (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilExpiry <= 30) {
            return (
              <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Verloopt over {daysUntilExpiry} dagen - overweeg verlenging</span>
              </div>
            );
          }
          return null;
        })()
      )}

      {/* Revocation notice */}
      {isRevoked && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          <p className="font-semibold">⚠️ Dit certificaat is ingetrokken</p>
          <p className="text-xs mt-1">Neem contact op voor meer informatie.</p>
        </div>
      )}
    </div>
  );
};

// Example usage:
// <ZZPCertificateBadge 
//   certificateNumber="ZZP-2025-00123"
//   issuedAt="2025-01-15T10:00:00Z"
//   expiresAt="2026-01-15T10:00:00Z"
//   status="certified"
//   practicalScore={9}
//   size="large"
// />

export default ZZPCertificateBadge;
