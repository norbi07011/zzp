// =====================================================
// I18N EXPORTS
// =====================================================
// Centralized export for all i18n functionality
// =====================================================

export { pl } from './pl.js';
export { nl } from './nl.js';
export { en } from './en.js';
export {
  I18nProvider,
  useTranslation,
  getLanguageName,
  getLanguageFlag,
  AVAILABLE_LANGUAGES,
  type Language,
  type Translations,
} from './config.js';
export type { TranslationKey } from './pl.js';
