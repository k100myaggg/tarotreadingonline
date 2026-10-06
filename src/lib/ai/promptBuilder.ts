import { DrawnCardData, Locale, Persona, TarotSpread } from "@/types/tarot";
import { getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { analyzeSpreadRelationships } from "./relationshipAnalysis";

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

export function buildTarotReadingPrompt(params: {
  question: string;
  optionA?: string | null;
  optionB?: string | null;
  spread: TarotSpread;
  drawnCards: DrawnCardData[];
  persona: Persona;
  locale: Locale;
}): PromptPayload {
  const { question, optionA, optionB, spread, drawnCards, persona, locale } = params;

  // 1. Analyze structural relationships
  const analysis = analyzeSpreadRelationships(drawnCards);

  // 2. Format each card with exact registry meanings
  const cardsDetailsFormatted = drawnCards
    .map((drawn, idx) => {
      const card = getCardById(drawn.cardId);
      if (!card) return "";

      const position = spread.positions[idx];
      const posName = position?.name[locale] || position?.name.en || `Position ${idx + 1}`;
      const posHint = position?.hint[locale] || position?.hint.en || "";
      const cardName = getCardDisplayName(card, locale);
      const orientation = drawn.isReversed ? "REVERSED (Inverted)" : "UPRIGHT";
      const keywords = drawn.isReversed
        ? card.keywords.reversed.join(", ")
        : card.keywords.upright.join(", ");
      const officialMeaning = drawn.isReversed ? card.meanings.reversed : card.meanings.upright;

      return `--- Card ${idx + 1} of ${drawnCards.length} ---
Position: ${posName} (Role Hint: ${posHint})
Card: ${cardName} (${card.arcana.toUpperCase()} ARCANA${card.suit ? ` - ${card.suit.toUpperCase()}` : ""})
Orientation: ${orientation}
Element: ${card.element.toUpperCase()} | Numerology: ${card.numerology}
Core Archetypal Keywords: ${keywords}
Canonical RWS Meaning: "${officialMeaning}"
Key Symbols: ${card.symbolism.join(", ")}`;
    })
    .join("\n\n");

  // 3. Language instruction
  let languageDirective = "Respond in natural, elegant English.";
  if (locale === "hi") {
    languageDirective = "Respond entirely in fluent, dignified, and culturally evocative Hindi (हिन्दी) using Devanagari script. Use clear and poetic vocabulary appropriate for spiritual contemplation.";
  } else if (locale === "ja") {
    languageDirective = "Respond entirely in polished, respectful, and nuanced Japanese (日本語) appropriate for professional tarot interpretation and psychological counseling.";
  }

  // 4. Assemble System Prompt
  const systemPrompt = `You are a master tarot practitioner acting as the reader persona: "${persona.name[locale] || persona.name.en}".
${persona.systemPromptModifier}

STRICT PROFESSIONAL & ETHICAL GUIDELINES:
1. Frame the reading as an archetypal mirror for personal reflection, discernment, and empowerment.
2. NEVER predict literal physical death, diagnosis of diseases, financial investments, or legal outcomes. Tarot illuminates current energetic currents, not fixed fatalism.
3. Ground your interpretation strictly in the provided 78-card canonical meanings, symbols, and elements. Do not fabricate alien card meanings.
4. Maintain this exact persona voice consistently throughout the response.
5. ${languageDirective}
6. You MUST return ONLY valid, parseable JSON conforming strictly to the requested schema. Do not enclose in backticks or markdown preamble.`;

  // 5. Assemble User Prompt
  const userPrompt = `SEEKER'S INQUIRY:
"${question || "General energetic insight and spiritual clarity for this life phase"}"
${optionA ? `Path / Option A: "${optionA}"` : ""}
${optionB ? `Path / Option B: "${optionB}"` : ""}

SPREAD CONFIGURATION:
Spread: ${spread.name[locale] || spread.name.en} (${spread.cardCount} cards)
Description: ${spread.description[locale] || spread.description.en}

STRUCTURAL & ELEMENTAL RELATIONSHIPS NOTED:
- Major Arcana Count: ${analysis.majorCount} | Minor Arcana Count: ${analysis.minorCount}
- Reversals Count: ${analysis.reversalsCount} of ${analysis.totalCards}
- Element Distribution: Fire: ${analysis.elements.fire}, Water: ${analysis.elements.water}, Air: ${analysis.elements.air}, Earth: ${analysis.elements.earth}
${analysis.repeatedNumbers.map((rn) => `- Repeated Rank: ${rn.meaningNote}`).join("\n")}
${analysis.insights.map((ins) => `- Pattern Insight: ${ins}`).join("\n")}

DRAWN CARDS IN SACRED SPREAD:
${cardsDetailsFormatted}

JSON SCHEMA SPECIFICATION:
Return a single JSON object with this exact structure:
{
  "readerPersona": "${persona.name[locale] || persona.name.en}",
  "intro": "A 2-3 sentence evocative opening addressing the seeker's inquiry in the persona's voice.",
  "cards": [
    {
      "cardId": "string matching card ID",
      "cardName": "string",
      "orientation": "upright" or "reversed",
      "positionIndex": 0,
      "positionName": "string",
      "coreEssence": "1 concise sentence distilling the card's vital message here",
      "contextualMeaning": "2-3 paragraphs weaving the card's canonical meaning and symbols directly into the seeker's question and position role",
      "advice": "1 specific contemplative question or internal reflection inspired by this card"
    }
  ],
  "spreadSynthesis": "A holistic 2-3 paragraph synthesis explaining how all cards interact, noting the elemental balance, major arcana presence, and overall narrative trajectory.",
  "actionableStep": "A concrete, grounded practical action the seeker can take today to embody this wisdom.",
  "followUpSuggestions": [
    "First insightful question the seeker could ask to delve deeper into this spread",
    "Second insightful question",
    "Third insightful question"
  ]
}`;

  return { systemPrompt, userPrompt };
}
