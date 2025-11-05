// =====================================================
// UTILITY FUNCTIONS
// =====================================================
// Helper functions for invoice module
// =====================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (EUR by default)
 */
export function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: string | Date, locale: string = 'nl-NL'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Parse number from string (handle comma decimal separator)
 */
export function parseNumber(value: string): number {
  const normalized = value.replace(',', '.');
  return parseFloat(normalized) || 0;
}

/**
 * Round to 2 decimal places
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
