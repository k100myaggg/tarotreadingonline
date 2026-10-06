import { describe, it, expect } from "vitest";
import { checkCrisisIntent } from "../src/lib/ai/safetyGuardrails";

describe("Safety Guardrails & Crisis Intercept", () => {
  it("detects acute self-harm and suicide crisis queries in English", () => {
    const res1 = checkCrisisIntent("I feel so depressed and I want to end my life");
    expect(res1.isCrisis).toBe(true);
    expect(res1.helplines).toBeDefined();
    expect(res1.helplines?.length).toBeGreaterThan(0);

    const res2 = checkCrisisIntent("Should I kill myself according to the cards?");
    expect(res2.isCrisis).toBe(true);
  });

  it("detects crisis queries in Hindi and Japanese", () => {
    const resHi = checkCrisisIntent("मैं बहुत दुखी हूँ और आत्महत्या करना चाहता हूँ");
    expect(resHi.isCrisis).toBe(true);
    expect(resHi.message?.hi).toBeDefined();

    const resJa = checkCrisisIntent("もう死にたいです。タロットで私の未来を見てください");
    expect(resJa.isCrisis).toBe(true);
    expect(resJa.message?.ja).toBeDefined();
  });

  it("passes normal contemplative queries safely", () => {
    const normalQueries = [
      "What should I know about my creative career transition?",
      "Will moving to a new city bring new friendship and love?",
      "What is the obstacle holding back my artistic project?",
      "Can you give me insight into my creative relationship?",
    ];

    for (const q of normalQueries) {
      const res = checkCrisisIntent(q);
      expect(res.isCrisis).toBe(false);
      expect(res.helplines).toBeUndefined();
    }
  });
});
