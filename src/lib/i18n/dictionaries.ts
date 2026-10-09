import en from "@/data/locales/en.json";
import hi from "@/data/locales/hi.json";
import ja from "@/data/locales/ja.json";
import zh from "@/data/locales/zh.json";
import zhTW from "@/data/locales/zh-TW.json";
import es from "@/data/locales/es.json";
import { Locale, ALL_LANGUAGES } from "@/types/tarot";

const rawDictionaries: Partial<Record<Locale, any>> = {
  en,
  hi,
  ja,
  zh,
  "zh-TW": zhTW,
  es,
};

export type Dictionary = typeof en;

function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];
    if (
      sVal &&
      typeof sVal === "object" &&
      !Array.isArray(sVal) &&
      tVal &&
      typeof tVal === "object" &&
      !Array.isArray(tVal)
    ) {
      result[key] = deepMerge(tVal, sVal);
    } else if (sVal !== undefined && sVal !== null) {
      result[key] = sVal;
    }
  }
  return result;
}

export function getDictionary(locale: Locale): Dictionary {
  const chosen = rawDictionaries[locale];
  if (!chosen) {
    return en;
  }
  if (locale === "en") {
    return en;
  }
  return deepMerge(en, chosen) as Dictionary;
}

export const supportedLocales: Locale[] = ALL_LANGUAGES.map((l) => l.code);

export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}
