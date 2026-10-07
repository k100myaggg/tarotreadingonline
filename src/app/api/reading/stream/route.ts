import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkCrisisIntent } from "@/lib/ai/safetyGuardrails";
import { buildTarotReadingPrompt } from "@/lib/ai/promptBuilder";
import { getSpreadById, getPersonaById, getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { DrawnCardData, Locale, StructuredReadingResponse } from "@/types/tarot";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      readingId,
      spreadId,
      question,
      optionA,
      optionB,
      personaId,
      drawnCards,
      locale = "en",
    } = body;

    const activeLocale = (locale as Locale) || "en";

    // 1. Safety & Crisis Intercept Guardrail
    if (question) {
      const crisisCheck = checkCrisisIntent(question);
      if (crisisCheck.isCrisis) {
        return new Response(
          JSON.stringify({
            isCrisis: true,
            crisisPayload: crisisCheck,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 2. Validate spread, persona, and drawn cards
    const spread = getSpreadById(spreadId);
    if (!spread) {
      return new Response(JSON.stringify({ error: `Unknown spread ${spreadId}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const persona = getPersonaById(personaId) || getPersonaById("sage")!;
    const validatedCards = (drawnCards as DrawnCardData[]) || [];

    // 3. Build Prompt
    const { systemPrompt, userPrompt } = buildTarotReadingPrompt({
      question,
      optionA,
      optionB,
      spread,
      drawnCards: validatedCards,
      persona,
      locale: activeLocale,
    });

    const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || "";
    const geminiApiKey = rawGeminiKey.replace(/['"\s]/g, "");
    let geminiModel = (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
    if (geminiModel.includes("3.8") || !geminiModel.startsWith("gemini-")) {
      geminiModel = "gemini-2.0-flash";
    }

    const anthropicApiKey = (process.env.ANTHROPIC_API_KEY || "").replace(/['"\s]/g, "");
    const anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    // Set up Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // 1. Google Gemini Streaming (Free tier via Google AI Studio)
        if (geminiApiKey) {
          try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({
              model: geminiModel,
              systemInstruction: systemPrompt,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3500,
              },
            });

            // 7-second race timeout so Gemini never hangs Vercel serverless function
            const streamPromise = model.generateContentStream(userPrompt);
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Gemini stream generation timeout")), 7000)
            );

            const resultStream = await Promise.race([streamPromise, timeoutPromise]);
            let fullAccumulated = "";

            for await (const chunk of resultStream.stream) {
              const text = chunk.text();
              if (text) {
                fullAccumulated += text;
                sendEvent({ type: "delta", text });
              }
            }

            // Send done signal
            try {
              const cleaned = fullAccumulated.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              sendEvent({ type: "complete", parsed });
            } catch {
              sendEvent({ type: "complete", rawText: fullAccumulated });
            }
            controller.close();
            return;
          } catch (geminiErr: any) {
            console.error("Gemini API Error, falling back to instant simulation:", geminiErr?.message || geminiErr);
          }
        }

        // 2. Anthropic Claude Streaming
        if (anthropicApiKey) {
          try {
            const anthropic = new Anthropic({ apiKey: anthropicApiKey });
            const responseStream = await anthropic.messages.stream({
              model: anthropicModel,
              max_tokens: 3000,
              temperature: 0.7,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
            });

            let fullAccumulated = "";

            for await (const chunk of responseStream) {
              if (
                chunk.type === "content_block_delta" &&
                chunk.delta.type === "text_delta"
              ) {
                const text = chunk.delta.text;
                fullAccumulated += text;
                sendEvent({ type: "delta", text });
              }
            }

            // Send done signal
            try {
              const cleaned = fullAccumulated.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              sendEvent({ type: "complete", parsed });
            } catch {
              sendEvent({ type: "complete", rawText: fullAccumulated });
            }
            controller.close();
            return;
          } catch (apiErr: any) {
            console.error("Anthropic API Error, falling back to simulated engine:", apiErr.message);
          }
        }

        // High-Fidelity Simulation Stream (when API key is not yet set or in offline demo)
        const personaName = persona.name[activeLocale] || persona.name.en;
        const simulatedCards = validatedCards.map((dc, i) => {
          const card = getCardById(dc.cardId);
          const cName = card ? getCardDisplayName(card, activeLocale) : dc.cardId;
          const posName = spread.positions[i]?.name[activeLocale] || `Position ${i + 1}`;
          const isRev = dc.isReversed;
          const orientationStr = isRev ? "reversed" : "upright";

          return {
            cardId: dc.cardId,
            cardName: cName,
            orientation: orientationStr as "upright" | "reversed",
            positionIndex: i,
            positionName: posName,
            coreEssence: `${cName} in the ${posName} reveals ${
              isRev ? "an inward recalibration of" : "a dynamic forward expression of"
            } ${card?.keywords.upright[0] || "energy"}.`,
            contextualMeaning: `Within your inquiry, this archetypal presence mirrors ${
              isRev ? card?.meanings.reversed : card?.meanings.upright
            } Notice the subtle currents here: when this energy touches your crossroads, clarity unfolds naturally.`,
            advice: `What would change if you fully accepted the truth this card holds for your path?`,
          };
        });

        const simulatedResponse: StructuredReadingResponse = {
          readerPersona: personaName,
          intro: `Greetings, seeker. The cards have arranged themselves across the cosmic loom. In response to your question: "${
            question || "General guidance"
          }", let us examine what has been brought forth from the depths.`,
          cards: simulatedCards,
          spreadSynthesis: `Synthesizing this spread reveals a sacred progression. The foundational forces call for honest discernment, bridging the space between old habits and emerging possibilities. With ${
            validatedCards.filter((c) => c.isReversed).length
          } card(s) appearing inverted, the primary work right now is internal alignment before decisive external leaps.`,
          actionableStep: `Take one concrete step in the next 24 hours: write down the single highest priority illuminated by the ${
            simulatedCards[0]?.cardName || "first card"
          }, and commit to honoring that boundary.`,
          followUpSuggestions: [
            `How can I best integrate the lesson of the ${simulatedCards[0]?.cardName || "cards"}?`,
            `What unconscious shadow might I be overlooking in this situation?`,
            `What is the most supportive daily ritual to nurture this outcome?`,
          ],
        };

        const serialized = JSON.stringify(simulatedResponse, null, 2);
        const chunkSize = 24;

        for (let i = 0; i < serialized.length; i += chunkSize) {
          const slice = serialized.slice(i, i + chunkSize);
          sendEvent({ type: "delta", text: slice });
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        sendEvent({ type: "complete", parsed: simulatedResponse });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Streaming error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Stream error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
