/**
 * Tarot Card Image Registry
 *
 * Maps all 78 Rider-Waite-Smith tarot cards to high-resolution artwork:
 * - 11 Major Arcana cards with bespoke AI-generated sacred artwork
 * - All other Major & Minor Arcana cards with authentic 1909 Rider-Waite-Smith artwork (Pamela Colman Smith, CC0 / Public Domain)
 * - Card back texture
 */

export const AI_GENERATED_CARD_IDS = new Set<string>([
  "major_00_fool",
  "major_01_magician",
  "major_02_high_priestess",
  "major_06_lovers",
  "major_10_wheel_of_fortune",
  "major_13_death",
  "major_16_tower",
  "major_17_star",
  "major_18_moon",
  "major_19_sun",
  "major_21_world",
]);

export const CARD_IMAGE_MAP: Record<string, string> = {
  // Major Arcana (Custom AI Artwork where available, authentic RWS 1909 for rest)
  major_00_fool: "/cards/major/00_the_fool.jpg",
  major_01_magician: "/cards/major/01_the_magician.jpg",
  major_02_high_priestess: "/cards/major/02_the_high_priestess.jpg",
  major_03_empress: "/cards/rws/03_Empress.jpg",
  major_04_emperor: "/cards/rws/04_Emperor.jpg",
  major_05_hierophant: "/cards/rws/05_Hierophant.jpg",
  major_06_lovers: "/cards/major/06_the_lovers.jpg",
  major_07_chariot: "/cards/rws/07_Chariot.jpg",
  major_08_strength: "/cards/rws/08_Strength.jpg",
  major_09_hermit: "/cards/rws/09_Hermit.jpg",
  major_10_wheel_of_fortune: "/cards/major/10_wheel_of_fortune.jpg",
  major_11_justice: "/cards/rws/11_Justice.jpg",
  major_12_hanged_man: "/cards/rws/12_Hanged_Man.jpg",
  major_13_death: "/cards/major/13_death.jpg",
  major_14_temperance: "/cards/rws/14_Temperance.jpg",
  major_15_devil: "/cards/rws/15_Devil.jpg",
  major_16_tower: "/cards/major/16_the_tower.jpg",
  major_17_star: "/cards/major/17_the_star.jpg",
  major_18_moon: "/cards/major/18_the_moon.jpg",
  major_19_sun: "/cards/major/19_the_sun.jpg",
  major_20_judgement: "/cards/rws/20_Judgement.jpg",
  major_21_world: "/cards/major/21_the_world.jpg",

  // Minor Arcana — Wands (1-14)
  minor_wands_ace: "/cards/rws/Wands01.jpg",
  minor_wands_two: "/cards/rws/Wands02.jpg",
  minor_wands_three: "/cards/rws/Wands03.jpg",
  minor_wands_four: "/cards/rws/Wands04.jpg",
  minor_wands_five: "/cards/rws/Wands05.jpg",
  minor_wands_six: "/cards/rws/Wands06.jpg",
  minor_wands_seven: "/cards/rws/Wands07.jpg",
  minor_wands_eight: "/cards/rws/Wands08.jpg",
  minor_wands_nine: "/cards/rws/Wands09.jpg",
  minor_wands_ten: "/cards/rws/Wands10.jpg",
  minor_wands_page: "/cards/rws/Wands11.jpg",
  minor_wands_knight: "/cards/rws/Wands12.jpg",
  minor_wands_queen: "/cards/rws/Wands13.jpg",
  minor_wands_king: "/cards/rws/Wands14.jpg",

  // Minor Arcana — Cups (1-14)
  minor_cups_ace: "/cards/rws/Cups01.jpg",
  minor_cups_two: "/cards/rws/Cups02.jpg",
  minor_cups_three: "/cards/rws/Cups03.jpg",
  minor_cups_four: "/cards/rws/Cups04.jpg",
  minor_cups_five: "/cards/rws/Cups05.jpg",
  minor_cups_six: "/cards/rws/Cups06.jpg",
  minor_cups_seven: "/cards/rws/Cups07.jpg",
  minor_cups_eight: "/cards/rws/Cups08.jpg",
  minor_cups_nine: "/cards/rws/Cups09.jpg",
  minor_cups_ten: "/cards/rws/Cups10.jpg",
  minor_cups_page: "/cards/rws/Cups11.jpg",
  minor_cups_knight: "/cards/rws/Cups12.jpg",
  minor_cups_queen: "/cards/rws/Cups13.jpg",
  minor_cups_king: "/cards/rws/Cups14.jpg",

  // Minor Arcana — Swords (1-14)
  minor_swords_ace: "/cards/rws/Swords01.jpg",
  minor_swords_two: "/cards/rws/Swords02.jpg",
  minor_swords_three: "/cards/rws/Swords03.jpg",
  minor_swords_four: "/cards/rws/Swords04.jpg",
  minor_swords_five: "/cards/rws/Swords05.jpg",
  minor_swords_six: "/cards/rws/Swords06.jpg",
  minor_swords_seven: "/cards/rws/Swords07.jpg",
  minor_swords_eight: "/cards/rws/Swords08.jpg",
  minor_swords_nine: "/cards/rws/Swords09.jpg",
  minor_swords_ten: "/cards/rws/Swords10.jpg",
  minor_swords_page: "/cards/rws/Swords11.jpg",
  minor_swords_knight: "/cards/rws/Swords12.jpg",
  minor_swords_queen: "/cards/rws/Swords13.jpg",
  minor_swords_king: "/cards/rws/Swords14.jpg",

  // Minor Arcana — Pentacles (1-14)
  minor_pentacles_ace: "/cards/rws/Pents01.jpg",
  minor_pentacles_two: "/cards/rws/Pents02.jpg",
  minor_pentacles_three: "/cards/rws/Pents03.jpg",
  minor_pentacles_four: "/cards/rws/Pents04.jpg",
  minor_pentacles_five: "/cards/rws/Pents05.jpg",
  minor_pentacles_six: "/cards/rws/Pents06.jpg",
  minor_pentacles_seven: "/cards/rws/Pents07.jpg",
  minor_pentacles_eight: "/cards/rws/Pents08.jpg",
  minor_pentacles_nine: "/cards/rws/Pents09.jpg",
  minor_pentacles_ten: "/cards/rws/Pents10.jpg",
  minor_pentacles_page: "/cards/rws/Pents11.jpg",
  minor_pentacles_knight: "/cards/rws/Pents12.jpg",
  minor_pentacles_queen: "/cards/rws/Pents13.jpg",
  minor_pentacles_king: "/cards/rws/Pents14.jpg",
};

export const CARD_BACK_IMAGE_PATH = "/cards/card_back.jpg";

/**
 * Returns image path for any card ID, falling back to card back or generic cover if not found.
 */
export function getCardImagePath(cardId: string): string {
  return CARD_IMAGE_MAP[cardId] || "/cards/rws/Cover.jpg";
}

/**
 * Returns whether card has a custom AI-generated artwork.
 */
export function hasCustomAiArtwork(cardId: string): boolean {
  return AI_GENERATED_CARD_IDS.has(cardId);
}
