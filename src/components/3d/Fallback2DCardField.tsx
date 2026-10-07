"use client";

import React from "react";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardById, getCardDisplayName, getSpreadById } from "@/lib/tarot/data";
import { getCardImagePath, CARD_BACK_IMAGE_PATH } from "@/lib/tarot/cardImages";
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
                  className={`relative w-44 sm:w-48 aspect-[1/1.65] rounded-xl overflow-hidden border-2 transition-all duration-500 shadow-xl ${
                    isRevealed
                      ? "border-amber-400/90 shadow-amber-500/25"
                      : "border-amber-700/60 group-hover:border-amber-400 group-hover:scale-105"
                  }`}
                >
                  {isRevealed && cardInfo ? (
                    <div className="relative w-full h-full bg-[#120e24]">
                      <img
                        src={getCardImagePath(cardInfo.id)}
                        alt={getCardDisplayName(cardInfo, locale)}
                        className={`w-full h-full object-cover ${
                          drawnCard.isReversed ? "rotate-180" : ""
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-amber-400/50 text-[9px] font-mono-sacred text-amber-300 uppercase">
                        {drawnCard.isReversed ? "Rev ↺" : "Up ↑"}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <h4 className="font-serif-sacred font-bold text-amber-200 text-xs sm:text-sm drop-shadow">
                          {getCardDisplayName(cardInfo, locale)}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-[#0d091e] flex flex-col items-center justify-center">
                      <img
                        src={CARD_BACK_IMAGE_PATH}
                        alt="Card Back"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-3 text-center">
                        <Sparkles className="w-5 h-5 text-amber-300 mb-1.5 animate-pulse" />
                        <span className="text-[11px] font-mono-sacred text-amber-200 font-semibold tracking-wider">
                          CLICK TO REVEAL
                        </span>
                      </div>
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
