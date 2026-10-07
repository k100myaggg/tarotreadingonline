"use client";

import React, { useState } from "react";
import { StructuredReadingResponse, Locale } from "@/types/tarot";
import { getCardImagePath } from "@/lib/tarot/cardImages";
import { useReadingStore } from "@/stores/useReadingStore";
import { ReadingPosterModal } from "./ReadingPosterModal";
import { Sparkles, ArrowRight, Compass, ShieldAlert, Heart, CheckCircle2, Share2, Image as ImageIcon } from "lucide-react";

interface ReadingStreamViewerProps {
  reading: StructuredReadingResponse | null;
  rawStreamText: string;
  isStreaming: boolean;
  crisisData?: any;
  locale: Locale;
  onSelectFollowup?: (question: string) => void;
}

export function ReadingStreamViewer({
  reading,
  rawStreamText,
  isStreaming,
  crisisData,
  locale,
  onSelectFollowup,
}: ReadingStreamViewerProps) {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const { drawnCards, question } = useReadingStore();
  // If crisis detected, show supportive redirect
  if (crisisData) {
    const msg = crisisData.message?.[locale] || crisisData.message?.en;
    return (
      <div className="w-full max-w-4xl mx-auto mystic-panel p-8 rounded-2xl border border-rose-500/50 shadow-2xl my-8">
        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <Heart className="w-7 h-7 animate-pulse" />
          <h3 className="font-serif-sacred text-2xl font-bold text-rose-200">
            You Are Not Alone
          </h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-6 font-light">
          {msg}
        </p>
        <div className="p-4 rounded-xl bg-black/50 border border-rose-900/40 space-y-2">
          <h4 className="font-mono-sacred text-xs text-rose-300 uppercase tracking-wider">
            Confidential 24/7 Helplines:
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 font-mono-sacred">
            {crisisData.helplines?.map((hl: any, i: number) => (
              <li key={i} className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">{hl.region}:</span>
                <span className="text-amber-300 font-semibold">{hl.contact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 my-8">
      {/* Streaming Status Banner */}
      <div className="mystic-panel rounded-2xl p-6 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
            🔮
          </div>
          <div>
            <h3 className="font-serif-sacred text-lg font-bold text-amber-200">
              {reading?.readerPersona || "The Oracle Voice"}
            </h3>
            <p className="font-mono-sacred text-[11px] text-amber-400/70">
              {isStreaming ? "TRANSCRIBING SACRED CURRENTS..." : "SYNTHESIS MANIFESTED"}
            </p>
          </div>
        </div>

        {isStreaming ? (
          <div className="flex items-center gap-2 text-xs font-mono-sacred text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Streaming</span>
          </div>
        ) : reading ? (
          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-400/30 border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif-sacred font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Share Poster</span>
          </button>
        ) : null}
      </div>

      {/* Reader Intro */}
      {reading?.intro && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 italic font-serif-sacred text-base sm:text-lg text-amber-100/90 leading-relaxed shadow-lg">
          "{reading.intro}"
        </div>
      )}

      {/* Structured Card Syntheses */}
      {reading?.cards && reading.cards.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-mono-sacred text-xs text-amber-300/80 tracking-widest uppercase">
            ✦ Individual Card Illuminations ✦
          </h4>

          <div className="grid grid-cols-1 gap-6">
            {reading.cards.map((c, i) => (
              <div
                key={i}
                className="mystic-panel rounded-xl p-5 sm:p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-md flex flex-col sm:flex-row gap-5 items-start"
              >
                {c.cardId && (
                  <div className="relative w-24 sm:w-28 aspect-[1/1.65] rounded-lg overflow-hidden border border-amber-400/60 shadow-lg shadow-amber-500/20 shrink-0 bg-[#0e0a1f] self-center sm:self-start">
                    <img
                      src={getCardImagePath(c.cardId)}
                      alt={c.cardName}
                      className={`w-full h-full object-cover transition-transform ${
                        c.orientation === "reversed" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        {c.positionName}
                      </span>
                      <h5 className="font-serif-sacred font-bold text-lg text-amber-100">
                        {c.cardName}
                      </h5>
                    </div>
                    <span
                      className={`font-mono-sacred text-xs px-2 py-0.5 rounded uppercase ${
                        c.orientation === "reversed"
                          ? "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                          : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {c.orientation === "reversed" ? "Reversed ↺" : "Upright ↑"}
                    </span>
                  </div>

                  <p className="text-xs font-mono-sacred text-amber-300/90 mb-3 italic">
                    Essence: {c.coreEssence}
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {c.contextualMeaning}
                  </p>

                  {c.advice && (
                    <div className="pt-3 border-t border-white/5 text-xs text-slate-400 font-serif-sacred flex items-start gap-2">
                      <span className="text-amber-400">✦ Contemplation:</span>
                      <span>{c.advice}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spread Synthesis */}
      {reading?.spreadSynthesis && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-3">
          <h4 className="font-serif-sacred text-xl font-bold text-amber-200 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Holistic Spread Synthesis
          </h4>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-line">
            {reading.spreadSynthesis}
          </p>
        </div>
      )}

      {/* Practical Action Anchor */}
      {reading?.actionableStep && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-purple-950/50 border border-amber-400/40 shadow-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-serif-sacred font-bold text-base text-amber-100 mb-1">
              Practical Action Anchor
            </h5>
            <p className="text-sm text-slate-300 leading-relaxed">
              {reading.actionableStep}
            </p>
          </div>
        </div>
      )}

      {/* Social Poster Generator Banner */}
      {reading && !isStreaming && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-7 border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-serif-sacred font-bold text-base text-amber-100 flex items-center gap-2">
                <span>Save & Share Your Sacred Reading</span>
                <span className="text-[10px] font-mono-sacred px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold uppercase">
                  Story Ready
                </span>
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Generate an elegant Instagram Story or WhatsApp status poster with your cards and oracle insight.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-serif-sacred font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Create Story Poster</span>
          </button>
        </div>
      )}

      {/* 3 Clickable Follow-up Questions */}
      {reading?.followUpSuggestions && reading.followUpSuggestions.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-mono-sacred text-xs text-amber-300/80 uppercase tracking-wider">
            ✦ Continue Your Dialogue with the Reader ✦
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reading.followUpSuggestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectFollowup && onSelectFollowup(q)}
                className="text-left p-3.5 rounded-xl mystic-panel border border-amber-900/40 hover:border-amber-400/60 hover:bg-white/5 transition-all text-xs text-slate-300 hover:text-amber-200 flex flex-col justify-between group"
              >
                <span className="leading-snug">{q}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-sacred text-amber-400 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>Ask this</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shimmering Sacred Weaving State while reading is being synthesized */}
      {!reading && (
        <div className="mystic-panel rounded-2xl p-8 border border-amber-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/10 to-amber-500/5 animate-pulse pointer-events-none" />
          
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/40 text-2xl shadow-lg shadow-amber-500/20">
            <span className="animate-spin text-amber-300">✦</span>
          </div>

          <div className="space-y-1.5 relative">
            <h4 className="font-serif-sacred text-xl font-bold text-amber-100">
              {locale === "hi" ? "ओरेकल आपके कार्ड्स का विश्लेषण कर रहा है..." : "The Oracle is Weaving Your Reading..."}
            </h4>
            <p className="font-mono-sacred text-xs text-amber-300/80 tracking-wider">
              {locale === "hi" 
                ? "प्राचीन प्रतीकों और आपकी ऊर्जा का संश्लेषण जारी है" 
                : "COMMUNING WITH ARCHETYPAL FORCES · SYNTHESIZING WISDOM"}
            </p>
          </div>

          <div className="w-48 h-1 mx-auto bg-neutral-900 rounded-full overflow-hidden border border-amber-500/20">
            <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-[shimmer_1.5s_infinite]" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* Poster Generation Modal */}
      {reading && (
        <ReadingPosterModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          reading={reading}
          drawnCards={drawnCards}
          question={question}
          locale={locale}
        />
      )}
    </div>
  );
}
