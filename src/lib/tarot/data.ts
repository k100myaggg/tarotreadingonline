import cardsData from "@/data/tarot/cards.json";
import spreadsData from "@/data/tarot/spreads.json";
import personasData from "@/data/tarot/personas.json";
import { TarotCard, TarotSpread, Persona, Locale } from "@/types/tarot";

export const allCards = cardsData as TarotCard[];
export const allSpreads = spreadsData as TarotSpread[];
export const allPersonas = personasData as Persona[];

export function getCardById(id: string): TarotCard | undefined {
  return allCards.find((c) => c.id === id);
}

export function getSpreadById(id: string): TarotSpread | undefined {
  return allSpreads.find((s) => s.id === id);
}

export function getPersonaById(id: string): Persona | undefined {
  return allPersonas.find((p) => p.id === id);
}

export function getCardDisplayName(card: TarotCard, locale: Locale): string {
  return card.name[locale] || card.name.en;
}

export function getSpreadDisplayName(spread: TarotSpread, locale: Locale): string {
  return spread.name[locale] || spread.name.en;
}

export function getPersonaDisplayName(persona: Persona, locale: Locale): string {
  return persona.name[locale] || persona.name.en;
}
