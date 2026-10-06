import React from "react";
import Link from "next/link";
import { allSpreads, getSpreadDisplayName } from "@/lib/tarot/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/types/tarot";
import { Layers, ArrowRight, Sparkles } from "lucide-react";

interface SpreadsIndexProps {
  params: Promise<{ locale: string }>;
}

export default async function SpreadsIndexPage({ params }: SpreadsIndexProps) {
  const { locale } = await params;
  const activeLocale = (locale as Locale) || "en";
  const dict = getDictionary(activeLocale);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>SACRED SPREAD ARCHITECTURE</span>
        </div>
        <h1 className="font-serif-sacred text-3xl sm:text-5xl font-bold text-amber-100">
          Tarot Spreads & Geometries
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          Each spread functions as an energetic matrix. Learn the position roles and purpose of each classical tarot layout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {allSpreads.map((spread) => {
          const spreadName = getSpreadDisplayName(spread, activeLocale);
          return (
            <div
              key={spread.id}
              className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {spread.cardCount} CARDS
                  </span>
                  <span className="font-mono-sacred text-xs text-slate-400">
                    Cost: {spread.creditCost === 0 ? "FREE" : `${spread.creditCost} Credits`}
                  </span>
                </div>

                <h3 className="font-serif-sacred text-2xl font-bold text-amber-100 mb-2">
                  {spreadName}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  {spread.description[activeLocale] || spread.description.en}
                </p>

                {/* Position Previews */}
                <div className="space-y-2 mb-6">
                  <span className="font-mono-sacred text-[11px] text-amber-400/80 uppercase">
                    Key Positions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono-sacred">
                    {spread.positions.slice(0, 4).map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-300">
                        {p.name[activeLocale] || p.name.en}
                      </span>
                    ))}
                    {spread.positions.length > 4 && (
                      <span className="px-2 py-0.5 text-slate-500">
                        +{spread.positions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Link
                  href={`/${activeLocale}/spreads/${spread.id}`}
                  className="text-xs font-mono-sacred text-slate-400 hover:text-amber-200 transition-colors"
                >
                  View Layout Guide →
                </Link>

                <Link
                  href={`/${activeLocale}/reading?spread=${spread.id}`}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold font-serif-sacred text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>Select Spread</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
