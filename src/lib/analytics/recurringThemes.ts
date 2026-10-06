import { getCardById } from "@/lib/tarot/data";

export interface HistoricalReadingItem {
  id: string;
  createdAt: string;
  question: string;
  spreadId: string;
  cards: { cardId: string; isReversed: boolean }[];
}

export interface RecurringThemesAnalysis {
  readingsCount: number;
  isUnlocked: boolean; // Unlocked after at least 7 readings (or preview mode)
  dominantElement: { element: string; count: number; percentage: number };
  dominantSuit: { suit: string; count: number; percentage: number };
  majorArcanaRatio: number;
  mostFrequentCards: { cardId: string; cardName: string; count: number }[];
  soulSeasonInsight: string;
}

export function analyzeHistoricalThemes(
  readings: HistoricalReadingItem[],
  locale: "en" | "hi" | "ja" = "en"
): RecurringThemesAnalysis {
  const readingsCount = readings.length;
  const isUnlocked = readingsCount >= 7;

  if (readingsCount === 0) {
    return {
      readingsCount: 0,
      isUnlocked: false,
      dominantElement: { element: "none", count: 0, percentage: 0 },
      dominantSuit: { suit: "none", count: 0, percentage: 0 },
      majorArcanaRatio: 0,
      mostFrequentCards: [],
      soulSeasonInsight: "Complete at least 7 readings to unlock recurring archetypal pattern analysis.",
    };
  }

  let totalCardsCount = 0;
  let totalMajorCount = 0;
  const elementCounts: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  const suitCounts: Record<string, number> = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  const cardFrequencies = new Map<string, number>();

  for (const r of readings) {
    for (const c of r.cards) {
      totalCardsCount++;
      cardFrequencies.set(c.cardId, (cardFrequencies.get(c.cardId) || 0) + 1);

      const card = getCardById(c.cardId);
      if (card) {
        if (card.arcana === "major") {
          totalMajorCount++;
        } else if (card.suit && suitCounts[card.suit] !== undefined) {
          suitCounts[card.suit]++;
        }

        if (card.element && elementCounts[card.element] !== undefined) {
          elementCounts[card.element]++;
        }
      }
    }
  }

  // Dominant element
  let topEl = "fire";
  let topElCount = 0;
  Object.entries(elementCounts).forEach(([el, cnt]) => {
    if (cnt > topElCount) {
      topElCount = cnt;
      topEl = el;
    }
  });

  // Dominant suit
  let topSuit = "wands";
  let topSuitCount = 0;
  Object.entries(suitCounts).forEach(([st, cnt]) => {
    if (cnt > topSuitCount) {
      topSuitCount = cnt;
      topSuit = st;
    }
  });

  // Most frequent cards
  const sortedCards = Array.from(cardFrequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cId, count]) => {
      const card = getCardById(cId);
      return {
        cardId: cId,
        cardName: card ? card.name[locale] || card.name.en : cId,
        count,
      };
    });

  const majorRatio = totalCardsCount > 0 ? totalMajorCount / totalCardsCount : 0;

  let soulSeasonInsight = "";
  if (topEl === "water") {
    soulSeasonInsight = "Your soul is navigating a deep Season of Emotional Healing and Intuitive Realignment. The currents invite vulnerability, relationship repair, and honoring unspoken feelings.";
  } else if (topEl === "fire") {
    soulSeasonInsight = "You are in an active Season of Creative Ignition and Sovereign Will. Your energy is ripe for bold initiatives, leadership, and breaking out of old comfort zones.";
  } else if (topEl === "air") {
    soulSeasonInsight = "A Season of Mental Discernment and Strategic Truth. You are cutting away obsolete illusions, refining your voice, and establishing clear boundaries.";
  } else {
    soulSeasonInsight = "A Season of Somatic Grounding and Material Manifestation. Focus on bodily wellness, financial roots, patience, and tangible craftsmanship.";
  }

  return {
    readingsCount,
    isUnlocked,
    dominantElement: {
      element: topEl,
      count: topElCount,
      percentage: totalCardsCount > 0 ? Math.round((topElCount / totalCardsCount) * 100) : 0,
    },
    dominantSuit: {
      suit: topSuit,
      count: topSuitCount,
      percentage: totalCardsCount > 0 ? Math.round((topSuitCount / totalCardsCount) * 100) : 0,
    },
    majorArcanaRatio: Math.round(majorRatio * 100),
    mostFrequentCards: sortedCards,
    soulSeasonInsight,
  };
}
