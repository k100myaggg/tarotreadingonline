import { describe, it, expect } from "vitest";
import { secureRandomInt, secureShuffle, executeSecureDraw } from "../src/lib/rng/draw";
import { allCards } from "../src/lib/tarot/data";

describe("Cryptographic Randomness Engine", () => {
  it("secureRandomInt generates numbers strictly within [min, max)", () => {
    for (let i = 0; i < 500; i++) {
      const val = secureRandomInt(10, 25);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(25);
    }
  });

  it("secureRandomInt throws when min >= max", () => {
    expect(() => secureRandomInt(5, 5)).toThrow();
    expect(() => secureRandomInt(10, 2)).toThrow();
  });

  it("secureShuffle preserves all original elements without dropping or duplicating", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = secureShuffle(original);

    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
  });

  it("executeSecureDraw correctly draws without replacement across 1,000 spreads", () => {
    const spreadsToTest = ["single", "three_card", "decision_ab", "celtic_cross"];

    for (const spreadId of spreadsToTest) {
      for (let run = 0; run < 250; run++) {
        const result = executeSecureDraw({ spreadId });
        expect(result.cards).toHaveLength(result.spread.cardCount);

        const cardIds = result.cards.map((c) => c.cardId);
        const uniqueSet = new Set(cardIds);

        // Crucial test: ZERO DUPLICATE CARDS IN SPREAD
        expect(uniqueSet.size).toBe(cardIds.length);

        // Every card drawn must be in the 78-card deck
        for (const c of result.cards) {
          const exists = allCards.some((deckCard) => deckCard.id === c.cardId);
          expect(exists).toBe(true);
        }
      }
    }
  });

  it("generates statistical 50/50 distribution of upright and reversed orientations", () => {
    let reversedCount = 0;
    const totalSimulations = 10000;

    for (let i = 0; i < totalSimulations; i++) {
      const result = executeSecureDraw({ spreadId: "single", allowReversals: true });
      if (result.cards[0].isReversed) {
        reversedCount++;
      }
    }

    const ratio = reversedCount / totalSimulations;
    // Across 10,000 trials, ratio should fall cleanly between 48% and 52% (p < 0.001)
    expect(ratio).toBeGreaterThan(0.47);
    expect(ratio).toBeLessThan(0.53);
  });

  it("throws error when invalid spread is requested", () => {
    expect(() => executeSecureDraw({ spreadId: "nonexistent_spread" })).toThrow();
  });

  it("rejects duplicate pick indices from user field selection", () => {
    expect(() =>
      executeSecureDraw({
        spreadId: "three_card",
        userPickIndices: [12, 12, 34],
      })
    ).toThrow("Duplicate card indices");
  });

  it("rejects pick indices outside the 0..77 deck range", () => {
    expect(() =>
      executeSecureDraw({
        spreadId: "three_card",
        userPickIndices: [0, 50, 99],
      })
    ).toThrow("out of bounds");
  });
});
