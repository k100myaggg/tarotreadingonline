"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReadingStore } from "@/stores/useReadingStore";
import {
  allSpreads,
  allPersonas,
  getSpreadById,
  getPersonaById,
  getCardById,
  getCardDisplayName,
  getPersonaDisplayName,
} from "@/lib/tarot/data";
import { Locale, StructuredReadingResponse } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Fallback2DCardField } from "@/components/3d/Fallback2DCardField";
import { ReadingStreamViewer } from "@/components/ui/ReadingStreamViewer";
import { FollowupChat } from "@/components/ui/FollowupChat";
import { Footer } from "@/components/ui/Footer";
import { SanctuarySettingsModal } from "@/components/ui/SanctuarySettingsModal";
import { ReadingTypeConfig } from "@/lib/tarot/readingTypes";
import { calculateYesNoVerdict, YesNoVerdict } from "@/lib/tarot/yesNoLogic";
import { PersonaAvatar } from "@/components/ui/PersonaAvatar";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  X,
  Compass,
  CheckCircle2,
  HelpCircle,
  Split,
  Heart,
  Calendar,
} from "lucide-react";

const TarotCanvas = dynamic(
  () => import("@/components/3d/TarotCanvas").then((mod) => mod.TarotCanvas),
  { ssr: false }
);

interface DedicatedReadingRoomProps {
  config: ReadingTypeConfig;
  locale: Locale;
}

