/**
 * SUBSCRIPTION STATUS BADGE
 * Wyświetla badge z tierem subskrypcji (Basic/Premium)
 */

import React from 'react';
import { Crown, User } from 'lucide-react';
import type { SubscriptionTier } from '../types/subscription';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  certificateNumber?: string | null;
}

export function SubscriptionBadge({ 
  tier, 
  showIcon = true, 
  size = 'md',
  className = '',
  certificateNumber
}: SubscriptionBadgeProps) {
  const isPremium = tier === 'premium';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const baseClasses = `inline-flex items-center gap-1.5 rounded-full font-semibold transition-all ${sizeClasses[size]}`;

  const tierClasses = isPremium
    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/30'
    : 'bg-blue-100 text-blue-700 border border-blue-200';

  const Icon = isPremium ? Crown : User;

  return (
    <span className={`${baseClasses} ${tierClasses} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>
        {isPremium ? 'Premium Verified' : 'Basic Member'}
        {isPremium && certificateNumber && (
          <span className="ml-1 opacity-80">#{certificateNumber}</span>
        )}
      </span>
    </span>
  );
}

/**
 * SUBSCRIPTION STATUS INDICATOR
 * Pokazuje status subskrypcji (active/cancelled/expired)
 */

interface StatusIndicatorProps {
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  showLabel?: boolean;
}

export function SubscriptionStatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      color: 'bg-green-500',
      label: 'Aktywna',
      textColor: 'text-green-700'
    },
    cancelled: {
      color: 'bg-orange-500',
      label: 'Anulowana',
      textColor: 'text-orange-700'
    },
    expired: {
      color: 'bg-red-500',
      label: 'Wygasła',
      textColor: 'text-red-700'
    },
    trial: {
      color: 'bg-purple-500',
      label: 'Trial',
      textColor: 'text-purple-700'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      {showLabel && (
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
