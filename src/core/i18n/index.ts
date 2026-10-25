import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ApiError } from '@/core/api/errors';
import en from './en.json';

/** English only at launch; strings are externalized so Hindi can follow (docs: FR-ACCT-04). */
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** A user-facing message for any error, chosen by the stable API error code. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const key = `errors.${error.code}`;
    return i18n.exists(key) ? i18n.t(key) : error.message || i18n.t('errors.generic');
  }
  return i18n.t('errors.generic');
}

export default i18n;
