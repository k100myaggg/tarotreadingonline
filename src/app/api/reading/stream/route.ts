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
                  maxOutputTokens: 6000,
                },
              });

              // 25-second timeout allows thorough archetypal research
              const streamPromise = model.generateContentStream(userPrompt);
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Gemini ${modelName} stream timeout`)), 25000)
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
              max_tokens: 5000,
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
          const elementalAffinity = card?.element ? `anchored in the sacred element of ${card.element.toUpperCase()}` : "holding foundational archetypal weight";
          const suitInsight = card?.suit ? `within the spiritual domain of ${card.suit}` : "as a supreme pillar of the Major Arcana";

          return {
            cardId: dc.cardId,
            cardName: cName,
            orientation: orientationStr as "upright" | "reversed",
            positionIndex: i,
            positionName: posName,
            coreEssence: `${cName} in the ${posName} reveals ${
              isRev ? "an inward recalibration, shadow contemplation, and quiet restructuring of" : "a dynamic outward manifestation, illumination, and conscious empowerment of"
            } ${card?.keywords.upright.slice(0, 3).join(", ") || "vital archetypal energies"}.`,
            contextualMeaning:
              `Sitting prominently in the station of "${posName}" and ${elementalAffinity} (${suitInsight}), ${cName} ${
                isRev
                  ? "presents itself in the reversed orientation. Far from indicating misfortune, this reversal signals that its raw spiritual currents are currently operating beneath the conscious threshold. It urges you to engage in rigorous internal introspection, dissolve self-limiting assumptions, and realign with your deepest authentic values before taking irreversible outer leaps."
                  : "stands upright in full luminescent power, broadcasting direct clarity, conscious momentum, and dynamic manifestation into your physical reality."
              }\n\n` +
              `Archetypally, this card channels ${isRev ? card?.meanings.reversed : card?.meanings.upright}. Visually and esoterically, its symbolism highlights the intersection between personal willpower and universal timing. Regarding your specific inquiry concerning "${question || "your current life transition"}", it serves as an uncompromising sacred mirror: it prompts you to observe where you may be giving away your personal power or clinging to obsolete expectations that no longer serve your highest growth.\n\n` +
              `When woven into the broader tapestry of your spread, ${cName} acts as a vital bridge. It counsels you to cultivate quiet discernment over hasty reactions, hold your emotional boundaries with dignified grace, and trust that the subtle energetic shifts occurring right now are laying down the indestructible foundation for your forthcoming breakthrough.`,
            advice: `Reflect deeply in your personal journal: What unresolved fear or truth does ${cName} invite you to embrace today, and how can you honor this guidance through one sovereign choice?`,
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
            `आपके गंभीर प्रश्न "${question || "आंतरिक मार्गदर्शन, जीवन-परिवर्तन और आत्म-स्पष्टता"}" के उत्तर में, इन 78 पवित्र ताश के पत्तों ने आपके वर्तमान आध्यात्मिक, मानसिक और व्यावहारिक जीवन का एक अत्यंत विस्तृत, बहु-आयामी और गहन दर्पण प्रस्तुत किया है।\n\n` +
            `इस प्रसार की आधारशिला पर उपस्थित ${card1Name} आपकी उन संचित ऊर्जाओं, पिछले संघर्षों और अर्जित परिपक्वता को उद्घाटित करता है, जिसने आपके इस वर्तमान मोड़ की नींव रखी है। यहाँ की ऊर्जा यह सिद्ध करती है कि आपके अतीत के अनुभव कोई व्यर्थ बाधाएँ नहीं थीं; उन्होंने आपके भीतर एक ऐसा अडिग आत्म-विश्वास और आंतरिक शांति गढ़ी है, जो अब आपके सबसे बड़े मार्गदर्शक के रूप में कार्य कर रही है।\n\n` +
            `वर्तमान के केंद्र में स्थित ${card2Name} उस सूक्ष्म मनोवैज्ञानिक तनाव और निर्णायक चौराहे को स्पष्ट करता है, जहाँ आपकी चेतना इस समय सक्रिय रूप से केंद्रित है। यह कार्ड आपके अंतर्मन के उस द्वंद्व को सामने लाता है, जहाँ बाहरी अपेक्षाओं और आपकी आत्मा की सच्ची पुकार के बीच संतुलन साधना अनिवार्य हो गया है। जल्दबाजी में निर्णय लेने के बजाय, यह क्षण अपनी आंतरिक लय को पहचानने और उन सीमाओं को दृढ़ करने का है, जो आपकी मानसिक शांति की रक्षा करती हैं।\n\n` +
            `अचेतन मन और छाया-तत्वों (Shadow Aspects) के स्तर पर, यह प्रसार संकेत देता है कि जो अज्ञात भय या अनिश्चितता आपको विचलित कर रही है, वह वास्तव में आपकी छिपी हुई रचनात्मक शक्ति का आह्वान है। जब आप पुराने भावनात्मक पैटर्नों को छोड़ते हैं, तो वह ऊर्जा जो पहले चिंता में व्यय हो रही थी, स्वतः ही आपके संकल्प को सुदृढ़ करने लगती है।\n\n` +
            `भविष्य के उन्मुक्त क्षितिज पर दृष्टि डालते हुए, ${card3Name} एक अत्यंत प्रकाशमय, स्पष्ट और सुसंगत दिशा-निर्देश प्रदान करता है। यह स्पष्ट करता है कि जैसे ही आप अपने आंतरिक सत्य के प्रति निष्ठावान होते हैं, बिखरी हुई परिस्थितियाँ स्वतः एक नए सामंजस्य में ढलने लगेंगी। जो मार्ग पहले जटिल या धुंधला प्रतीत हो रहा था, वह अब आत्म-स्वायत्तता और गरिमा के साथ आगे बढ़ने के लिए पूर्णतः प्रशस्त होगा।\n\n` +
            `स्मरण रहे कि टैरो कोई अटल या निष्क्रिय भाग्य की घोषणा नहीं है, बल्कि यह आपकी जाग्रत चेतना का जीवंत रोडमैप है। इन पवित्र प्रतीकों के संवाद को अपने हृदय में स्थान दें, अपनी अंतःप्रेरणा पर अडिग भरोसा रखें, और पूरे आत्म-विश्वास के साथ अपने अगले कदम उठाएं।`;
        } else if (activeLocale === "ja") {
          narrativeAnalysis =
            `${salutationStr}\n\n` +
            `あなたのお尋ねになった「${question || "魂の導き、人生の変容、そして真の明晰さ"}」に対し、タロットの神聖なるアーキタイプは、現在の意識と運命の流れを余すところなく映し出す、極めて重層的で深遠なヴィジョンを織り上げました。\n\n` +
            `まず、このスプレッドの根底に位置する【${card1Name}】は、あなたがこれまでに歩んできた軌跡、培われた不屈の精神、そして知恵の基盤を明らかにしています。過去の困難や試練は決して偶然の産物ではなく、現在の岐路においてあなたを力強く支える内なる確信の礎となっているのです。\n\n` +
            `そして、現在の変容の中心核に現れた【${card2Name}】は、今まさにあなたの魂が直面している重要な選択と心理的ダイナミクスを照らし出しています。ここでは外部の喧騒や他者の期待に振り回されることなく、自らの中心に静かに留まり、恐れに基づいた衝動的な決断を避けることが求められています。直観と理性の調和こそが鍵となります。\n\n` +
            `無意識の領域において、このスプレッドは長年抱えてきた古い思い込みや防衛機制を手放す絶好の好機が訪れていることを示唆しています。抑圧されていた感情や影（シャドウ）に光を当てることで、これまで浪費されていたエネルギーが真の自己実現へと転換されていきます。\n\n` +
            `さらに未来の地平線を告げる【${card3Name}】は、自己主権の確立と新たな統合の可能性を高らかに宣言しています。あなたが自己の真実に対して誠実であり続ける限り、目前の不透明さは晴れ渡り、より確かな調和と前進への道筋が自然と開かれていくでしょう。\n\n` +
            `タロットは固定された運命の宣告ではなく、生きているあなたの意識が紡ぎ出す羅針盤です。これらのシンボルの対話を深く受け止め、揺るぎない尊厳と静かな勇気を持って、あなたの未来へと歩みを進めてください。`;
        } else {
          narrativeAnalysis =
            `${salutationStr}\n\n` +
            `In response to your deeply held inquiry regarding "${question || "seeking profound clarity, energetic alignment, and navigating this life transition"}", the sacred archetypes have assembled across the cosmic loom to weave an exhaustive, multidimensional mirror of your living spiritual and psychological landscape.\n\n` +
            `At the foundational threshold of this reading, the presence of ${card1Name} illuminates the karmic bedrock and accumulated wisdom that has delivered you to this pivotal moment. It confirms that the trials, emotional investments, and patient endurance of your recent past were neither accidental nor in vain. Rather, they have quietly forged an inner reservoir of resilience and discernment—a sacred grounding that now serves as your anchor as you stand before this threshold of expansion.\n\n` +
            `Occupying the beating heart of your present moment, ${card2Name} commands conscious vigilance over the acute friction and pivotal crossroads confronting you right now. This archetype exposes the living interface where conscious willpower meets subconscious hesitation. Rather than reacting impulsively to external pressures or adopting false urgency, this card invites you to pause in sacred stillness. It asks you to calibrate your internal moral compass, separate transient anxiety from genuine intuition, and establish impenetrable boundaries that safeguard your sovereignty.\n\n` +
            `Beneath the surface of everyday awareness, the elemental and numerological dialogue of these cards exposes the subtle shadow currents at play. You are being asked to confront where habitual patterns of self-doubt, over-functioning, or emotional complacency have outlived their purpose. By releasing the unconscious need for external validation, you liberate tremendous creative vitality that has previously been bound up in vigilance, freeing that energy to fuel your genuine self-actualization.\n\n` +
            `Looking forward across the unfolding horizon, ${card3Name} projects a commanding ray of integration, resolution, and emerging destiny. It signals that as you integrate these lessons with unflinching honesty and deliberate discernment, the perceived discord of the present dissolves into coherent, empowered clarity. The path forward is not one of struggle, but of intentional alignment with your highest self.\n\n` +
            `Remember always that the tarot does not dictate an unyielding fatalism; it serves as a dynamic compass attuned to your living consciousness. Reverently hold the teachings of these archetypes, trust the quiet voice of your inner authority, and step forward with unshakeable grace, knowing you are fully equipped to author this next chapter.`;
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
