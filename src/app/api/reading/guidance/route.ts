import { NextRequest, NextResponse } from "next/server";
import { secureRandomInt } from "@/lib/rng/draw";
import { allCards, getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { existingCardIds = [], locale = "en", personaId = "sage" } = body;
    const activeLocale = (locale as Locale) || "en";

    // 1. Exclude existing cards to guarantee no replacement duplicates
    const existingSet = new Set(existingCardIds);
    const availableCards = allCards.filter((c) => !existingSet.has(c.id));

    if (availableCards.length === 0) {
      return NextResponse.json({ error: "No remaining cards in deck" }, { status: 400 });
    }

    // 2. Cryptographically pick 1 card
    const pickedIndex = secureRandomInt(0, availableCards.length);
    const card = availableCards[pickedIndex];
    const isReversed = secureRandomInt(0, 2) === 1;

    const cardName = getCardDisplayName(card, activeLocale);
    const orientationStr = isReversed ? "reversed" : "upright";
    const meaning = isReversed ? card.meanings.reversed : card.meanings.upright;

    const interpretation = `The Oracle brings forth **${cardName}** (${orientationStr.toUpperCase()}) as an additional beacon of guidance. This card reveals: ${meaning} Keep this symbol close to your heart as a reminder of the quiet wisdom unfolding beneath surface events.`;

    return NextResponse.json({
      success: true,
      card: {
        cardId: card.id,
        cardName,
        isReversed,
        positionIndex: existingCardIds.length,
        positionName: "Clarifying Oracle Guidance",
      },
      interpretation,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Guidance draw error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to draw guidance card" },
      { status: 500 }
    );
  }
}
