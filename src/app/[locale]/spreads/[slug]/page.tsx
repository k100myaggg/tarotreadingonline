import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { allSpreads, getSpreadById, getSpreadDisplayName } from "@/lib/tarot/data";
import { Locale } from "@/types/tarot";
import { Layers, ArrowLeft, ArrowRight, Sparkles, Compass } from "lucide-react";

interface SpreadDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ["en", "hi", "ja"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const spread of allSpreads) {
      params.push({ locale, slug: spread.id });
    }
  }

  return params;
}

export async function generateMetadata({ params }: SpreadDetailPageProps) {
  const { locale, slug } = await params;
  const activeLocale = (locale as Locale) || "en";
  const spread = getSpreadById(slug);

  if (!spread) return { title: "Spread Not Found" };

  const spreadName = getSpreadDisplayName(spread, activeLocale);

  return {
    title: `${spreadName} Tarot Spread Guide | Positions & Layout | Arcana 3D`,
    description: `Complete layout and position guide for the ${spreadName} (${spread.cardCount} cards). Learn how to interpret each position and cast a live 3D reading.`,
  };
}

export default async function SpreadDetailPage({ params }: SpreadDetailPageProps) {
  const { locale, slug } = await params;
  const activeLocale = (locale as Locale) || "en";
  const spread = getSpreadById(slug);

  if (!spread) {
    notFound();
  }

  const spreadName = getSpreadDisplayName(spread, activeLocale);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono-sacred text-slate-400">
        <Link href={`/${activeLocale}/spreads`} className="hover:text-amber-300 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Spreads Guide</span>
        </Link>
        <span>/</span>
        <span className="text-amber-200 uppercase">{spreadName}</span>
      </div>

      {/* Hero Header */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {spread.cardCount} CARD LAYOUT
          </span>
          <span className="font-mono-sacred text-xs text-slate-400">
            Cost: {spread.creditCost === 0 ? "FREE" : `${spread.creditCost} Credits`}
          </span>
        </div>

        <h1 className="font-serif-sacred text-3xl sm:text-4xl font-bold text-amber-100">
          {spreadName}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          {spread.description[activeLocale] || spread.description.en}
        </p>

        <div className="pt-4">
          <Link
            href={`/${activeLocale}/reading?spread=${spread.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cast a Live 3D Reading with this Spread</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Spread Positions Architecture */}
      <div className="space-y-4">
        <h3 className="font-serif-sacred text-2xl font-bold text-amber-200 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Card Positions & Energetic Roles
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {spread.positions.map((pos) => {
            const pName = pos.name[activeLocale] || pos.name.en;
            const pHint = pos.hint[activeLocale] || pos.hint.en;

            return (
              <div
                key={pos.index}
                className="mystic-panel rounded-xl p-5 border border-amber-900/40 hover:border-amber-400/40 transition-all flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-sacred font-bold text-sm flex items-center justify-center shrink-0">
                  {pos.index + 1}
                </div>
                <div>
                  <h4 className="font-serif-sacred font-bold text-base text-amber-100">
                    {pName}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mt-1">
                    {pHint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
