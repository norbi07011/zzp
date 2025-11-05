// =====================================================
// I18N CONFIGURATION
// =====================================================
// Language switcher, context, and translation hook
// =====================================================

import { createContext, useContext, useState, ReactNode } from 'react';
import { pl, type TranslationKey } from './pl.js';
import { nl } from './nl.js';
import { en } from './en.js';

// =====================================================
// TYPES
// =====================================================

export type Language = 'pl' | 'nl' | 'en';

export type Translations = TranslationKey;

// =====================================================
// TRANSLATIONS REGISTRY
// =====================================================

const translations = {
  pl,
  nl,
  en,
} as const;

// =====================================================
// CONTEXT
// =====================================================

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'nl' }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const value: I18nContextValue = {
    language,
    setLanguage,
    t: translations[language] as Translations,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// =====================================================
// HOOK
// =====================================================

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
}

// =====================================================
// HELPERS
// =====================================================

export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    pl: 'Polski',
    nl: 'Nederlands',
    en: 'English',
  };
  return names[lang];
}

export function getLanguageFlag(lang: Language): string {
  const flags: Record<Language, string> = {
    pl: '🇵🇱',
    nl: '🇳🇱',
    en: '🇬🇧',
  };
  return flags[lang];
}

export const AVAILABLE_LANGUAGES: Language[] = ['pl', 'nl', 'en'];
