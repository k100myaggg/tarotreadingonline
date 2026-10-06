import { DrawnCardData, TarotCard } from "@/types/tarot";
import { getCardById } from "@/lib/tarot/data";

export interface SpreadRelationshipSummary {
  totalCards: number;
  majorCount: number;
  minorCount: number;
  reversalsCount: number;
  elements: Record<string, number>;
  suits: Record<string, number>;
  repeatedNumbers: { number: number; count: number; meaningNote: string }[];
  insights: string[];
}

export function analyzeSpreadRelationships(drawnCards: DrawnCardData[]): SpreadRelationshipSummary {
  const cards: TarotCard[] = [];
  let reversalsCount = 0;

  for (const drawn of drawnCards) {
    if (drawn.isReversed) reversalsCount++;
    const card = getCardById(drawn.cardId);
    if (card) cards.push(card);
  }

  const totalCards = cards.length;
  let majorCount = 0;
  let minorCount = 0;
  const elements: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  const suits: Record<string, number> = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  const numberFrequencies = new Map<number, number>();

  for (const card of cards) {
    if (card.arcana === "major") {
      majorCount++;
    } else {
      minorCount++;
      if (card.suit && suits[card.suit] !== undefined) {
        suits[card.suit]++;
      }
    }

    if (card.element && elements[card.element] !== undefined) {
      elements[card.element]++;
    }

    const num = card.number;
    numberFrequencies.set(num, (numberFrequencies.get(num) || 0) + 1);
  }

  const repeatedNumbers: SpreadRelationshipSummary["repeatedNumbers"] = [];
  numberFrequencies.forEach((count, num) => {
    if (count >= 2) {
      let note = `Repeated frequency of number ${num}`;
      if (num === 1) note = `${count} Aces: Powerful surge of new beginnings and untamed potential`;
      else if (num === 5) note = `${count} Fives: Notable friction, tension, or pivotal evolution in perception`;
      else if (num === 10) note = `${count} Tens: Major culmination and closing of previous karmic cycles`;
      repeatedNumbers.push({ number: num, count, meaningNote: note });
    }
  });

  const insights: string[] = [];

  // Major Arcana ratio analysis
  if (totalCards > 0) {
    const majorRatio = majorCount / totalCards;
    if (majorRatio >= 0.6) {
      insights.push(
        `High Major Arcana concentration (${majorCount}/${totalCards}): Situation is governed by deep soul lessons, archetypal destiny, and forces larger than daily mundane willpower.`
      );
    } else if (majorCount === 0) {
      insights.push(
        `All Minor Arcana (${totalCards}/${totalCards}): Indicates pragmatic, immediate day-to-day choices, habitual patterns, and tangible action within the seeker's direct control.`
      );
    }
  }

  // Element dominance
  let maxElement = "";
  let maxElementCount = 0;
  Object.entries(elements).forEach(([el, count]) => {
    if (count > maxElementCount) {
      maxElementCount = count;
      maxElement = el;
    }
  });

  if (maxElementCount >= Math.ceil(totalCards / 2) && totalCards >= 3) {
    const elementAdjective =
      maxElement === "fire"
        ? "Fire (passion, creative drive, bold initiative, courage)"
        : maxElement === "water"
        ? "Water (deep emotion, spiritual intuition, relationship healing, empathy)"
        : maxElement === "air"
        ? "Air (intellect, strategic truth, mental clarity, direct speech)"
        : "Earth (grounded manifestation, career, somatic stability, tangible craft)";
    insights.push(`Strong elemental dominance of ${elementAdjective}.`);
  }

  // Reversals ratio
  if (reversalsCount >= Math.ceil(totalCards / 2) && totalCards > 1) {
    insights.push(
      `${reversalsCount}/${totalCards} cards reversed: Heavy emphasis on internal psychological integration, subconscious resistance, or energetic realignment before outward action.`
    );
  }

  return {
    totalCards,
    majorCount,
    minorCount,
    reversalsCount,
    elements,
    suits,
    repeatedNumbers,
    insights,
  };
}
