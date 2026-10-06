"use client";

import React, { useState, use } from "react";
import dynamic from "next/dynamic";
import { useReadingStore } from "@/stores/useReadingStore";
import {
  allSpreads,
  allPersonas,
  getSpreadById,
  getPersonaById,
  getSpreadDisplayName,
  getPersonaDisplayName,
} from "@/lib/tarot/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/types/tarot";
import { Fallback2DCardField } from "@/components/3d/Fallback2DCardField";
import { ReadingStreamViewer } from "@/components/ui/ReadingStreamViewer";
import { FollowupChat } from "@/components/ui/FollowupChat";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  HelpCircle,
} from "lucide-react";

// Dynamically import 3D Canvas with SSR disabled
const TarotCanvas = dynamic(
  () => import("@/components/3d/TarotCanvas").then((mod) => mod.TarotCanvas),
  { ssr: false }
);

interface ReadingPageProps {
  params: Promise<{ locale: string }>;
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
    setStep,
    setQuestion,
    setOptions,
    setSpreadId,
    setPersonaId,
    setDrawnCards,
    revealAllCards,
    toggleAudio,
    resetReading,
  } = useReadingStore();

  const [use2DFallback, setUse2DFallback] = useState(false);
  const [showOptions, setShowOptions] = useState(Boolean(optionA || optionB));
  const [isSubmittingDraw, setIsSubmittingDraw] = useState(false);
  const [crisisData, setCrisisData] = useState<any>(null);

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
  React.useEffect(() => {
    if (step !== "streaming" || isStreaming || readingResponse) return;

    let isMounted = true;
    setStreaming(true);
    setStreamedText("");

    async function streamReading() {
      try {
        const response = await fetch("/api/reading/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));
                if (eventData.type === "delta") {
                  accumulated += eventData.text;
                  if (isMounted) setStreamedText(accumulated);
                } else if (eventData.type === "complete") {
                  if (eventData.parsed) {
                    if (isMounted) {
                      setReadingResponse(eventData.parsed);
                      setStep("complete");
                    }
                  }
                }
              } catch {
                // Ignore SSE framing json parse partials
              }
            }
          }
        }

        // Final attempt to parse complete accumulated JSON if complete event was missed
        if (accumulated && !readingResponse) {
          try {
            const parsed = JSON.parse(accumulated);
            if (isMounted) {
              setReadingResponse(parsed);
              setStep("complete");
            }
          } catch {
            // Raw text fallback
          }
        }
      } catch (err: any) {
        console.error("Stream reader error:", err);
      } finally {
        if (isMounted) setStreaming(false);
      }
    }

    streamReading();

    return () => {
      isMounted = false;
    };
  }, [step, isStreaming, readingResponse]);

  // Handle starting shuffle flow
  const handleStartShuffle = () => {
    setStep("shuffling");
  };

  // When 3D shuffle finishes, go to picking
  const handleShuffleFinished = () => {
    setStep("picking");
  };

  // Submit picks and execute cryptographic draw
  const handleConfirmDraw = async () => {
    if (userPickIndices.length !== requiredPicks) return;

    try {
      setIsSubmittingDraw(true);
      const res = await fetch("/api/reading/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadId,
          question,
          optionA,
          optionB,
          personaId,
          userPickIndices,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to draw cards");
      }

      setDrawnCards(data.cards, data.readingId);
    } catch (err: any) {
      alert(err.message || "An error occurred while drawing cards");
    } finally {
      setIsSubmittingDraw(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
      {/* Top Controls & Status Bar */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-amber-900/30 text-xs font-mono-sacred text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-200 uppercase">
            Stage: {step.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUse2DFallback(!use2DFallback)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-black/40 border border-amber-900/40 text-slate-300 hover:text-amber-300 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{use2DFallback ? "Switch to 3D" : "2D Accessible Mode"}</span>
          </button>

          <button
            type="button"
            onClick={toggleAudio}
            className="p-1.5 rounded bg-black/40 border border-amber-900/40 text-slate-300 hover:text-amber-300 transition-colors"
            title={isAudioMuted ? "Unmute Ambiance" : "Mute Ambiance"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {step !== "question" && (
            <button
              type="button"
              onClick={resetReading}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Question Form & Spread/Persona Selection */}
      {step === "question" && (
        <div className="w-full max-w-3xl mystic-panel rounded-2xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <span className="font-mono-sacred text-xs text-amber-400/90 tracking-widest">
              STEP 1 • SACRED INTENTION
            </span>
            <h1 className="font-serif-sacred text-2xl sm:text-4xl font-bold text-amber-100 mt-1">
              Frame Your Inquiry
            </h1>
          </div>

          <div className="space-y-6">
            {/* Question Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-serif-sacred text-sm font-semibold text-amber-200">
                  {dict.readingForm.questionLabel}
                </label>
                <span className="text-xs font-mono-sacred text-slate-400">
                  {question.length}/200
                </span>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={200}
                placeholder={dict.readingForm.questionPlaceholder}
                rows={3}
                className="w-full bg-[#0a0815] border border-amber-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 text-sm leading-relaxed"
              />
              <p className="text-[11px] font-mono-sacred text-slate-400 mt-1.5">
                ✦ {dict.readingForm.questionHint}
              </p>
            </div>

            {/* Option A / Option B Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="text-xs font-mono-sacred text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <span>{showOptions ? "- Hide Choice Comparison" : "+ Comparing Two Specific Paths? (Option A / Option B)"}</span>
              </button>

              {showOptions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 rounded-xl bg-black/30 border border-amber-900/30">
                  <div>
                    <label className="text-xs font-serif-sacred text-amber-300 block mb-1">
                      {dict.readingForm.optionALabel}
                    </label>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptions(e.target.value, optionB)}
                      placeholder={dict.readingForm.optionAPlaceholder}
                      className="w-full bg-[#090712] border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-serif-sacred text-amber-300 block mb-1">
                      {dict.readingForm.optionBLabel}
                    </label>
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptions(optionA, e.target.value)}
                      placeholder={dict.readingForm.optionBPlaceholder}
                      className="w-full bg-[#090712] border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Spread Selector */}
            <div>
              <label className="font-serif-sacred text-sm font-semibold text-amber-200 block mb-2">
                {dict.readingForm.chooseSpread}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allSpreads.map((spread) => {
                  const isSelected = spreadId === spread.id;
                  return (
                    <div
                      key={spread.id}
                      onClick={() => setSpreadId(spread.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10"
                          : "bg-[#0c0919] border-amber-900/30 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif-sacred font-bold text-amber-100 text-sm">
                          {getSpreadDisplayName(spread, locale)}
                        </span>
                        <span className="font-mono-sacred text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20">
                          {spread.cardCount} CARDS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {spread.description[locale as "en" | "hi" | "ja"] || spread.description.en}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Persona Selector */}
            <div>
              <label className="font-serif-sacred text-sm font-semibold text-amber-200 block mb-2">
                {dict.readingForm.choosePersona}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allPersonas.map((persona) => {
                  const isSelected = personaId === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setPersonaId(persona.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10"
                          : "bg-[#0c0919] border-amber-900/30 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="text-2xl mb-1">{persona.avatar}</div>
                      <div className="font-serif-sacred font-bold text-amber-100 text-sm">
                        {getPersonaDisplayName(persona, locale)}
                      </div>
                      <p className="text-[10px] font-mono-sacred text-amber-400/70 mb-1">
                        {persona.title[locale as "en" | "hi" | "ja"] || persona.title.en}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {persona.description[locale as "en" | "hi" | "ja"] || persona.description.en}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={handleStartShuffle}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-neutral-950" />
                <span>{dict.readingForm.shufflePrompt}</span>
                <ArrowRight className="w-5 h-5 text-neutral-950" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps 2..5: 3D Viewport or 2D Accessible Mode */}
      {step !== "question" && (
        <div className="w-full flex flex-col items-center">
          {/* Active Guidance Header */}
          <div className="text-center mb-6 max-w-xl">
            {step === "shuffling" && (
              <div className="space-y-1">
                <span className="font-mono-sacred text-xs text-amber-400">
                  ✦ ALIGNING THE ARCHETYPAL FREQUENCIES ✦
                </span>
                <h2 className="font-serif-sacred text-2xl text-amber-100 font-bold">
                  {dict.reader.shufflingDeck}
                </h2>
              </div>
            )}

            {step === "picking" && (
              <div className="space-y-2">
                <span className="font-mono-sacred text-xs text-amber-400">
                  ✦ INTUITIVE SELECTION ✦
                </span>
                <h2 className="font-serif-sacred text-2xl text-amber-100 font-bold">
                  {dict.reader.fieldInstruction
                    .replace("{required}", String(requiredPicks))
                    .replace("{selected}", String(userPickIndices.length))}
                </h2>
                {picksRemaining > 0 ? (
                  <p className="text-xs text-slate-400 font-mono-sacred">
                    Hover and click {picksRemaining} more card{picksRemaining > 1 ? "s" : ""} from the floating ribbon.
                  </p>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSubmittingDraw}
                      onClick={handleConfirmDraw}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-base shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isSubmittingDraw ? "Invoking Spread..." : "Cast Spread & Draw Cards"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === "revealing" && (
              <div className="space-y-2">
                <span className="font-mono-sacred text-xs text-amber-400">
                  ✦ SACRED GEOMETRY ✦
                </span>
                <h2 className="font-serif-sacred text-2xl text-amber-100 font-bold">
                  Flip the cards to reveal their orientation
                </h2>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={revealAllCards}
                    className="px-6 py-2.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-mono-sacred hover:bg-amber-500/30 transition-colors"
                  >
                    Reveal All ({revealedIndices.length}/{drawnCards.length})
                  </button>
                  {revealedIndices.length === drawnCards.length && (
                    <button
                      type="button"
                      onClick={() => setStep("streaming")}
                      className="px-6 py-2.5 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs font-mono-sacred hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
                    >
                      Hear Reader Synthesis →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Canvas or 2D Fallback */}
          <div className="w-full max-w-5xl">
            {use2DFallback ? (
              <Fallback2DCardField locale={locale} />
            ) : (
              <TarotCanvas locale={locale} onShuffleFinished={handleShuffleFinished} />
            )}
          </div>

          {/* Streamed Reader Interpretation */}
          {(step === "streaming" || step === "complete") && (
            <ReadingStreamViewer
              reading={readingResponse}
              rawStreamText={streamedText}
              isStreaming={isStreaming}
              crisisData={crisisData}
              locale={locale}
              onSelectFollowup={(q) => {
                const chatInput = document.getElementById("followup-input") as HTMLInputElement;
                if (chatInput) {
                  chatInput.value = q;
                  chatInput.focus();
                }
              }}
            />
          )}

          {/* Interactive Follow-up Chat & Extra Guidance Card */}
          {step === "complete" && !crisisData && (
            <FollowupChat locale={locale} />
          )}
        </div>
      )}
    </div>
  );
}
