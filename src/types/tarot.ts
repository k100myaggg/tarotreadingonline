export type SupportedLocale =
  | "en"
  | "zh-TW"
  | "zh"
  | "ja"
  | "ko"
  | "es"
  | "de"
  | "pt"
  | "fr"
  | "it"
  | "nl"
  | "ru"
  | "uk"
  | "he"
  | "th"
  | "tr"
  | "pl"
  | "da"
  | "no"
  | "vi"
  | "hu"
  | "fi"
  | "id"
  | "hi";

export type Locale = SupportedLocale;

export interface LanguageMeta {
  code: Locale;
  nativeName: string;
  englishName: string;
  dir?: "ltr" | "rtl";
}

export const ALL_LANGUAGES: LanguageMeta[] = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "zh-TW", nativeName: "正體中文", englishName: "Traditional Chinese" },
  { code: "zh", nativeName: "简体中文", englishName: "Simplified Chinese" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese" },
  { code: "ko", nativeName: "한국어", englishName: "Korean" },
  { code: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "de", nativeName: "Deutsch", englishName: "German" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese" },
  { code: "fr", nativeName: "Français", englishName: "French" },
  { code: "it", nativeName: "Italiano", englishName: "Italian" },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  { code: "ru", nativeName: "Русский", englishName: "Russian" },
  { code: "uk", nativeName: "Українська", englishName: "Ukrainian" },
  { code: "he", nativeName: "עברית", englishName: "Hebrew", dir: "rtl" },
  { code: "th", nativeName: "ไทย", englishName: "Thai" },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish" },
  { code: "pl", nativeName: "Polski", englishName: "Polish" },
  { code: "da", nativeName: "Dansk", englishName: "Danish" },
  { code: "no", nativeName: "Norsk", englishName: "Norwegian" },
  { code: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese" },
  { code: "hu", nativeName: "Magyar", englishName: "Hungarian" },
  { code: "fi", nativeName: "Suomi", englishName: "Finnish" },
  { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
];

export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Element = "fire" | "water" | "air" | "earth";

export interface CardNameMap {
  en: string;
  hi?: string;
  ja?: string;
  [key: string]: string | undefined;
}

export interface CardKeywords {
  upright: string[];
  reversed: string[];
}

export interface CardMeanings {
  upright: string;
  reversed: string;
}

export interface TarotCard {
  id: string;
  number: number;
  name: CardNameMap;
  arcana: Arcana;
  suit: Suit | null;
  element: Element;
  association: string;
  keywords: CardKeywords;
  meanings: CardMeanings;
  symbolism: string[];
  numerology: number;
  image: string;
}

export interface SpreadPosition {
  index: number;
  name: CardNameMap;
  hint: CardNameMap;
  coordinates: { x: number; y: number; z: number };
}

export interface TarotSpread {
  id: string;
  name: CardNameMap;
  description: CardNameMap;
  cardCount: number;
  creditCost: number;
  positions: SpreadPosition[];
}

export interface Persona {
  id: string;
  name: CardNameMap;
  title: CardNameMap;
  description: CardNameMap;
  tone: string;
  avatar: string;
  systemPromptModifier: string;
}

export interface DrawnCardData {
  cardId: string;
  isReversed: boolean;
  positionIndex: number;
  positionName: string;
}

export interface StructuredReadingCardAnalysis {
  cardId: string;
  cardName: string;
  orientation: "upright" | "reversed";
  positionIndex: number;
  positionName: string;
  coreEssence: string;
  contextualMeaning: string;
  advice: string;
}

export interface StructuredReadingResponse {
  readerPersona: string;
  intro: string;
  overallAnalysis?: string;
  cards: StructuredReadingCardAnalysis[];
  spreadSynthesis: string;
  actionableStep: string;
  followUpSuggestions: string[];
}
