import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkCrisisIntent } from "@/lib/ai/safetyGuardrails";
import { getPersonaById } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";

const MAX_FOLLOWUPS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      readingId,
      personaId,
      originalQuestion,
      drawnCardsSummary,
      synthesisSummary,
      conversationHistory = [],
      userQuestion,
      locale = "en",
    } = body;

    if (!userQuestion || typeof userQuestion !== "string") {
      return NextResponse.json({ error: "Follow-up question is required" }, { status: 400 });
    }

    if (userQuestion.length > 300) {
      return NextResponse.json(
        { error: "Follow-up question exceeds maximum 300 characters" },
        { status: 400 }
      );
    }

    // Rate / Count limit check
    if (conversationHistory.length >= MAX_FOLLOWUPS * 2) {
      return NextResponse.json(
        { error: "Maximum follow-up questions reached for this reading session" },
        { status: 429 }
      );
    }

    // Crisis check on follow-up
    const crisisCheck = checkCrisisIntent(userQuestion);
    if (crisisCheck.isCrisis) {
      return NextResponse.json({ isCrisis: true, crisisPayload: crisisCheck });
    }

    const persona = getPersonaById(personaId) || getPersonaById("sage")!;
    const activeLocale = (locale as Locale) || "en";
    const personaName = persona.name[activeLocale] || persona.name.en;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    let reply = "";

    const systemPrompt = `You are ${personaName}, continuing a contemplative tarot reading dialogue.
${persona.systemPromptModifier}

READING CONTEXT:
Original Question: "${originalQuestion}"
Spread Cards: ${drawnCardsSummary}
Spread Synthesis: ${synthesisSummary}

GUIDELINES:
- Address the seeker's follow-up question while remaining anchored in the symbols and energy of the original drawn cards.
- Keep the response focused, evocative, and between 2-4 paragraphs.
- Maintain your exact persona voice and ethical guardrails (no deterministic health/legal/death predictions).
- Respond in ${activeLocale === "hi" ? "Hindi (हिन्दी)" : activeLocale === "ja" ? "Japanese (日本語)" : "English"}.`;

    // 1. Google Gemini Followup (Free tier)
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: geminiModel,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        });

        const historyContext = (conversationHistory as Array<{ role: string; content: string }>)
          .map((msg) => `${msg.role === "assistant" ? personaName : "Seeker"}: ${msg.content}`)
          .join("\n\n");

        const promptWithContext = historyContext
          ? `${historyContext}\n\nSeeker's Follow-up Question: ${userQuestion}`
          : `Seeker's Question: ${userQuestion}`;

        const result = await model.generateContent(promptWithContext);
        const text = result.response.text();
        if (text) {
          reply = text;
        }
      } catch (geminiErr: any) {
        console.error("Gemini followup error:", geminiErr?.message || geminiErr);
      }
    }

    // 2. Anthropic Claude Followup
    if (!reply && anthropicApiKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicApiKey });

        const messages: Anthropic.MessageParam[] = [];
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          });
        }
        messages.push({ role: "user", content: userQuestion });

        const response = await anthropic.messages.create({
          model: anthropicModel,
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages,
        });

        const firstBlock = response.content[0];
        if (firstBlock && firstBlock.type === "text") {
          reply = firstBlock.text;
        }
      } catch (err: any) {
        console.error("Anthropic followup error:", err.message);
      }
    }

    // Fallback simulation response if API key is not present or offline
    if (!reply) {
      reply = `In reflecting upon your question in the presence of these cards, notice how the current energy asks you to step back rather than force an immediate conclusion. When you inquire about this further, the cards remind us that true clarity is an internal harvest. Trust what has already been revealed in your spread and let this truth settle in your breathing.`;
    }

    return NextResponse.json({
      success: true,
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Follow-up endpoint error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process follow-up" },
      { status: 500 }
    );
  }
}
