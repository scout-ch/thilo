// i18n utilities for Astro
import de from './de.json';
import fr from './fr.json';
import it from './it.json';

const translations = {
  de,
  fr,
  it
} as const;

export type Locale = keyof typeof translations;

export function getTranslations(locale: Locale = 'de') {
  return translations[locale] || translations.de;
}

export function t(key: string, locale: Locale = 'de'): string {
  const translation = getTranslations(locale);
  const keys = key.split('.');
  
  let result: any = translation.translation;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : key;
}

export const supportedLocales: Locale[] = ['de', 'fr', 'it'];
export const defaultLocale: Locale = 'de';
