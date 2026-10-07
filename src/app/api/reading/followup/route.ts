import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkCrisisIntent } from "@/lib/ai/safetyGuardrails";
import { getPersonaById } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";

export const maxDuration = 30;

const MAX_FOLLOWUPS = 5;

// Intelligent dynamic fallback generator that customizes the response to the user's specific inquiry and cards
function generateDynamicFollowupFallback({
  userQuestion,
  originalQuestion,
  drawnCardsSummary,
  personaName,
  locale,
}: {
  userQuestion: string;
  originalQuestion: string;
  drawnCardsSummary: string;
  personaName: string;
  locale: Locale;
}): string {
  const qLower = userQuestion.toLowerCase().trim();
  const cardsText = drawnCardsSummary || "the cards on your altar";

  if (locale === "hi") {
    if (qLower.includes("shadow") || qLower.includes("छवि") || qLower.includes("डर") || qLower.includes("unconscious") || qLower.includes("अंधेरा")) {
      return `आपके प्रश्न — "${userQuestion}" — पर ध्यान केंद्रित करते हुए, आपके स्प्रेड की ऊर्जा (${cardsText}) यह दर्शाती है कि आपकी सबसे बड़ी अनदेखी छाया वह संकोच या पूर्णतावाद है जो आपको सहज बहने से रोक रहा है। जब आप परिणामों को नियंत्रित करने की जिद छोड़ते हैं, तो अंतर्मन की वास्तविक शक्ति उजागर होती है।`;
    }
    if (qLower.includes("love") || qLower.includes("प्रेम") || qLower.includes("रिश्ता") || qLower.includes("partner")) {
      return `सम्बंधों के विषय में आपके प्रश्न — "${userQuestion}" — का उत्तर देते हुए, इन कार्ड्स की ऊर्जा आपको आत्म-सम्मान और भावनात्मक संतुलन बनाए रखने का सुझाव देती है। जो प्रेम और स्वीकृति आप स्वयं को देंगे, वही आपके सम्बंधों में भी प्रतिबिंबित होगी।`;
    }
    if (qLower.includes("career") || qLower.includes("job") || qLower.includes("पैसा") || qLower.includes("काम") || qLower.includes("future")) {
      return `आपके कर्म और भविष्य के संबंध में, इन कार्ड्स (${cardsText}) का गहरा संदेश है कि जल्दबाजी में लिए गए निर्णयों से बचें। इस समय आधार मजबूत करने पर ध्यान दें; सही दिशा में उठाया गया एक छोटा, दृढ़ कदम लंबे समय तक स्थायित्व देगा।`;
    }
    return `आपके प्रश्न — "${userQuestion}" — पर विचार करते हुए, ${cardsText} की ऊर्जा आपको याद दिलाती है कि उत्तर बाहरी परिस्थितियों में नहीं, बल्कि आपकी आंतरिक समझ में छिपा है। कार्ड्स की सलाह है कि जो अंतर्दृष्टि आपको पहले मिली है, उस पर विश्वास रखें और शांत मन से आगे बढ़ें।`;
  }

  // English dynamic contextual responses
  if (qLower.length <= 4 && (qLower.includes("hi") || qLower.includes("ho") || qLower.includes("hey") || qLower.includes("ok"))) {
    return `Greetings, seeker. I am centered here with your spread (${cardsText}) regarding "${originalQuestion || "your inquiry"}". Ask me any deeper inquiry about your cards, an upcoming decision, or the energetic currents around your question.`;
  }

  if (qLower.includes("shadow") || qLower.includes("unconscious") || qLower.includes("blind spot") || qLower.includes("overlooking")) {
    return `When examining the unconscious shadow around "${originalQuestion || "your situation"}", the cards (${cardsText}) reveal a subtle tension between what you want to control and what is asking to be surrendered.\n\nThe shadow at play is often the belief that admitting vulnerability equals weakness. In truth, acknowledging your hesitation or unspoken doubts is precisely what unlocks transformation. Allow yourself to observe what you have been avoiding—it holds the key to your breakthrough.`;
  }

  if (qLower.includes("next step") || qLower.includes("action") || qLower.includes("what should i do") || qLower.includes("how to")) {
    return `Regarding your practical next step on "${userQuestion}":\n\nThe energetic signature of ${cardsText} counsels deliberate alignment over impulsive motion. Rather than rushing outward to fix or force an outcome, anchor your next step in radical honesty with yourself. Take one tangible, grounded action in the coming 24 hours that honors your intuition, then allow the universe space to respond.`;
  }

  if (qLower.includes("love") || qLower.includes("relationship") || qLower.includes("heart") || qLower.includes("feelings")) {
    return `Looking into the relational dimension of your inquiry ("${userQuestion}"):\n\nThrough ${cardsText}, the mirror of tarot reflects that external harmony begins with internal sovereignty. Where you seek validation or certainty from another, the cards ask you to first offer that grace to yourself. True intimacy flourishes when you show up as your authentic self without masks.`;
  }

  if (qLower.includes("career") || qLower.includes("money") || qLower.includes("work") || qLower.includes("finances") || qLower.includes("success")) {
    return `In examining your material and vocational path through "${userQuestion}":\n\nThe presence of ${cardsText} indicates that you are in a cycle of foundational restructuring. Do not mistake a period of quiet preparation for stagnation. Trust that your current efforts are laying bedrock for sustained fulfillment rather than temporary gains.`;
  }

  return `In contemplating your inquiry — "${userQuestion}" — under the light of ${cardsText}:\n\nThe cards reveal that the tension you feel is not a roadblock, but a threshold. Pay close attention to what your intuition whispers when all outer noise quiets down. The guidance woven into your spread reminds you that you already possess the inner discernment required to navigate this chapter with grace.`;
}

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

    // Detect API key from common environment variable names and strip accidental quotes
    const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || "";
    const geminiApiKey = rawGeminiKey.replace(/['"\s]/g, "");

    const anthropicApiKey = (process.env.ANTHROPIC_API_KEY || "").replace(/['"\s]/g, "");
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

    // 1. Google Gemini Followup (Try Gemini 2.0 Flash then 1.5 Flash with timeout race)
    if (geminiApiKey) {
      const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
      const genAI = new GoogleGenerativeAI(geminiApiKey);

      const historyContext = (conversationHistory as Array<{ role: string; content: string }>)
        .map((msg) => `${msg.role === "assistant" ? personaName : "Seeker"}: ${msg.content}`)
        .join("\n\n");

      const promptWithContext = historyContext
        ? `${historyContext}\n\nSeeker's Follow-up Question: ${userQuestion}`
        : `Seeker's Question: ${userQuestion}`;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini ${modelName} timeout`)), 7000)
          );

          const result = (await Promise.race([
            model.generateContent(promptWithContext),
            timeoutPromise,
          ])) as any;

          const text = result?.response?.text();
          if (text && text.trim()) {
            reply = text.trim();
            break;
          }
        } catch (geminiErr: any) {
          console.error(`Gemini followup error with ${modelName}:`, geminiErr?.message || geminiErr);
        }
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
        console.error("Anthropic followup error:", err?.message || err);
      }
    }

    // 3. Dynamic Contextual Fallback (If API key is missing in Vercel or exhausted)
    if (!reply) {
      reply = generateDynamicFollowupFallback({
        userQuestion,
        originalQuestion,
        drawnCardsSummary,
        personaName,
        locale: activeLocale,
      });
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
