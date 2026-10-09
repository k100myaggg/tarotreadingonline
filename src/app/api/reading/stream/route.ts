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
    const preferredModel = (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
    const candidateStreamModels = Array.from(
      new Set([preferredModel, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"])
    );

    const anthropicApiKey = (process.env.ANTHROPIC_API_KEY || "").replace(/['"\s]/g, "");
    const anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    // Set up Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // 1. Google Gemini Streaming (Deep research via Gemini 2.0 Flash / 1.5 Flash)
        if (geminiApiKey) {
          const genAI = new GoogleGenerativeAI(geminiApiKey);

          for (const modelName of candidateStreamModels) {
            try {
              const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemPrompt,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 3500,
                },
              });

              // 20-second timeout allows thorough archetypal research
              const streamPromise = model.generateContentStream(userPrompt);
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Gemini ${modelName} stream timeout`)), 20000)
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

              if (fullAccumulated) {
                try {
                  const cleaned = fullAccumulated.replace(/```json/gi, "").replace(/```/g, "").trim();
                  const parsed = JSON.parse(cleaned);
                  sendEvent({ type: "complete", parsed });
                } catch {
                  sendEvent({ type: "complete", rawText: fullAccumulated });
                }
                controller.close();
                return;
              }
            } catch (geminiErr: any) {
              console.error(`Gemini streaming error with ${modelName}:`, geminiErr?.message || geminiErr);
            }
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
          const elementalAffinity = card?.element ? `anchored in the element of ${card.element.toUpperCase()}` : "holding sacred archetypal weight";
          const suitInsight = card?.suit ? `within the realm of ${card.suit}` : "as a primary pillar of the Major Arcana";

          return {
            cardId: dc.cardId,
            cardName: cName,
            orientation: orientationStr as "upright" | "reversed",
            positionIndex: i,
            positionName: posName,
            coreEssence: `${cName} in the ${posName} reveals ${
              isRev ? "an inward recalibration and quiet restructuring of" : "a dynamic forward illumination of"
            } ${card?.keywords.upright.slice(0, 2).join(" and ") || "sacred energy"}.`,
            contextualMeaning:
              `Sitting in the position of "${posName}" and ${elementalAffinity} (${suitInsight}), ${cName} ${
                isRev
                  ? "appears reversed, signaling that this energy is operating beneath the surface, prompting internal contemplation and course-correction rather than outward action."
                  : "stands upright, channeling direct outward clarity, vigor, and conscious manifestation."
              }\n\n` +
              `Archetypally, this card embodies ${isRev ? card?.meanings.reversed : card?.meanings.upright}. Regarding your specific inquiry into "${question || "your current path"}", it serves as an uncompromising mirror: it calls you to examine how your past emotional conditioning or present commitments align with your deepest authentic values.\n\n` +
              `When integrated with the surrounding cards, ${cName} urges you not to compromise your inner integrity. Embrace the subtle shifts taking place within you, allowing this symbol to awaken clarity and quiet confidence in your discernment.`,
            advice: `Reflect deeply: How can you honor the sacred teaching of ${cName} without fear, and what truth is ready to be acknowledged today?`,
          };
        });

        const salutationStr = activeLocale === "hi" ? "प्रिय साधक," : activeLocale === "ja" ? "親愛なる探求者様へ、" : "Dear Seeker,";
        const card1Name = simulatedCards[0]?.cardName || "the opening archetype";
        const card2Name = simulatedCards[1]?.cardName || "the central card";
        const card3Name = simulatedCards[2]?.cardName || "the horizon card";

        let narrativeAnalysis = "";
        if (activeLocale === "hi") {
          narrativeAnalysis =
            `${salutationStr}\n\n` +
            `आपके प्रश्न "${question || "मार्गदर्शन और आंतरिक स्पष्टता"}" के संदर्भ में, इन पवित्र पत्तों ने आपके वर्तमान जीवन-पथ का एक अत्यंत विस्तृत और गूढ़ दर्पण प्रस्तुत किया है।\n\n` +
            `इस प्रसार की शुरुआत में ${card1Name} आपकी उस आधारभूत शक्ति और संचित अनुभवों को उजागर करता है, जिसने आपको इस मोड़ तक पहुंचाया है। यहाँ की ऊर्जा यह दर्शाती है कि अतीत की परिस्थितियाँ अब आपके आत्म-साक्षात्कार की आधारशिला बन चुकी हैं, और जो कुछ भी आपने सीखा है, वह अब व्यर्थ नहीं जाएगा।\n\n` +
            `वर्तमान के केंद्र में ${card2Name} की उपस्थिति यह स्पष्ट करती है कि इस समय आपके भीतर या आपके परिवेश में कौन सी सूक्ष्म शक्ति सक्रिय है। यह कार्ड आपके अंतर्मन के उस द्वंद्व या आकर्षण को रेखांकित करता है, जहाँ जल्दबाजी की बजाय आत्म-संयम, सजगता और गहरी समझ की आवश्यकता है। यह समय बाहरी कोलाहल से हटकर अपनी सच्ची प्राथमिकताओं को पहचानने का है।\n\n` +
            `आगे बढ़ते हुए, भविष्य के क्षितिज पर ${card3Name} एक शक्तिशाली दिशा-निर्देश प्रदान करता है। यह संकेत देता है कि जब आप अपने संदेहों को छोड़कर अपने आत्म-सम्मान और नैतिक सिद्धांतों के साथ संरेखित होते हैं, तो जटिल प्रतीत होने वाले मार्ग भी स्वतः सुगम होने लगते हैं।\n\n` +
            `टैरो कोई अटल भाग्य नहीं, बल्कि आपकी जीवित चेतना का जीवंत प्रतिबिंब है। इन तीनों कार्ड्स का यह सामंजस्य आपको यह विश्वास दिलाता है कि आपके पास अपनी दिशा तय करने का पूर्ण सामर्थ्य है। अपने अंतर्ज्ञान पर भरोसा रखें और धैर्यपूर्वक अपने मार्ग पर दृढ़ रहें।`;
        } else if (activeLocale === "ja") {
          narrativeAnalysis =
            `${salutationStr}\n\n` +
            `あなたのお尋ねになった「${question || "魂の導きと深い明晰さ"}」に対して、タロットの神聖なるシンボルは、現在の人生の岐路を深く映し出す豊かな織物を紡ぎ出しました。\n\n` +
            `まず、過去と基盤を象徴する位置にある【${card1Name}】は、これまでの経験と潜在的な強みがどのように現在の状況を形作ってきたかを示しています。あなたが培ってきた知恵は決して無駄ではなく、確固たる土台として息づいています。\n\n` +
            `現在という変容の中心に現れた【${card2Name}】は、今この瞬間に直面している心理的ダイナミクスと感情の流れを照らし出しています。焦りや周囲の期待に惑わされることなく、内なる直観と冷静な洞察力をもって本質を見極めることが求められています。\n\n` +
            `そして、未来の地平線を告げる【${card3Name}】は、調和と自己主権への道筋を示唆しています。内なる恐れを手放し、自らの価値観に誠実に行動するとき、新たな可能性の扉が静かに開かれていくでしょう。\n\n` +
            `タロットは固定された運命ではなく、あなたの意識の鏡です。これらのアーキタイプの対話を心に留め、一歩一歩確かな確信を持ってあなたの道を進んでください。`;
        } else {
          narrativeAnalysis =
            `${salutationStr}\n\n` +
            `In response to your inquiry regarding "${question || "seeking profound clarity and energetic alignment"}", the sacred cards have woven an intricate, multidimensional mirror of your current spiritual and psychological crossroads.\n\n` +
            `At the foundation of this spread, the presence of ${card1Name} reveals the energetic momentum and underlying wisdom that brought you to this threshold. It reminds you that the tests and lessons of your recent journey were not accidental; they have quietly cultivated resilience, discernment, and an inner depth that you are now called to rely upon.\n\n` +
            `At the center of your immediate experience, ${card2Name} captures the living tension and pivotal crossroads demanding your conscious awareness right now. This archetype illuminates where conscious willpower meets subconscious resistance. Rather than reacting impulsively to outer demands, this card invites you to pause, calibrate your inner compass, and distinguish between transient anxiety and authentic intuitive truth.\n\n` +
            `Looking ahead to the horizon where your path continues to unfold, ${card3Name} casts a luminous ray of direction and resolution. It signifies that as you integrate these lessons with emotional honesty, the fragmentation begins to synthesize into cohesive clarity, unlocking a sustainable forward stride.\n\n` +
            `Remember that the tarot is not a rigid decree of passive fate, but an empowering compass reflecting the currents of your living consciousness. Honor the dialogue between these archetypes, hold firm boundaries where required, and allow the quiet wisdom of this reading to steady your spirit today.`;
        }

        const simulatedResponse: StructuredReadingResponse = {
          readerPersona: personaName,
          intro: `Greetings, seeker. The cards have arranged themselves across the cosmic loom. In response to your question: "${
            question || "General guidance"
          }", let us examine what has been brought forth from the depths.`,
          overallAnalysis: narrativeAnalysis,
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
