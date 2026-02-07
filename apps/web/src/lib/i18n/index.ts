import enTranslations from "./locales/en.json";
import zhTranslations from "./locales/zh.json";

export type Locale = "en" | "zh";

export const locales: Locale[] = ["en", "zh"];

export const defaultLocale: Locale = "zh";

type Translations = typeof zhTranslations;

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
