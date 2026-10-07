import { NextRequest, NextResponse } from "next/server";
import { executeSecureDraw } from "@/lib/rng/draw";
import { getSpreadById, getPersonaById } from "@/lib/tarot/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      spreadId,
      question,
      optionA,
      optionB,
      personaId,
      userPickIndices,
      allowReversals = true,
      locale = "en",
    } = body;

    if (!spreadId) {
      return NextResponse.json({ error: "Missing spreadId" }, { status: 400 });
    }

    const spread = getSpreadById(spreadId);
    if (!spread) {
      return NextResponse.json({ error: `Unknown spread: ${spreadId}` }, { status: 404 });
    }

    if (personaId) {
      const persona = getPersonaById(personaId);
      if (!persona) {
        return NextResponse.json({ error: `Unknown persona: ${personaId}` }, { status: 404 });
      }
    }

    // Question validation: max 200 characters
    if (question && typeof question === "string" && question.length > 200) {
      return NextResponse.json(
        { error: "Question exceeds maximum limit of 200 characters" },
        { status: 400 }
      );
    }

    // Execute server-side cryptographically secure draw
    const drawResult = executeSecureDraw({
      spreadId,
      userPickIndices: Array.isArray(userPickIndices) ? userPickIndices : undefined,
      allowReversals: typeof allowReversals === "boolean" ? allowReversals : true,
    });

    return NextResponse.json({
      success: true,
      readingId: drawResult.readingId,
      spread: drawResult.spread,
      cards: drawResult.cards,
      question: question || "",
      optionA: optionA || null,
      optionB: optionB || null,
      personaId: personaId || "sage",
      createdAt: drawResult.createdAt,
    });
  } catch (error: any) {
    console.error("Error executing draw:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute secure draw" },
      { status: 500 }
    );
  }
}
