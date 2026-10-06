import { describe, it, expect } from "vitest";
import { buildTarotReadingPrompt } from "../src/lib/ai/promptBuilder";
import { getSpreadById, getPersonaById } from "../src/lib/tarot/data";
import { DrawnCardData } from "../src/types/tarot";

describe("Tarot AI Prompt Builder Engine", () => {
  const threeCardSpread = getSpreadById("three_card")!;
  const sagePersona = getPersonaById("sage")!;
  const strategistPersona = getPersonaById("strategist")!;

  const testDrawnCards: DrawnCardData[] = [
    { cardId: "major_00_fool", isReversed: false, positionIndex: 0, positionName: "The Foundation" },
    { cardId: "minor_wands_ace", isReversed: false, positionIndex: 1, positionName: "The Crossroads" },
    { cardId: "minor_cups_ace", isReversed: true, positionIndex: 2, positionName: "The Horizon" },
  ];

  it("builds a prompt including canonical card names, positions, and keywords", () => {
    const { systemPrompt, userPrompt } = buildTarotReadingPrompt({
      question: "What is calling to my creative purpose?",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "en",
    });

    expect(systemPrompt).toContain("The Mystic Sage");
    expect(systemPrompt).toContain("archetypal symbolism");
    expect(userPrompt).toContain("What is calling to my creative purpose?");
    expect(userPrompt).toContain("The Fool");
    expect(userPrompt).toContain("Ace of Wands");
    expect(userPrompt).toContain("Ace of Cups");
    expect(userPrompt).toContain("REVERSED");
  });

  it("accurately detects repeated numbers in structural analysis (e.g., 2 Aces)", () => {
    const { userPrompt } = buildTarotReadingPrompt({
      question: "Career crossroads",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "en",
    });

    // Both Ace of Wands and Ace of Cups are in testDrawnCards
    expect(userPrompt).toContain("2 Aces: Powerful surge of new beginnings");
  });

  it("adapts persona tone between Sage and Strategist", () => {
    const sagePrompt = buildTarotReadingPrompt({
      question: "Decision",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "en",
    });

    const stratPrompt = buildTarotReadingPrompt({
      question: "Decision",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: strategistPersona,
      locale: "en",
    });

    expect(sagePrompt.systemPrompt).toContain("ancient, contemplative");
    expect(stratPrompt.systemPrompt).toContain("incisive, intellectually rigorous");
  });

  it("injects Hindi language instructions for 'hi' locale", () => {
    const { systemPrompt } = buildTarotReadingPrompt({
      question: "जीवन की दिशा",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "hi",
    });

    expect(systemPrompt).toContain("Hindi (हिन्दी)");
  });

  it("injects Japanese language instructions for 'ja' locale", () => {
    const { systemPrompt } = buildTarotReadingPrompt({
      question: "キャリアの方向性",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "ja",
    });

    expect(systemPrompt).toContain("Japanese (日本語)");
  });

  it("includes Option A and Option B when present", () => {
    const { userPrompt } = buildTarotReadingPrompt({
      question: "Which path to take?",
      optionA: "Stay at company",
      optionB: "Start own venture",
      spread: threeCardSpread,
      drawnCards: testDrawnCards,
      persona: sagePersona,
      locale: "en",
    });

    expect(userPrompt).toContain('Path / Option A: "Stay at company"');
    expect(userPrompt).toContain('Path / Option B: "Start own venture"');
  });
});
