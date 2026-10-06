"use client";

import React from "react";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardById, getCardDisplayName, getSpreadById } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface Fallback2DCardFieldProps {
  locale: Locale;
}

export function Fallback2DCardField({ locale }: Fallback2DCardFieldProps) {
  const {
    step,
    spreadId,
    userPickIndices,
    togglePickIndex,
    drawnCards,
    revealedIndices,
    revealCard,
  } = useReadingStore();

  const currentSpread = getSpreadById(spreadId);
  const requiredCount = currentSpread?.cardCount || 3;

  if (step === "picking") {
    return (
      <div className="w-full mystic-panel p-6 rounded-2xl border border-amber-500/30">
        <div className="text-center mb-6">
          <p className="font-mono-sacred text-amber-300 text-sm">
            ✦ Accessible 2D Card Sanctuary ✦
          </p>
          <h3 className="font-serif-sacred text-xl text-amber-100 mt-1">
            Select {requiredCount} cards ({userPickIndices.length} chosen)
          </h3>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5 max-h-[460px] overflow-y-auto p-2">
          {Array.from({ length: 78 }).map((_, i) => {
            const isSelected = userPickIndices.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => togglePickIndex(i)}
                className={`relative aspect-[1/1.7] rounded-lg border text-xs font-mono-sacred flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 scale-105 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400"
                    : "bg-[#120e24] border-amber-900/40 text-slate-400 hover:border-amber-500/50 hover:bg-[#1a1435]"
                }`}
                aria-label={`Card slot ${i + 1}`}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 opacity-40 mb-1" />
                )}
                <span className="text-[10px] opacity-75">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === "revealing" || step === "streaming" || step === "complete") {
    return (
      <div className="w-full mystic-panel p-6 rounded-2xl border border-amber-500/30">
        <h3 className="font-serif-sacred text-center text-xl text-amber-100 mb-6">
          Spread Cards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {drawnCards.map((drawnCard, idx) => {
            const cardInfo = getCardById(drawnCard.cardId);
            const isRevealed = revealedIndices.includes(idx);
            const posName = currentSpread?.positions[idx]?.name[locale] || `Position ${idx + 1}`;

            return (
              <div
                key={drawnCard.cardId + "_" + idx}
                onClick={() => revealCard(idx)}
                className="cursor-pointer group flex flex-col items-center"
              >
                <div className="font-mono-sacred text-xs text-amber-300/80 mb-2">
                  {posName}
                </div>

                <div
                  className={`w-40 aspect-[1/1.7] rounded-xl border p-3 flex flex-col justify-between items-center text-center transition-all duration-500 shadow-xl ${
                    isRevealed
                      ? "bg-gradient-to-b from-[#1b1535] to-[#0d091e] border-amber-400/80 shadow-amber-500/20"
                      : "bg-[#0f0c1e] border-amber-900/50 group-hover:border-amber-400/50"
                  }`}
                >
                  {isRevealed && cardInfo ? (
                    <>
                      <span className="text-[10px] font-mono-sacred text-amber-400/70 uppercase">
                        {drawnCard.isReversed ? "Reversed ↺" : "Upright ↑"}
                      </span>
                      <div className="my-auto">
                        <h4 className="font-serif-sacred font-bold text-amber-200 text-sm">
                          {getCardDisplayName(cardInfo, locale)}
                        </h4>
                        <p className="text-[11px] text-purple-300 mt-1 font-mono-sacred">
                          {drawnCard.isReversed
                            ? cardInfo.keywords.reversed.slice(0, 2).join(", ")
                            : cardInfo.keywords.upright.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      <span className="text-xl">🔮</span>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-400/60 mb-2 animate-spin" />
                      <span className="text-xs font-mono-sacred text-amber-300">Click to Flip</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
