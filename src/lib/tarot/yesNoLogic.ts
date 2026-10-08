import { TarotCard } from "@/types/tarot";

export interface YesNoVerdict {
  verdict: "YES" | "NO" | "MAYBE";
  affirmativeRate: number; // 0-100%
  headline: string;
  toneColor: string;
  summary: string;
}

const STRONG_YES_CARDS = new Set([
  "major_01_magician",
  "major_03_empress",
  "major_04_emperor",
  "major_06_lovers",
  "major_07_chariot",
  "major_08_strength",
  "major_10_wheel_of_fortune",
  "major_14_temperance",
  "major_17_star",
  "major_19_sun",
  "major_21_world",
  "minor_wands_ace",
  "minor_wands_four",
  "minor_wands_six",
  "minor_cups_ace",
  "minor_cups_two",
  "minor_cups_three",
  "minor_cups_nine",
  "minor_cups_ten",
  "minor_swords_ace",
  "minor_pentacles_ace",
  "minor_pentacles_three",
  "minor_pentacles_six",
  "minor_pentacles_nine",
  "minor_pentacles_ten",
]);

const STRONG_NO_CARDS = new Set([
  "major_13_death",
  "major_15_devil",
  "major_16_tower",
  "major_18_moon",
  "minor_wands_five",
  "minor_wands_seven",
  "minor_wands_ten",
  "minor_cups_five",
  "minor_cups_eight",
  "minor_swords_three",
  "minor_swords_five",
  "minor_swords_seven",
  "minor_swords_eight",
  "minor_swords_nine",
  "minor_swords_ten",
  "minor_pentacles_five",
]);

export function calculateYesNoVerdict(card: TarotCard | undefined, isReversed: boolean): YesNoVerdict {
  if (!card) {
    return {
      verdict: "YES",
      affirmativeRate: 80,
      headline: "Affirmative Alignment",
      toneColor: "from-emerald-500 to-teal-400",
      summary: "Cosmic energies indicate positive momentum when approached with intentional clarity.",
    };
  }

  const id = card.id;

  if (STRONG_NO_CARDS.has(id)) {
    if (isReversed) {
      return {
        verdict: "MAYBE",
        affirmativeRate: 48,
        headline: "Proceed with Deep Care / Inner Shift",
        toneColor: "from-amber-500 to-orange-400",
        summary: `While challenging energy is present in ${card.name.en}, the reversal indicates a clearing of the storm. Pause, reflect, and wait before taking sudden risks.`,
      };
    }
    return {
      verdict: "NO",
      affirmativeRate: 20,
      headline: "Caution / Natural Resistance Ahead",
      toneColor: "from-rose-500 to-red-400",
      summary: `${card.name.en} signals significant friction, hidden obstacles, or a boundary that should not be forced right now. Protect your peace.`,
    };
  }

  if (STRONG_YES_CARDS.has(id)) {
    if (isReversed) {
      return {
        verdict: "MAYBE",
        affirmativeRate: 62,
        headline: "Favorable Potential with Slight Delays",
        toneColor: "from-amber-400 to-yellow-300",
        summary: `${card.name.en} holds powerful affirmative light, but reversed currents require you to resolve internal doubts or minor logistics first.`,
      };
    }
    return {
      verdict: "YES",
      affirmativeRate: 92,
      headline: "Resonant Yes — Auspicious Flow",
      toneColor: "from-emerald-400 to-teal-300",
      summary: `${card.name.en} shines with harmonious approval. The cosmic conditions support your movement forward with confidence and devotion.`,
    };
  }

  // Neutral / situational cards
  if (isReversed) {
    return {
      verdict: "NO",
      affirmativeRate: 35,
      headline: "Hesitation / Inner Realignment Needed",
      toneColor: "from-purple-400 to-rose-400",
      summary: `${card.name.en} (Reversed) suggests that rushing may lead to confusion. Revisit your core intentions before deciding.`,
    };
  }

  return {
    verdict: "YES",
    affirmativeRate: 75,
    headline: "Yes, Guided by Awareness",
    toneColor: "from-sky-400 to-indigo-300",
    summary: `${card.name.en} supports your inquiry, provided you remain grounded and true to your core principles.`,
  };
}
