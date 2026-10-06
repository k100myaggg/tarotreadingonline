export type Locale = "en" | "hi" | "ja";

export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Element = "fire" | "water" | "air" | "earth";

export interface CardNameMap {
  en: string;
  hi: string;
  ja: string;
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
  cards: StructuredReadingCardAnalysis[];
  spreadSynthesis: string;
  actionableStep: string;
  followUpSuggestions: string[];
}
