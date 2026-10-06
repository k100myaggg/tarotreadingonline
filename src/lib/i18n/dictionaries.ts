import en from "@/data/locales/en.json";
import hi from "@/data/locales/hi.json";
import ja from "@/data/locales/ja.json";
import { Locale } from "@/types/tarot";

const dictionaries = {
  en,
  hi,
  ja,
};

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}

export const supportedLocales: Locale[] = ["en", "hi", "ja"];

export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}
