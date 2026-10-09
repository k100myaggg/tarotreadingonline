"use client";

import React, { useState, use, useEffect, useRef } from "react";
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
  getSpreadDisplayName,
  getPersonaDisplayName,
} from "@/lib/tarot/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale, StructuredReadingResponse } from "@/types/tarot";
import { Fallback2DCardField } from "@/components/3d/Fallback2DCardField";
import { ReadingStreamViewer } from "@/components/ui/ReadingStreamViewer";
import { FollowupChat } from "@/components/ui/FollowupChat";
import { SanctuarySettingsModal } from "@/components/ui/SanctuarySettingsModal";
import { PersonaAvatar } from "@/components/ui/PersonaAvatar";
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  X,
} from "lucide-react";

// Dynamically import full-screen 3D Canvas with SSR disabled
const TarotCanvas = dynamic(
  () => import("@/components/3d/TarotCanvas").then((mod) => mod.TarotCanvas),
  { ssr: false }
);

interface ReadingPageProps {
  params: Promise<{ locale: string }>;
}

const INSPIRATION_CHIPS = [
  "What is the deeper lesson in my current transition?",
  "How can I align with greater emotional harmony?",
  "What spiritual forces are guiding my creative work?",
  "Which path serves my highest expansion right now?",
];

function generateClientReading(
  spread: any,
  drawnCards: any[],
  persona: any,
  question: string,
  locale: Locale
): StructuredReadingResponse {
  const personaName = persona?.name?.[locale] || persona?.name?.en || "The Oracle";
  const cards = drawnCards.map((dc, i) => {
    const card = getCardById(dc.cardId);
    const cName = card ? getCardDisplayName(card, locale) : dc.cardId;
    const posName = spread?.positions?.[i]?.name?.[locale] || `Position ${i + 1}`;
    const isRev = dc.isReversed;
    const meaning = isRev ? card?.meanings.reversed : card?.meanings.upright;
    return {
      cardId: dc.cardId,
      cardName: cName,
      orientation: (isRev ? "reversed" : "upright") as "upright" | "reversed",
      positionIndex: i,
      positionName: posName,
      coreEssence: `${cName} in ${posName} reflects ${
        isRev ? "an introspective internal recalibration of" : "a clear outward manifestation of"
      } ${card?.keywords.upright[0] || "energy"}.`,
      contextualMeaning: meaning || "Reflect on this card's guidance for your path.",
      advice: `Contemplate how ${cName} guides your highest discernment on this path.`,
    };
  });

  const salutationStr = locale === "hi" ? "प्रिय साधक," : locale === "ja" ? "親愛なる探求者様へ、" : "Dear Seeker,";
  const overallAnalysis = locale === "hi"
    ? `${salutationStr}\n\n` +
      `आपके द्वारा पूछे गए प्रश्न "${question || "आंतरिक स्पष्टता और मार्गदर्शन"}" के उत्तर में, ब्रह्मांडीय शक्तियों ने यह पवित्र विन्यास प्रकट किया है।\n\n` +
      `यह प्रसार दर्शाता है कि आपके जीवन का यह चरण आत्म-चिंतन और सजग निर्णयों का है। अतीत की सीखें वर्तमान के दोराहे पर प्रकाश डाल रही हैं, और आगे का मार्ग आपके आंतरिक संकल्प पर निर्भर करता है।\n\n` +
      `जब आप भय को त्यागकर सत्य और संतुलन का चयन करते हैं, तो दिशा स्वतः स्पष्ट हो जाती है। इन प्रतीकों की ऊर्जा को आत्मसात करें और सकारात्मक विश्वास के साथ अग्रसर हों।`
    : `${salutationStr}\n\n` +
      `In response to your inquiry regarding "${question || "seeking deeper insight and spiritual discernment"}", the cards have revealed an illuminating sacred synthesis.\n\n` +
      `Across this spread, a clear spiritual trajectory unfolds: you are being guided to step beyond old hesitation and anchor your intentions with quiet confidence. The interplay of archetypes highlights both your hidden inner strengths and the gentle course-corrections required right now.\n\n` +
      `Remember that tarot is not an unbending prophecy, but an empowering mirror of your living consciousness. As you navigate these currents, honor your discernment, trust the unfolding process, and allow the wisdom of each archetype to ground your daily decisions.`;

  return {
    readerPersona: personaName,
    intro: `Welcome, seeker. The sacred arcana have aligned their tapestry for your inquiry: "${
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

export default function ReadingPage({ params }: ReadingPageProps) {
  const resolvedParams = use(params);
  const locale = (resolvedParams.locale || "en") as Locale;
  const dict = getDictionary(locale);

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
    isAudioMuted,
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
    toggleAudio,
    resetReading,
  } = useReadingStore();

  const [use2DFallback, setUse2DFallback] = useState(false);
  const [showOptions, setShowOptions] = useState(Boolean(optionA || optionB));
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

  const currentSpread = getSpreadById(spreadId) || allSpreads[1];
  const currentPersona = getPersonaById(personaId) || allPersonas[0];
  const requiredPicks = currentSpread.cardCount;
  const picksRemaining = requiredPicks - userPickIndices.length;

  // Stream reader interpretation when transitioning into 'streaming' step
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
      const timeoutId = setTimeout(() => abortCtrl.abort(), 6000);

      try {
        const response = await fetch("/api/reading/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            spreadId,
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
                } catch {
                  // Partial chunk
                }
              }
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim().startsWith("data: ")) {
          try {
            const eventData = JSON.parse(buffer.trim().slice(6));
            if (eventData.type === "complete") {
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

        // Fallback: parse accumulated JSON if not already marked complete
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
        // Guaranteed fallback: If reading response not yet set, synthesize immediately from canonical card registry
        if (!useReadingStore.getState().readingResponse) {
          const fallback = generateClientReading(
            currentSpread,
            drawnCards,
            currentPersona,
            question,
            locale
          );
          setReadingResponse(fallback);
          setStep("complete");
        }
      }
    }

    streamReading();
  }, [step, spreadId, question, optionA, optionB, personaId, drawnCards, locale]);

  // Step 1 -> Step 2: Start Shuffling Vortex
  const handleStartDivination = () => {
    if (!question.trim()) {
      alert("Please enter a question or intention for the cards.");
      return;
    }
    setStep("shuffling");
  };

  // Step 2 -> Step 2.5: Finish Shuffling and Transition into Cutting Ritual
  const handleFinishShuffling = () => {
    if (isCollapsingShuffle) return;
    setIsCollapsingShuffle(true);
    // Allow the magnetic deck collapse animation to fully resolve before cutting ritual
    setTimeout(() => {
      setStep("cutting");
      setIsCollapsingShuffle(false);
    }, 1000);
  };

  // Step 3 -> Step 4: Confirm user pick selection and draw from CSPRNG engine
  const handleConfirmDraw = async () => {
    if (userPickIndices.length !== requiredPicks) return;

    try {
      setIsSubmittingDraw(true);

      const res = await fetch("/api/reading/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          spreadId,
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

  // Is current view a full-screen fixed ritual stage (question, shuffling, cutting, picking, revealing, weaving)?
  const isCompleteStage = step === "complete" && Boolean(readingResponse);
  const isRitualStage = !isCompleteStage;

  return (
    <div
      className={`relative w-full bg-[#040208] text-slate-100 selection:bg-amber-400 selection:text-neutral-950 ${
        isRitualStage
          ? "fixed inset-0 w-screen h-screen overflow-hidden"
          : "min-h-screen overflow-y-auto"
      }`}
    >
      {/* ─── 1. FULL-SCREEN 3D COSMOS VIEWPORT (For Ritual Stages: Question, Shuffling, Cutting, Picking, Revealing, Weaving) ─── */}
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

      {/* ─── 2. TOP HUD NAVIGATION BAR (Pinned, Minimalist, Mobile-Optimized) ─── */}
      <div className="fixed top-0 left-0 right-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto backdrop-blur-xl bg-black/60 border-b border-amber-500/20 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href={`/${locale}`}
            className="font-serif-sacred text-sm sm:text-base font-bold tracking-widest text-amber-100 hover:text-amber-300 transition-colors flex items-center gap-2"
          >
            <span>ARCANA 3D</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
          </Link>

          <span className="hidden md:inline-block text-[10px] font-mono-sacred text-amber-400/80 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 uppercase tracking-wider">
            DECK · RWS 1909 CANON · 78 CARDS
          </span>
        </div>

        {/* Action Controls: Compact, consolidated in Settings Modal */}
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

          {/* Consolidated Settings Gear (Audio, Volume, 2D/3D mode, Language) */}
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

      {/* ─── 3. STEP-SPECIFIC OVERLAYS (PINNED WITH ZERO CARD COLLISION) ─── */}

      {/* ─── STEP 1: FLOATING GLASS QUESTION INQUIRY (COMPACT & VIEWPORT SAFE) ─── */}
      {step === "question" && isRitualStage && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-3 sm:p-4 pt-14 pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-400 max-h-[calc(100vh-4.2rem)] flex flex-col">
            <div className="rounded-2xl p-4 sm:p-5 bg-[#0b0816]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl shadow-purple-950/60 space-y-3 overflow-y-auto">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono-sacred text-[10px] text-amber-400 tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SACRED ORACLE
                </span>
                <span className="font-mono-sacred text-[10px] text-slate-400">
                  {question.length}/200
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-serif-sacred text-lg sm:text-xl font-bold text-amber-100">
                  Ask Your Question for Sacred AI Tarot Reading
                </h1>
                <p className="text-[11px] text-slate-300 font-light mt-0.5">
                  Hold your intention firmly in mind before awakening the archetypes.
                </p>
              </div>

              {/* Question Textarea */}
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                  placeholder="e.g.: What guidance does the universe offer regarding my current crossroads?"
                  rows={2}
                  className="w-full bg-[#06040d]/90 border border-amber-500/30 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm leading-relaxed transition-all shadow-inner resize-none"
                />

                {/* Quick Inspiration Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {INSPIRATION_CHIPS.slice(0, 3).map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(chip)}
                      className="text-[9.5px] font-mono-sacred px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 text-slate-300 hover:text-amber-200 transition-all text-left truncate max-w-[200px]"
                    >
                      ✦ {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spread & Options Selection */}
              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="font-serif-sacred text-[11px] font-semibold text-amber-200 uppercase tracking-wider">
                    Select Spread
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-[9.5px] font-mono-sacred text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {showOptions ? "✕ Cancel Path A/B" : "+ Compare 2 Paths (Option A / B)"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {allSpreads.slice(0, 3).map((spread) => {
                    const isSelected = spreadId === spread.id;
                    return (
                      <button
                        key={spread.id}
                        type="button"
                        onClick={() => {
                          setSpreadId(spread.id);
                          if (spread.id === "decision_ab") setShowOptions(true);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 text-amber-100 ring-1 ring-amber-400"
                            : "bg-black/40 border-white/5 text-slate-400 hover:border-amber-500/40 hover:text-slate-200"
                        }`}
                      >
                        <div className="font-serif-sacred font-bold text-[11px] truncate">
                          {getSpreadDisplayName(spread, locale)}
                        </div>
                        <div className="font-mono-sacred text-[8.5px] text-amber-400/80 mt-0.5">
                          {spread.cardCount} Cards
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Option A & Option B Inputs */}
                {showOptions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                    <div>
                      <span className="text-[9px] font-mono-sacred text-amber-300 uppercase block mb-0.5">
                        OPTION A
                      </span>
                      <input
                        type="text"
                        value={optionA}
                        onChange={(e) => setOptions(e.target.value, optionB)}
                        placeholder="e.g.: Stay at current firm"
                        className="w-full bg-[#080512] border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono-sacred text-amber-300 uppercase block mb-0.5">
                        OPTION B
                      </span>
                      <input
                        type="text"
                        value={optionB}
                        onChange={(e) => setOptions(optionA, e.target.value)}
                        placeholder="e.g.: Launch independent studio"
                        className="w-full bg-[#080512] border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>

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

              {/* Tarot Reversals Orientation Toggle */}
              <div className="pt-1.5 border-t border-white/5">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/50 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-serif-sacred text-amber-200 flex items-center gap-1.5">
                      <span>✦</span>
                      <span>{locale === "hi" ? "उलटे कार्ड्स (Reversed Cards)" : "Allow Reversed Cards"}</span>
                    </span>
                    <span className="text-[9px] font-mono-sacred text-slate-400">
                      {allowReversals
                        ? (locale === "hi" ? "पारंपरिक 50/50 आंतरिक छाया अध्ययन" : "Traditional 50/50 RWS shadow & internal flow")
                        : (locale === "hi" ? "केवल सीधे कार्ड्स (100% Upright)" : "Upright only (100% face-up)")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAllowReversals(!allowReversals)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-amber-500/40 transition-colors duration-200 ease-in-out focus:outline-none ${
                      allowReversals ? "bg-amber-500" : "bg-neutral-800"
                    }`}
                    title={allowReversals ? "Click to disable reversed cards" : "Click to allow reversed cards"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black/90 shadow ring-0 transition duration-200 ease-in-out ${
                        allowReversals ? "translate-x-5 bg-amber-950" : "translate-x-0 bg-neutral-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Start Divination Button (Luxury Cream) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleStartDivination}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f4ebd0] via-[#fff7e6] to-[#f4ebd0] hover:brightness-105 text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-800 group-hover:rotate-12 transition-transform" />
                  <span>START DIVINATION</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-800 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: SHUFFLING VORTEX MEDITATION STAGE ─── */}
      {step === "shuffling" && (
        <>
          {/* Top Pinned Meditation Text (Zero collision with vortex) */}
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>ALIGNING ARCHETYPAL FREQUENCIES</span>
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100 drop-shadow">
              Shuffling... Please meditate on your question
            </h2>
            <p className="font-serif-sacred text-xs sm:text-sm text-amber-200/80 italic max-w-md mx-auto mt-1 line-clamp-1">
              "{question}"
            </p>
          </div>

          {/* Bottom Pinned Finish Shuffling Action */}
          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
            <button
              type="button"
              onClick={handleFinishShuffling}
              disabled={isCollapsingShuffle}
              className="px-9 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{isCollapsingShuffle ? "COALESCING DECK..." : "FINISH SHUFFLING"}</span>
              <ArrowRight className="w-4 h-4 text-amber-800" />
            </button>
          </div>
        </>
      )}

      {/* ─── STEP 2.5: SACRED DECK CUTTING RITUAL ─── */}
      {step === "cutting" && (
        <>
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>SACRED RITUAL · PERSONAL ENERGETIC IMPRINT</span>
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100 drop-shadow">
              Cut the Sacred Deck
            </h2>
            <p className="font-sans text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto mt-1">
              Tap the deck above to divide the cards and imprint your intention into the reading.
            </p>
          </div>

          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
            <button
              type="button"
              onClick={() => setStep("picking")}
              className="px-8 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-xs uppercase tracking-widest shadow-2xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Fan Out Cards</span>
              <ArrowRight className="w-4 h-4 text-amber-800" />
            </button>
          </div>
        </>
      )}

      {/* ─── STEP 3: 3D CELESTIAL STADIUM FIELD SELECTION ─── */}
      {step === "picking" && (
        <>
          {/* Top Pinned Instructions */}
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4">
            <h2 className="text-xl sm:text-2xl text-amber-100 font-semibold drop-shadow">
              Select {requiredPicks} {requiredPicks === 1 ? "card" : "cards"}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-medium">
              {picksRemaining > 0
                ? `${userPickIndices.length} of ${requiredPicks} selected`
                : "All cards selected"}
            </p>
          </div>

          {/* Bottom Pinned Reveal Spread Action Button */}
          {picksRemaining === 0 && (
            <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center pointer-events-auto px-4">
              <button
                type="button"
                disabled={isSubmittingDraw}
                onClick={handleConfirmDraw}
                className="px-10 py-3.5 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-[#0d091a] font-serif-sacred font-bold text-sm uppercase tracking-widest shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 animate-bounce"
              >
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>{isSubmittingDraw ? "CASTING SPREAD..." : "REVEAL SPREAD →"}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── STEP 4: SACRED ALTAR REVEAL STAGE (ZERO COLLISION WITH CARDS) ─── */}
      {step === "revealing" && (
        <>
          {/* Top Pinned Title (Far above the cards) */}
          <div className="fixed top-16 left-0 right-0 z-20 pointer-events-none text-center px-4">
            <span className="font-mono-sacred text-[11px] text-amber-400 tracking-widest uppercase block mb-1">
              ✦ SACRED SACRAMENT ✦
            </span>
            <h2 className="font-serif-sacred text-2xl sm:text-3xl text-amber-100 font-bold">
              Flip the cards to reveal their orientation
            </h2>
            <p className="text-xs font-mono-sacred text-slate-300 mt-1">
              Click each card to flip and commune with its divine arcana
            </p>
          </div>

          {/* Bottom Pinned Action Buttons */}
          <div className="fixed bottom-6 sm:bottom-7 left-0 right-0 z-30 flex justify-center items-center gap-3 pointer-events-auto px-4">
            <button
              type="button"
              onClick={revealAllCards}
              className="px-6 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/60 text-amber-200 text-xs font-mono-sacred hover:bg-amber-500/20 transition-all shadow-xl shadow-black/90"
            >
              Reveal All ({revealedIndices.length}/{drawnCards.length})
            </button>

            {revealedIndices.length === drawnCards.length && (
              <button
                type="button"
                onClick={() => setStep("streaming")}
                className="px-8 py-3 rounded-full bg-[#f4ebd0] hover:bg-[#fff7e6] text-neutral-950 font-serif-sacred font-bold text-xs uppercase tracking-wider transition-all shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Synthesize Oracle Reading</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
              </button>
            )}
          </div>
        </>
      )}

      {/* ─── STEP 5: WEAVING HUD WHILE SYNTHESIZING (Zero Card Collision!) ─── */}
      {step === "streaming" && !readingResponse && (
        <>
          {/* Top Pinned Glass Oracle Synthesis Badge (Far above the cards) */}
          <div className="fixed top-16 left-0 right-0 z-30 pointer-events-none text-center px-4 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/90 backdrop-blur-xl border border-amber-400/50 shadow-2xl shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="font-serif-sacred font-bold text-xs sm:text-sm text-amber-100">
                {locale === "hi"
                  ? "जेमिनी एआई गहन ब्रह्मांडीय शोध व विश्लेषण कर रहा है..."
                  : "Gemini AI is Conducting Deep Cosmic Research..."}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="font-mono-sacred text-[11px] text-amber-300/80 mt-2 drop-shadow">
              {locale === "hi"
                ? "प्राचीन प्रतीकों व 78 कार्ड्स की ऊर्जाओं का गहन संश्लेषण जारी है"
                : "CONSULTING CELESTIAL ARCHIVES · WEAVING 15-LINE COMPREHENSIVE GUIDANCE"}
            </p>
          </div>

          {/* Bottom Pinned Golden Shimmer Progress Bar (Far below the cards) */}
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

      {/* ─── STEP 6: COMPLETE READING VIEW (HERO CARDS ALTAR ON TOP + RESULTS NEATLY BELOW, ZERO OVERLAP!) ─── */}
      {isCompleteStage && (
        <div className="relative w-full min-h-screen pt-16 flex flex-col items-center">
          {/* Top Hero Section: 3D Cards Altar displayed prominently at the top */}
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
                ✦ Sacred Revealed Altar ✦
              </span>
            </div>
          </div>

          {/* Reading Results Section: Flows naturally below the hero cards altar */}
          <div className="w-full max-w-4xl mx-auto px-4 pb-24 relative z-20 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                  el.focus();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            />

            <div className="mt-8">
              <FollowupChat locale={locale} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
