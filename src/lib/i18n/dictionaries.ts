import en from "@/data/locales/en.json";
import hi from "@/data/locales/hi.json";
import ja from "@/data/locales/ja.json";
import zh from "@/data/locales/zh.json";
import zhTW from "@/data/locales/zh-TW.json";
import ko from "@/data/locales/ko.json";
import es from "@/data/locales/es.json";
import de from "@/data/locales/de.json";
import pt from "@/data/locales/pt.json";
import fr from "@/data/locales/fr.json";
import it from "@/data/locales/it.json";
import nl from "@/data/locales/nl.json";
import ru from "@/data/locales/ru.json";
import uk from "@/data/locales/uk.json";
import he from "@/data/locales/he.json";
import th from "@/data/locales/th.json";
import tr from "@/data/locales/tr.json";
import pl from "@/data/locales/pl.json";
import da from "@/data/locales/da.json";
import no from "@/data/locales/no.json";
import vi from "@/data/locales/vi.json";
import hu from "@/data/locales/hu.json";
import fi from "@/data/locales/fi.json";
import id from "@/data/locales/id.json";
import { Locale, ALL_LANGUAGES } from "@/types/tarot";

const rawDictionaries: Record<Locale, any> = {
  en,
  "zh-TW": zhTW,
  zh,
  ja,
  ko,
  es,
  de,
  pt,
  fr,
  it,
  nl,
  ru,
  uk,
  he,
  th,
  tr,
  pl,
  da,
  no,
  vi,
  hu,
  fi,
  id,
  hi,
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
