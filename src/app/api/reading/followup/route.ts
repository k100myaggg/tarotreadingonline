import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkCrisisIntent } from "@/lib/ai/safetyGuardrails";
import { getPersonaById, allCards, getCardDisplayName } from "@/lib/tarot/data";
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
  const cardsText = drawnCardsSummary || "the sacred cards upon your altar";

  // 1. Check if user is asking about a specific card (e.g., "what is means of this Knight of Swords", "ten of swords", etc.)
  const matchedCard = allCards.find((card) => {
    const enName = card.name.en.toLowerCase();
    const idSlug = card.id.replace(/_/g, " ").toLowerCase();
    const localizedName = getCardDisplayName(card, locale).toLowerCase();
    return (
      qLower.includes(enName) ||
      qLower.includes(idSlug) ||
      qLower.includes(localizedName) ||
      (card.name.en.includes("Knight of Swords") && qLower.includes("knight of swords")) ||
      (card.name.en.includes("Ten of Swords") && qLower.includes("ten of swords")) ||
      (card.name.en.includes("Three of Pentacles") && qLower.includes("three of pentacles"))
    );
  });

  if (matchedCard) {
    const cardTitle = getCardDisplayName(matchedCard, locale);
    const isRevContext = qLower.includes("reversed") || cardsText.toLowerCase().includes(`${matchedCard.name.en.toLowerCase()} (reversed)`);
    const meaning = isRevContext ? matchedCard.meanings.reversed : matchedCard.meanings.upright;
    const keywords = (isRevContext ? matchedCard.keywords.reversed : matchedCard.keywords.upright).join(", ");

    if (locale === "hi") {
      return `**${cardTitle} (${isRevContext ? "उल्टा / Reversed" : "सीधा / Upright"}) का रहस्य व संदेश:**\n\n${meaning}\n\n**प्रमुख ऊर्जाएं (Key Themes):** ${keywords}.\n\nजब यह कार्ड आपके प्रश्न — "${originalQuestion || "इस स्थिति"}" — के संदर्भ में प्रकट होता है, तो यह दर्शाता है कि आपकी मानसिक तीव्रता और विचार बहुत शक्तिशाली हैं। कार्ड का मार्गदर्शन है कि जल्दबाजी या क्रोध में प्रतिक्रिया देने के बजाय, अपने विचारों को शांत व संतुलित दिशा दें।`;
    }

    return `### **The Archetypal Wisdom of ${cardTitle} (${isRevContext ? "Reversed" : "Upright"})**\n\n${meaning}\n\n**Core Essences & Keywords:** *${keywords}*.\n\n**In the context of your inquiry ("${originalQuestion || "your path"}"):**\nWhen this archetype speaks in your spread, it calls your attention to how your thoughts, ambitions, and inner drive are currently operating. Rather than acting impulsively or getting swept into mental turbulence, the card invites you to slow down, breathe deeply, and direct your sharp intellect with deliberate wisdom and compassionate clarity.`;
  }

  // 2. Integration / Daily Life Guidance
  if (qLower.includes("integrate") || qLower.includes("daily life") || qLower.includes("apply") || qLower.includes("routine")) {
    if (locale === "hi") {
      return `इस स्प्रेड (${cardsText}) की ऊर्जा को अपनी दैनिक दिनचर्या में शामिल करने के लिए:\n\n1. **प्रातःकालीन आत्म-अवलोकन:** हर सुबह 5 मिनट मौन में बैठकर अपने मन के विचारों को बिना किसी निर्णय के देखें।\n2. **सचेत प्रतिक्रिया:** जब भी दिनभर में कोई तनावपूर्ण स्थिति आए, तुरंत बोलने या फैसला लेने के बजाय 3 गहरी सांसें लें।\n3. **आंतरिक विश्वास:** जो मार्गदर्शन इन कार्ड्स ने आपके प्रश्न ("${originalQuestion}") के लिए दिया है, उस पर दृढ़ रहें। स्पष्टता बाहरी दौड़भाग से नहीं, आंतरिक शांति से फलित होगी।`;
    }
    return `To weave the wisdom of this spread (${cardsText}) into your daily rhythm:\n\n1. **Morning Breathwork & Center:** Begin each day with five minutes of quiet grounding. Ground your mind before engaging with external demands.\n2. **Pause Before Reacting:** When faced with friction or haste throughout your day, take three conscious breaths. Remember that true sovereignty chooses thoughtful response over impulsive reaction.\n3. **Honor the Threshold:** Trust the transition indicated in your reading regarding "${originalQuestion}". Take one gentle, disciplined step today that honors your peace over panic.`;
  }

  // 3. Shadow / Blind Spot / Unconscious
  if (qLower.includes("shadow") || qLower.includes("unconscious") || qLower.includes("blind spot") || qLower.includes("overlooking")) {
    return `When examining the unconscious shadow currents around "${originalQuestion || "your situation"}", the cards (${cardsText}) reveal a subtle tension between what you want to control and what is asking to be surrendered.\n\nThe shadow at play is often the belief that admitting vulnerability or uncertainty equals weakness. In truth, acknowledging your hesitation or unspoken doubts is precisely what unlocks transformation. Allow yourself to observe what you have been avoiding—it holds the key to your breakthrough.`;
  }

  // 4. Greetings
  if (qLower.length <= 5 && (qLower.includes("hi") || qLower.includes("ho") || qLower.includes("hey") || qLower.includes("hello") || qLower.includes("ok"))) {
    return `Greetings, seeker. I am centered here with your spread (${cardsText}) regarding "${originalQuestion || "your inquiry"}". Feel free to ask me about the meaning of any individual card, your next steps, or the overarching spiritual lesson of this moment.`;
  }

  // 5. Default Contextual Reflection
  return `In reflecting upon your question — "${userQuestion}" — under the light of ${cardsText}:\n\nThe cards reveal that the tension you feel is not a roadblock, but a sacred threshold. When outer noise quiets down, listen to what your intuition whispers. The guidance woven into your spread regarding "${originalQuestion}" reminds you that you already possess the inner discernment required to navigate this chapter with courage and grace.`;
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

    const systemPrompt = `You are ${personaName}, a wise and compassionate tarot reader continuing a contemplative dialogue.
${persona.systemPromptModifier}

READING CONTEXT:
Original Question: "${originalQuestion}"
Spread Cards: ${drawnCardsSummary}
Spread Synthesis: ${synthesisSummary}

GUIDELINES:
- Directly answer the seeker's follow-up question ("${userQuestion}") with deep, nuanced tarot wisdom.
- If they ask about a specific card (such as Knight of Swords, Ten of Swords, etc.), thoroughly explain that card's symbolism, upright/reversed significance, and how it applies to their situation.
- Keep the response evocative, clear, and between 2 to 3 paragraphs.
- Respond in ${activeLocale === "hi" ? "Hindi (हिन्दी)" : activeLocale === "ja" ? "Japanese (日本語)" : "English"}.`;

    // 1. Google Gemini Followup (Try Gemini 3.8 Flash then 2.0 Flash with generous 20s timeout)
    if (geminiApiKey) {
      const preferredModel = (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();
      const candidateModels = Array.from(
        new Set([preferredModel, "gemini-3.8-flash", "gemini-2.0-flash", "gemini-1.5-flash"])
      );
      const genAI = new GoogleGenerativeAI(geminiApiKey);

      const historyContext = (conversationHistory as Array<{ role: string; content: string }>)
        .map((msg) => `${msg.role === "assistant" ? personaName : "Seeker"}: ${msg.content}`)
        .join("\n\n");

      const promptWithContext = historyContext
        ? `${historyContext}\n\nSeeker's Follow-up Question: ${userQuestion}`
        : `Seeker's Question: ${userQuestion}`;

      for (const modelName of candidateModels) {
        try {
          // Attempt 1: Call with systemInstruction
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 650,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini ${modelName} timeout`)), 18000)
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
        } catch (firstErr: any) {
          // Attempt 2: If systemInstruction is unsupported, call with systemPrompt embedded in main prompt
          try {
            const fallbackModel = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 650,
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Gemini ${modelName} fallback timeout`)), 18000)
            );

            const result = (await Promise.race([
              fallbackModel.generateContent(`${systemPrompt}\n\n${promptWithContext}`),
              timeoutPromise,
            ])) as any;

            const text = result?.response?.text();
            if (text && text.trim()) {
              reply = text.trim();
              break;
            }
          } catch (secondErr: any) {
            console.error(`Gemini followup error with ${modelName}:`, secondErr?.message || secondErr);
          }
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
          max_tokens: 650,
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

    // 3. Dynamic Contextual Fallback (If API key is missing or offline)
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