function generateDedicatedClientReading(
  spread: any,
  drawnCards: any[],
  persona: any,
  question: string,
  locale: Locale,
  config: ReadingTypeConfig
): StructuredReadingResponse {
  const personaName = persona?.name?.[locale] || persona?.name?.en || "The Oracle";
  const readingTitle = config.name[locale] || config.name.en;

  const cards = drawnCards.map((dc, i) => {
    const card = getCardById(dc.cardId);
    const cName = card ? getCardDisplayName(card, locale) : dc.cardId;
    const posName = spread?.positions?.[i]?.name?.[locale] || `Position ${i + 1}`;
    const isRev = dc.isReversed;
    const elementalAffinity = card?.element
      ? `anchored in the element of ${card.element.toUpperCase()}`
      : "holding deep archetypal weight";
    const suitDomain = card?.suit ? `within the realm of ${card.suit}` : "as a cornerstone of the Major Arcana";

    const para1 = `Stationed within "${posName}" and ${elementalAffinity} (${suitDomain}), ${cName} ${
      isRev
        ? "appears in its reversed orientation. In traditional esoteric wisdom, a reversal is not an ill omen, but an invitation toward inward contemplation. It signifies that the vibrant currents of this archetype are currently working beneath the surface of conscious awareness, urging you to re-evaluate internal beliefs, dissolve old patterns of resistance, and align with your deeper truth before taking outward steps."
        : "stands upright in clear luminescent vitality, radiating direct conscious awareness, vigor, and manifest outward realization into your physical reality."
    }`;

    const para2 = `Archetypally, this card embodies ${isRev ? card?.meanings.reversed : card?.meanings.upright}. Visually and esoterically, its symbolism illuminates the intersection between personal willpower and divine timing. Regarding your specific inquiry concerning "${question || "your current path and life transition"}", it serves as an uncompromising sacred mirror: it prompts you to observe where you may be giving away your personal power or clinging to obsolete expectations that no longer serve your highest growth.`;

    const para3 = `When woven into the broader tapestry of your spread, ${cName} acts as a vital bridge. It counsels you to cultivate quiet discernment over hasty reactions, hold your emotional boundaries with dignified grace, and trust that the subtle energetic shifts occurring right now are laying down the indestructible foundation for your forthcoming breakthrough.`;

    return {
      cardId: dc.cardId,
      cardName: cName,
      orientation: (isRev ? "reversed" : "upright") as "upright" | "reversed",
      positionIndex: i,
      positionName: posName,
      coreEssence: `${cName} in ${posName} reveals ${
        isRev
          ? "an inward recalibration, shadow contemplation, and quiet restructuring of"
          : "a dynamic outward manifestation, illumination, and conscious empowerment of"
      } ${card?.keywords.upright.slice(0, 3).join(", ") || "vital archetypal energies"}.`,
      contextualMeaning: `${para1}\n\n${para2}\n\n${para3}`,
      advice: `Reflect deeply in your personal journal: What unresolved fear or truth does ${cName} invite you to embrace today, and how can you honor this guidance through one sovereign choice?`,
    };
  });

  const salutationStr = locale === "hi" ? "प्रिय साधक," : locale === "ja" ? "親愛なる探求者様へ、" : "Dear Seeker,";
  const card1Name = cards[0]?.cardName || "the opening card";
  const card2Name = cards[1]?.cardName || "the central card";
  const card3Name = cards[2]?.cardName || "the horizon card";

  const overallAnalysis = locale === "hi"
    ? `${salutationStr}\n\n` +
      `आपके ${readingTitle} के गंभीर प्रश्न "${question || "आंतरिक मार्गदर्शन, जीवन-परिवर्तन और आत्म-स्पष्टता"}" के उत्तर में, इन 78 पवित्र ताश के पत्तों ने आपके वर्तमान आध्यात्मिक, मानसिक और व्यावहारिक जीवन का एक अत्यंत विस्तृत, बहु-आयामी और गहन दर्पण प्रस्तुत किया है।\n\n` +
      `इस प्रसार की आधारशिला पर उपस्थित ${card1Name} आपकी उन संचित ऊर्जाओं, पिछले संघर्षों और अर्जित परिपक्वता को उद्घाटित करता है, जिसने आपके इस वर्तमान मोड़ की नींव रखी है। यहाँ की ऊर्जा यह सिद्ध करती है कि आपके अतीत के अनुभव कोई व्यर्थ बाधाएँ नहीं थीं; उन्होंने आपके भीतर एक ऐसा अडिग आत्म-विश्वास और आंतरिक शांति गढ़ी है, जो अब आपके सबसे बड़े मार्गदर्शक के रूप में कार्य कर रही है।\n\n` +
      `वर्तमान के केंद्र में स्थित ${card2Name} उस सूक्ष्म मनोवैज्ञानिक तनाव और निर्णायक चौराहे को स्पष्ट करता है, जहाँ आपकी चेतना इस समय सक्रिय रूप से केंद्रित है। यह कार्ड आपके अंतर्मन के उस द्वंद्व को सामने लाता है, जहाँ बाहरी अपेक्षाओं और आपकी आत्मा की सच्ची पुकार के बीच संतुलन साधना अनिवार्य हो गया है। जल्दबाजी में निर्णय लेने के बजाय, यह क्षण अपनी आंतरिक लय को पहचानने और उन सीमाओं को दृढ़ करने का है, जो आपकी मानसिक शांति की रक्षा करती हैं।\n\n` +
      `अचेतन मन और छाया-तत्वों (Shadow Aspects) के स्तर पर, यह प्रसार संकेत देता है कि जो अज्ञात भय या अनिश्चितता आपको विचलित कर रही है, वह वास्तव में आपकी छिपी हुई रचनात्मक शक्ति का आह्वान है। जब आप पुराने भावनात्मक पैटर्नों को छोड़ते हैं, तो वह ऊर्जा जो पहले चिंता में व्यय हो रही थी, स्वतः ही आपके संकल्प को सुदृढ़ करने लगती है।\n\n` +
      `भविष्य के उन्मुक्त क्षितिज पर दृष्टि डालते हुए, ${card3Name} एक अत्यंत प्रकाशमय, स्पष्ट और सुसंगत दिशा-निर्देश प्रदान करता है। यह स्पष्ट करता है कि जैसे ही आप अपने आंतरिक सत्य के प्रति निष्ठावान होते हैं, बिखरी हुई परिस्थितियाँ स्वतः एक नए सामंजस्य में ढलने लगेंगी। जो मार्ग पहले जटिल या धुंधला प्रतीत हो रहा था, वह अब आत्म-स्वायत्तता और गरिमा के साथ आगे बढ़ने के लिए पूर्णतः प्रशस्त होगा।\n\n` +
      `स्मरण रहे कि टैरो कोई अटल या निष्क्रिय भाग्य की घोषणा नहीं है, बल्कि यह आपकी जाग्रत चेतना का जीवंत रोडमैप है। इन पवित्र प्रतीकों के संवाद को अपने हृदय में स्थान दें, अपनी अंतःप्रेरणा पर अडिग भरोसा रखें, और पूरे आत्म-विश्वास के साथ अपने अगले कदम उठाएं।`
    : locale === "ja"
    ? `${salutationStr}\n\n` +
      `あなたのお尋ねになった「${question || "魂の導き、人生の変容、そして真の明晰さ"}」に対し、タロットの神聖なるアーキタイプは、現在の意識と運命の流れを余すところなく映し出す、極めて重層的で深遠なヴィジョンを織り上げました。\n\n` +
      `まず、このスプレッドの根底に位置する【${card1Name}】は、あなたがこれまでに歩んできた軌跡、培われた不屈の精神、そして知恵の基盤を明らかにしています。過去の困難や試練は決して偶然の産物ではなく、現在の岐路においてあなたを力強く支える内なる確信の礎となっているのです。\n\n` +
      `そして、現在の変容の中心核に現れた【${card2Name}】は、今まさにあなたの魂が直面している重要な選択と心理的ダイナミクスを照らし出しています。ここでは外部の喧騒や他者の期待に振り回されることなく、自らの中心に静かに留まり、恐れに基づいた衝動的な決断を避けることが求められています。直観と理性の調和こそが鍵となります。\n\n` +
      `無意識の領域において、このスプレッドは長年抱えてきた古い思い込みや防衛機制を手放す絶好の好機が訪れていることを示唆しています。抑圧されていた感情や影（シャドウ）に光を当てることで、これまで浪費されていたエネルギーが真の自己実現へと転換されていきます。\n\n` +
      `さらに未来の地平線を告げる【${card3Name}】は、自己主権の確立と新たな統合の可能性を高らかに宣言しています。あなたが自己の真実に対して誠実であり続ける限り、目前の不透明さは晴れ渡り、より確かな調和と前進への道筋が自然と開かれていくでしょう。\n\n` +
      `タロットは固定された運命の宣告ではなく、生きているあなたの意識が紡ぎ出す羅針盤です。これらのシンボルの対話を深く受け止め、揺るぎない尊厳と静かな勇気を持って、あなたの未来へと歩みを進めてください。`
    : `${salutationStr}\n\n` +
      `In response to your deeply held ${readingTitle} inquiry regarding "${question || "seeking profound clarity, energetic alignment, and navigating this life transition"}", the sacred archetypes have assembled across the cosmic loom to weave an exhaustive, multidimensional mirror of your living spiritual and psychological landscape.\n\n` +
      `At the foundational threshold of this reading, the presence of ${card1Name} illuminates the karmic bedrock and accumulated wisdom that has delivered you to this pivotal moment. It confirms that the trials, emotional investments, and patient endurance of your recent past were neither accidental nor in vain. Rather, they have quietly forged an inner reservoir of resilience and discernment—a sacred grounding that now serves as your anchor as you stand before this threshold of expansion.\n\n` +
      `Occupying the beating heart of your present moment, ${card2Name} commands conscious vigilance over the acute friction and pivotal crossroads confronting you right now. This archetype exposes the living interface where conscious willpower meets subconscious hesitation. Rather than reacting impulsively to external pressures or adopting false urgency, this card invites you to pause in sacred stillness. It asks you to calibrate your internal moral compass, separate transient anxiety from genuine intuition, and establish impenetrable boundaries that safeguard your sovereignty.\n\n` +
      `Beneath the surface of everyday awareness, the elemental and numerological dialogue of these cards exposes the subtle shadow currents at play. You are being asked to confront where habitual patterns of self-doubt, over-functioning, or emotional complacency have outlived their purpose. By releasing the unconscious need for external validation, you liberate tremendous creative vitality that has previously been bound up in vigilance, freeing that energy to fuel your genuine self-actualization.\n\n` +
      `Looking forward across the unfolding horizon, ${card3Name} projects a commanding ray of integration, resolution, and emerging destiny. It signals that as you integrate these lessons with unflinching honesty and deliberate discernment, the perceived discord of the present dissolves into coherent, empowered clarity. The path forward is not one of struggle, but of intentional alignment with your highest self.\n\n` +
      `Remember always that the tarot does not dictate an unyielding fatalism; it serves as a dynamic compass attuned to your living consciousness. Reverently hold the teachings of these archetypes, trust the quiet voice of your inner authority, and step forward with unshakeable grace, knowing you are fully equipped to author this next chapter.`;

  return {
    readerPersona: personaName,
    intro: `Welcome, seeker. The sacred arcana have aligned their tapestry for your ${readingTitle}: "${
      question || "spiritual discernment and growth"
    }".`,
    overallAnalysis,
    cards,
    spreadSynthesis: `The sacred interplay of these cards reveals that clarity begins from within. Honor the lessons of the foundation as you bridge into the possibilities ahead.`,
    actionableStep: `Take one concrete action within 24 hours to honor the guidance revealed by the ${
      cards[0]?.cardName || "cards"
    }.`,
    followUpSuggestions: [
      `How can I integrate the wisdom of this spread into my daily life?`,
      `What blind spot should I remain mindful of?`,
      `What ritual or contemplation will support me today?`,
    ],
  };
}

