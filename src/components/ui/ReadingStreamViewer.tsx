"use client";

import React from "react";
import { StructuredReadingResponse, Locale } from "@/types/tarot";
import { Sparkles, ArrowRight, Compass, ShieldAlert, Heart, CheckCircle2 } from "lucide-react";

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

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs font-mono-sacred text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Streaming</span>
          </div>
        )}
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
                className="mystic-panel rounded-xl p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-md"
              >
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

      {/* Fallback raw stream display if JSON is still assembling */}
      {!reading && rawStreamText && (
        <div className="mystic-panel rounded-2xl p-6 border border-amber-500/20 font-mono text-xs text-amber-200/80 whitespace-pre-wrap leading-relaxed animate-pulse">
          {rawStreamText}
        </div>
      )}
    </div>
  );
}
