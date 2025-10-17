import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import nl from './translations/nl.js';
import en from './translations/en.js';

// Language configurations (ONLY NL + EN as per business requirements)
export const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', rtl: false },
  { code: 'en', name: 'English', flag: '🇬🇧', rtl: false },
] as const;

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
    },
    fallbackLng: 'nl', // Default language (Dutch)
    supportedLngs: ['nl', 'en'], // Only Dutch and English
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language choice
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

// Helper to change language and update RTL
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  
  // Update HTML dir attribute for RTL languages
  const isRtl = languages.find(l => l.code === lng)?.rtl;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

export default i18n;
