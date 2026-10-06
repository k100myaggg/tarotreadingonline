import crypto from "node:crypto";
import { TarotCard, TarotSpread, DrawnCardData } from "@/types/tarot";
import { allCards, getSpreadById } from "@/lib/tarot/data";

export interface DrawOptions {
  spreadId: string;
  userPickIndices?: number[];
  allowReversals?: boolean;
}

export interface DrawResult {
  readingId: string;
  spread: TarotSpread;
  cards: DrawnCardData[];
  createdAt: string;
}

/**
 * Generates a cryptographically secure integer in [min, max)
 */
export function secureRandomInt(min: number, max: number): number {
  if (min >= max) {
    throw new Error(`min (${min}) must be less than max (${max})`);
  }
  return crypto.randomInt(min, max);
}

/**
 * Fisher-Yates cryptographically secure shuffle without replacement
 */
export function secureShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Executes a cryptographically secure draw for a given spread.
 * If userPickIndices are provided from the 3D field, those slots are sampled from
 * the shuffled deck; otherwise the top N cards are drawn.
 */
export function executeSecureDraw(options: DrawOptions): DrawResult {
  const { spreadId, userPickIndices, allowReversals = true } = options;

  const spread = getSpreadById(spreadId);
  if (!spread) {
    throw new Error(`Invalid spread identifier: ${spreadId}`);
  }

  if (spread.cardCount > allCards.length) {
    throw new Error(`Spread requires ${spread.cardCount} cards, but deck only contains ${allCards.length}`);
  }

  // 1. Cryptographically shuffle the entire 78-card deck
  const shuffledDeck = secureShuffle(allCards);

  // 2. Select cards according to spread positions
  const drawnCards: DrawnCardData[] = [];
  const selectedCards: TarotCard[] = [];

  if (userPickIndices && userPickIndices.length === spread.cardCount) {
    // Validate indices are within [0, 78) and all unique
    const uniqueIndices = new Set(userPickIndices);
    if (uniqueIndices.size !== spread.cardCount) {
      throw new Error("Duplicate card indices picked from the field");
    }

    for (const idx of userPickIndices) {
      if (idx < 0 || idx >= shuffledDeck.length) {
        throw new Error(`Card pick index ${idx} is out of bounds (0..77)`);
      }
      selectedCards.push(shuffledDeck[idx]);
    }
  } else {
    // Default: draw top N cards from shuffled deck
    selectedCards.push(...shuffledDeck.slice(0, spread.cardCount));
  }

  // Double-check no duplicates
  const cardIdSet = new Set<string>();
  for (let i = 0; i < selectedCards.length; i++) {
    const card = selectedCards[i];
    if (cardIdSet.has(card.id)) {
      throw new Error(`Cryptographic anomaly: duplicate card ${card.id} detected in single draw`);
    }
    cardIdSet.add(card.id);

    // Cryptographic boolean flip for reversal
    const isReversed = allowReversals ? secureRandomInt(0, 2) === 1 : false;
    const position = spread.positions[i];

    drawnCards.push({
      cardId: card.id,
      isReversed,
      positionIndex: i,
      positionName: position?.name?.en || `Position ${i + 1}`,
    });
  }

  const readingId = `reading_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;

  return {
    readingId,
    spread,
    cards: drawnCards,
    createdAt: new Date().toISOString(),
  };
}