export function DedicatedReadingRoom({ config, locale }: DedicatedReadingRoomProps) {
  const {
    step,
    question,
    optionA,
    optionB,
    spreadId,
    personaId,
    userPickIndices,
    drawnCards,
    revealedIndices,
    allowReversals,
    setStep,
    setQuestion,
    setOptions,
    setSpreadId,
    setPersonaId,
    setAllowReversals,
    togglePickIndex,
    clearPicks,
    setDrawnCards,
    revealAllCards,
    setFollowupInput,
    resetReading,
  } = useReadingStore();

  const dict = getDictionary(locale);
  const [use2DFallback, setUse2DFallback] = useState(false);
  const [showOptions, setShowOptions] = useState(Boolean(config.isTwoChoices || optionA || optionB));
  const [isSubmittingDraw, setIsSubmittingDraw] = useState(false);
  const [isCollapsingShuffle, setIsCollapsingShuffle] = useState(false);
  const [crisisData, setCrisisData] = useState<any>(null);
  const isStreamingStartedRef = useRef(false);

  const {
    isStreaming,
    streamedText,
    readingResponse,
    setStreaming,
    setStreamedText,
    setReadingResponse,
  } = useReadingStore();

  // Initialize reading spread for this page
  useEffect(() => {
    const store = useReadingStore.getState();
    if (store.spreadId !== config.spreadId || store.step === "complete") {
      resetReading();
      setSpreadId(config.spreadId);
      setQuestion(config.defaultQuestion[locale] || config.defaultQuestion.en);
    } else {
      setSpreadId(config.spreadId);
      if (!question) {
        setQuestion(config.defaultQuestion[locale] || config.defaultQuestion.en);
      }
    }
    if (config.isTwoChoices) {
      setShowOptions(true);
    }
  }, [config.spreadId, config.slug]);

  const currentSpread = getSpreadById(config.spreadId) || allSpreads[0];
  const currentPersona = getPersonaById(personaId) || allPersonas[0];
  const requiredPicks = currentSpread?.cardCount || config.cardCount;
  const picksRemaining = requiredPicks - userPickIndices.length;

  // Stream reader interpretation
  useEffect(() => {
    if (step !== "streaming") {
      isStreamingStartedRef.current = false;
      return;
    }

    if (isStreamingStartedRef.current || readingResponse) return;

    isStreamingStartedRef.current = true;
    setStreaming(true);
    setStreamedText("");

    async function streamReading() {
      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 45000);

      try {
        const response = await fetch("/api/reading/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            spreadId: config.spreadId,
            question,
            optionA,
            optionB,
            personaId,
            drawnCards,
            locale,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initialize stream");
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          if (json.isCrisis) {
            setCrisisData(json.crisisPayload);
            setStreaming(false);
            setStep("complete");
            return;
          }
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";

          for (const msg of messages) {
            const lines = msg.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                try {
                  const eventData = JSON.parse(trimmed.slice(6));
                  if (eventData.type === "delta") {
                    accumulated += eventData.text;
                    setStreamedText(accumulated);
                  } else if (eventData.type === "complete") {
                    let parsedData = eventData.parsed;
                    if (!parsedData && eventData.rawText) {
                      const clean = eventData.rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
                      try { parsedData = JSON.parse(clean); } catch {}
                    }
                    if (parsedData) {
                      setReadingResponse(parsedData);
                      setStreaming(false);
                      setStep("complete");
                    }
                  }
                } catch {}
              }
            }
          }
        }

        if (accumulated && !useReadingStore.getState().readingResponse) {
          try {
            const clean = accumulated.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);
            setReadingResponse(parsed);
            setStreaming(false);
            setStep("complete");
          } catch {}
        }
      } catch (err: any) {
        console.error("Stream reader error:", err);
      } finally {
        clearTimeout(timeoutId);
        setStreaming(false);
        if (!useReadingStore.getState().readingResponse) {
          const fallback = generateDedicatedClientReading(
            currentSpread,
            drawnCards,
            currentPersona,
            question,
            locale,
            config
          );
          setReadingResponse(fallback);
          setStep("complete");
        }
      }
    }

    streamReading();
  }, [step, config.spreadId, question, optionA, optionB, personaId, drawnCards, locale]);

  const handleStartDivination = () => {
    if (!question.trim()) {
      alert("Please enter your question or intention.");
      return;
    }
    setStep("shuffling");
  };

  const handleFinishShuffling = () => {
    if (isCollapsingShuffle) return;
    setIsCollapsingShuffle(true);
    setTimeout(() => {
      setStep("cutting");
      setIsCollapsingShuffle(false);
    }, 1000);
  };

  const handleConfirmDraw = async () => {
    if (userPickIndices.length !== requiredPicks) return;

    try {
      setIsSubmittingDraw(true);
      const res = await fetch("/api/reading/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          spreadId: config.spreadId,
          personaId,
          userPickIndices,
          optionA,
          optionB,
          allowReversals,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to draw cards");
      }

      const data = await res.json();
      setDrawnCards(data.cards, data.readingId);
      setStep("revealing");
    } catch (err: any) {
      alert(err.message || "An error occurred while drawing cards");
    } finally {
      setIsSubmittingDraw(false);
    }
  };

  const isCompleteStage = step === "complete" && Boolean(readingResponse);
  const isRitualStage = !isCompleteStage;

  // Compute Yes/No verdict if this is a Yes/No reading
  let yesNoVerdict: YesNoVerdict | null = null;
  if (config.isYesNo && drawnCards.length > 0) {
    const firstCard = getCardById(drawnCards[0].cardId);
    yesNoVerdict = calculateYesNoVerdict(firstCard, drawnCards[0].isReversed);
  }

  const chipsList = config.chips[locale] || config.chips.en || [];

  return (
    <div
      className={`relative w-full bg-[#040208] text-slate-100 selection:bg-amber-400 selection:text-neutral-950 ${
        isRitualStage
          ? "fixed inset-0 w-screen h-screen overflow-hidden"
          : "min-h-screen overflow-y-auto"
      }`}
    >
      {/* ─── 1. FULL-SCREEN 3D COSMOS VIEWPORT (Ritual Stages) ─── */}
      {isRitualStage && (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-auto">
          {use2DFallback ? (
            <div className="w-full h-full p-4 flex items-center justify-center bg-[#070512]">
              <Fallback2DCardField locale={locale} />
            </div>
          ) : (
            <TarotCanvas
              locale={locale}
              isCollapsing={isCollapsingShuffle}
              className="w-full h-full"
            />
          )}
        </div>
      )}

      {/* ─── 2. TOP HUD NAVIGATION BAR (Pinned, Minimalist) ─── */}
      <div className="fixed top-0 left-0 right-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto backdrop-blur-xl bg-black/60 border-b border-amber-500/20 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href={`/${locale}`}
            className="font-serif-sacred text-sm sm:text-base font-bold tracking-widest text-amber-100 hover:text-amber-300 transition-colors flex items-center gap-2"
          >
            <span>ARCANA 3D</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
          </Link>

          <span className="text-[10px] font-mono-sacred text-amber-400/90 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 uppercase tracking-wider">
            {config.romanNumeral} · {config.name[locale] || config.name.en}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-sacred">
          {step !== "question" && (
            <button
              type="button"
              onClick={resetReading}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900/70 transition-all text-xs"
              title="Reset Reading"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <SanctuarySettingsModal
            locale={locale}
            compact
            onToggle2D={() => setUse2DFallback(!use2DFallback)}
            is2DActive={use2DFallback}
          />

          <Link
            href={`/${locale}`}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-amber-200 hover:bg-white/10 transition-colors"
            title="Exit to Sanctuary"
            aria-label="Exit to Sanctuary"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─── 3. STEP 1: DEDICATED QUESTION INQUIRY MODAL ─── */}
      {step === "question" && isRitualStage && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-3 sm:p-4 pt-14 pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-400 max-h-[calc(100vh-4.2rem)] flex flex-col">
            <div className="rounded-2xl p-4 sm:p-5 bg-[#0b0816]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl shadow-purple-950/60 space-y-3 overflow-y-auto">
              {/* Badge & Roman Numeral Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono-sacred text-[10px] text-amber-400 tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ✦ ARCANUM {config.romanNumeral} · {config.badge} ✦
                </span>
                <span className="font-mono-sacred text-[10px] text-slate-400">
                  {requiredPicks} {requiredPicks === 1 ? "Card" : "Cards"}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="font-serif-sacred text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
                  {config.name[locale] || config.name.en}
                </h1>
                <p className="text-xs font-serif-sacred italic text-amber-300/80 mt-0.5">
                  {config.subtitle[locale] || config.subtitle.en}
                </p>
                <p className="text-[11px] text-slate-300 font-light mt-1 leading-relaxed">
                  {config.description[locale] || config.description.en}
                </p>
              </div>

              {/* Question Input */}
              <div className="relative">
                <label className="font-serif-sacred text-[11px] font-semibold text-amber-200 uppercase tracking-wider block mb-1">
                  Your Sacred Intention / Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                  placeholder={config.defaultQuestion[locale] || config.defaultQuestion.en}
                  rows={2}
                  className="w-full bg-[#06040d]/90 border border-amber-500/30 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm leading-relaxed transition-all shadow-inner resize-none"
                />

                {/* Inspiration Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {chipsList.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(chip)}
                      className="text-[9.5px] font-mono-sacred px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 text-slate-300 hover:text-amber-200 transition-all text-left truncate max-w-[220px]"
                    >
                      ✦ {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Choices Options (If applicable) */}
              {config.isTwoChoices && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <div>
                    <span className="text-[9px] font-mono-sacred text-amber-300 uppercase block mb-0.5">
                      OPTION A (PATH 1)
                    </span>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptions(e.target.value, optionB)}
                      placeholder="e.g.: Stay at current job"
                      className="w-full bg-[#080512] border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono-sacred text-amber-300 uppercase block mb-0.5">
                      OPTION B (PATH 2)
                    </span>
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptions(optionA, e.target.value)}
                      placeholder="e.g.: Accept new venture offer"
                      className="w-full bg-[#080512] border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Persona Selector */}
              <div className="pt-1.5 border-t border-white/5">
                <label className="font-serif-sacred text-[11px] font-semibold text-amber-200 uppercase tracking-wider block mb-1.5">
                  Reader Persona
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {allPersonas.map((persona) => {
                    const isSelected = personaId === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setPersonaId(persona.id)}
                        className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400"
                            : "bg-black/40 border-white/5 text-slate-400 hover:border-amber-500/30"
                        }`}
                      >
                        <PersonaAvatar personaId={persona.id} size="sm" active={isSelected} className="mb-1" />
                        <span className="font-serif-sacred font-bold text-[10px] truncate w-full">
                          {getPersonaDisplayName(persona, locale)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Divination Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleStartDivination}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f4ebd0] via-[#fff7e6] to-[#f4ebd0] hover:brightness-105 text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-800 group-hover:rotate-12 transition-transform" />
                  <span>{(dict.readingRoom?.startDivination || "START")} {(config.name[locale] || config.name.en).toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-800 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: SHUFFLING STAGE ─── */}
      {step === "shuffling" && (
        <>
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{dict.readingRoom?.aligningFreq || "ALIGNING ARCHETYPAL FREQUENCIES"}</span>
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100 drop-shadow">
              {dict.readingRoom?.shufflingHeader || "Shuffling... Please meditate on your question"}
            </h2>
            <p className="font-serif-sacred text-xs sm:text-sm text-amber-200/80 italic max-w-md mx-auto mt-1 line-clamp-1">
              "{question}"
            </p>
          </div>

          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
            <button
              type="button"
              onClick={handleFinishShuffling}
              disabled={isCollapsingShuffle}
              className="px-9 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{isCollapsingShuffle ? (dict.readingRoom?.coalescingDeck || "COALESCING DECK...") : (dict.readingRoom?.finishShuffling || "FINISH SHUFFLING")}</span>
              <ArrowRight className="w-4 h-4 text-amber-800" />
            </button>
          </div>
        </>
      )}

      {/* ─── STEP 2.5: CUTTING RITUAL ─── */}
      {step === "cutting" && (
        <>
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{dict.readingRoom?.cutRitualBadge || "SACRED RITUAL · PERSONAL ENERGETIC IMPRINT"}</span>
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100 drop-shadow">
              {dict.readingRoom?.cutRitualTitle || "Cut the Sacred Deck"}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto mt-1">
              {dict.readingRoom?.cutRitualHint || "Tap the deck above to divide the cards and imprint your intention into the reading."}
            </p>
          </div>

          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
            <button
              type="button"
              onClick={() => setStep("picking")}
              className="px-8 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{dict.readingRoom?.fanOutCards || "Fan Out Cards"}</span>
              <ArrowRight className="w-4 h-4 text-amber-800" />
            </button>
          </div>
        </>
      )}

      {/* ─── STEP 3: PICKING STAGE ─── */}
      {step === "picking" && (
        <>
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4">
            <h2 className="text-xl sm:text-2xl text-amber-100 font-semibold drop-shadow">
              {dict.readingRoom?.selectCardsPrompt || "Select"} {requiredPicks} {requiredPicks === 1 ? (dict.spreadsSection?.cardSingular || "card") : (dict.spreadsSection?.cardPlural || "cards")}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-medium">
              {picksRemaining > 0
                ? `${userPickIndices.length} / ${requiredPicks}`
                : (dict.readingRoom?.allCardsSelected || "All cards selected")}
            </p>
          </div>

          {picksRemaining === 0 && (
            <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
              <button
                type="button"
                disabled={isSubmittingDraw}
                onClick={handleConfirmDraw}
                className="px-10 py-3.5 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-sm uppercase tracking-widest shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 animate-bounce"
              >
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>{isSubmittingDraw ? "..." : (dict.readingRoom?.revealAllCards || "REVEAL SPREAD →")}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── STEP 4: REVEALING STAGE ─── */}
      {step === "revealing" && (
        <>
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase block mb-1">
              ✦ SACRED SACRAMENT ✦
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl text-amber-100 font-bold">
              {dict.reader?.revealButton || "Flip the cards to reveal their orientation"}
            </h2>
            <p className="text-xs font-mono-sacred text-slate-300 mt-1">
              {dict.readingRoom?.cutRitualHint || "Click each card to flip and commune with its divine arcana"}
            </p>
          </div>

          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center items-center gap-3 pointer-events-auto px-4">
            <button
              type="button"
              onClick={revealAllCards}
              className="px-6 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/60 text-amber-200 text-xs font-mono-sacred hover:bg-amber-500/20 transition-all shadow-xl shadow-black/90"
            >
              {dict.readingRoom?.revealAllCards || "Reveal All"} ({revealedIndices.length}/{drawnCards.length})
            </button>

            {revealedIndices.length === drawnCards.length && (
              <button
                type="button"
                onClick={() => setStep("streaming")}
                className="px-8 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-neutral-950 font-serif-sacred font-bold text-xs uppercase tracking-wider transition-all shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>{(dict.readingRoom?.synthesizeReading || "Synthesize")} ({config.name[locale] || config.name.en})</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
              </button>
            )}
          </div>
        </>
      )}

      {/* ─── STEP 5: SYNTHESIS STREAMING HUD ─── */}
      {step === "streaming" && !readingResponse && (
        <>
          <div className="fixed top-16 left-0 right-0 z-30 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/90 backdrop-blur-xl border border-amber-400/50 shadow-2xl shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="font-serif-sacred font-bold text-xs sm:text-sm text-amber-100">
                {locale === "hi"
                  ? "पवित्र प्रतीकों व ब्रह्मांडीय ऊर्जाओं का गूढ़ विश्लेषण..."
                  : "Channeling Archetypal Wisdom & Cosmic Guidance..."}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="font-mono-sacred text-[11px] text-amber-300/80 mt-2 drop-shadow">
              {locale === "hi"
                ? "प्राचीन 78 कार्ड्स की शक्तियों का समन्वय · गहन बहु-आयामी मार्गदर्शन"
                : "CONSULTING CELESTIAL ARCHIVES · WEAVING MULTIDIMENSIONAL SPIRITUAL INSIGHT"}
            </p>
          </div>

          <div className="fixed bottom-7 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-4 animate-in fade-in duration-500">
            <div className="w-56 sm:w-64 h-1.5 bg-black/70 rounded-full overflow-hidden border border-amber-500/30 shadow-xl">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 animate-[shimmer_1.5s_infinite]"
                style={{ width: "100%" }}
              />
            </div>
            <span className="text-[10px] font-mono-sacred text-amber-400/80 mt-2 uppercase tracking-widest flex items-center gap-1.5">
              <span>✦</span>
              <span>TRANSCRIBING SACRED CURRENTS...</span>
              <span>✦</span>
            </span>
          </div>
        </>
      )}

      {/* ─── STEP 6: COMPLETE READING VIEW (HERO CARDS ON TOP + VERDICT + DEEP WISDOM) ─── */}
      {isCompleteStage && (
        <div className="relative w-full min-h-screen pt-16 flex flex-col items-center">
          <div className="w-full h-[360px] sm:h-[420px] relative z-10">
            {use2DFallback ? (
              <div className="w-full h-full flex items-center justify-center bg-[#070512]">
                <Fallback2DCardField locale={locale} />
              </div>
            ) : (
              <TarotCanvas
                locale={locale}
                className="w-full h-full"
              />
            )}
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
              <span className="font-mono-sacred text-[10px] text-amber-300/90 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 uppercase tracking-widest shadow-xl">
                ✦ Sacred {config.name[locale] || config.name.en} Altar ✦
              </span>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto px-4 pb-24 relative z-20 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* If Yes/No Tarot: Render Prominent Glowing Verdict Card */}
            {yesNoVerdict && (
              <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#120d24] to-[#070510] border border-amber-400/50 shadow-2xl shadow-purple-950/80 text-center relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <span className="font-mono-sacred text-[11px] text-amber-400 uppercase tracking-widest block mb-2">
                  ✦ ORACLE DECISIVE VERDICT ✦
                </span>

                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/80 border border-amber-400/60 shadow-xl mb-3">
                  <span className={`text-2xl sm:text-3xl font-black font-serif-sacred bg-gradient-to-r ${yesNoVerdict.toneColor} bg-clip-text text-transparent`}>
                    VERDICT: {yesNoVerdict.verdict}
                  </span>
                  <span className="text-xs font-mono-sacred text-amber-300 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                    {yesNoVerdict.affirmativeRate}% Flow
                  </span>
                </div>

                <h3 className="font-serif-sacred text-base sm:text-lg text-amber-100 font-semibold mb-1">
                  {yesNoVerdict.headline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {yesNoVerdict.summary}
                </p>
              </div>
            )}

            <ReadingStreamViewer
              reading={readingResponse}
              rawStreamText={streamedText}
              isStreaming={isStreaming}
              crisisData={crisisData}
              locale={locale}
              onSelectFollowup={(suggestedQ) => {
                setFollowupInput(suggestedQ);
                const el = document.getElementById("followup-input");
                if (el) {
                  el.focus({ preventScroll: true });
                }
              }}
              followupChatNode={<FollowupChat locale={locale} />}
            />

            {/* Bottom Actions: Draw Another Card / Reset */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-amber-500/20 pt-6">
              <button
                type="button"
                onClick={resetReading}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{dict.readingRoom?.askAnotherQuestion || "Ask Another Question"}</span>
              </button>
              <Link
                href={`/${locale}/spreads`}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-200 text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>{dict.readingRoom?.exploreAllReadings || "Explore All Readings"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Full Site Footer at the end of Reading Results - 100% full-width edge-to-edge */}
          <div className="w-full mt-16 border-t border-amber-500/10">
            <Footer locale={locale} forceShow />
          </div>
        </div>
      )}
    </div>
  );
}
