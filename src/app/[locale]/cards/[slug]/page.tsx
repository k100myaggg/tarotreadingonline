import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { allCards, getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { getCardImagePath, hasCustomAiArtwork } from "@/lib/tarot/cardImages";
import { Locale } from "@/types/tarot";
import { Sparkles, ArrowLeft, ArrowRight, Shield, Compass, BookOpen } from "lucide-react";

interface CardPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ["en", "hi", "ja"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const card of allCards) {
      params.push({ locale, slug: card.id });
    }
  }

  return params;
}

export async function generateMetadata({ params }: CardPageProps) {
  const { locale, slug } = await params;
  const activeLocale = (locale as Locale) || "en";
  const card = getCardById(slug);

  if (!card) return { title: "Card Not Found" };

  const cardName = getCardDisplayName(card, activeLocale);

  return {
    title: `${cardName} Tarot Card Meaning (Upright & Reversed) | Arcana 3D`,
    description: `Comprehensive guide to ${cardName} in the Rider-Waite-Smith tarot deck. Learn upright and reversed interpretations, elemental associations, keywords, and symbolism.`,
    alternates: {
      canonical: `/${activeLocale}/cards/${slug}`,
      languages: {
        en: `/en/cards/${slug}`,
        hi: `/hi/cards/${slug}`,
        ja: `/ja/cards/${slug}`,
      },
    },
  };
}

export default async function CardDetailPage({ params }: CardPageProps) {
  const { locale, slug } = await params;
  const activeLocale = (locale as Locale) || "en";
  const card = getCardById(slug);

  if (!card) {
    notFound();
  }

  const cardName = getCardDisplayName(card, activeLocale);

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: `${cardName} Tarot Card Meaning`,
    description: card.meanings.upright,
    keywords: [...card.keywords.upright, ...card.keywords.reversed].join(", "),
    author: {
      "@type": "Organization",
      name: "Arcana 3D Sanctuary",
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono-sacred text-slate-400">
        <Link href={`/${activeLocale}/cards`} className="hover:text-amber-300 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>78 Cards Archive</span>
        </Link>
        <span>/</span>
        <span className="text-amber-200 uppercase">{cardName}</span>
      </div>

      {/* Main Card Hero Header */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center gap-8">
        {/* Card Artwork Hologram */}
        <div className="relative w-56 sm:w-64 aspect-[1/1.7] rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-500/25 shrink-0 bg-[#100b24] group">
          <img
            src={getCardImagePath(card.id)}
            alt={cardName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-[10px] font-mono-sacred text-amber-300">
            {hasCustomAiArtwork(card.id) ? "✦ BESPOKE SACRED ART" : "✦ RWS 1909 CANON"}
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
            <span className="text-[11px] font-mono-sacred text-amber-200/90 uppercase tracking-widest">
              {card.arcana === "major" ? `MAJOR ARCANA #${card.number}` : `${card.suit?.toUpperCase()} #${card.number}`}
            </span>
          </div>
        </div>

        {/* Core Attributes */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs font-mono-sacred">
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
              Element: {card.element}
            </span>
            {card.suit && (
              <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                Suit: {card.suit}
              </span>
            )}
            <span className="px-2.5 py-1 rounded bg-black/40 text-slate-300 border border-white/5">
              Ruler: {card.association}
            </span>
          </div>

          <h1 className="font-serif-sacred text-3xl sm:text-4xl font-bold text-amber-100">
            {cardName}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            {card.meanings.upright}
          </p>

          <div className="pt-2">
            <Link
              href={`/${activeLocale}/reading`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Consult the 3D Deck with this Energy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upright vs Reversed Interpretations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upright Meaning */}
        <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif-sacred text-xl font-bold text-amber-200">
              Upright Orientation
            </span>
            <span className="text-xs font-mono-sacred px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              UPRIGHT ↑
            </span>
          </div>

          <div>
            <span className="text-xs font-mono-sacred text-amber-400 block mb-1">
              KEYWORDS
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono-sacred text-slate-300">
              {card.keywords.upright.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-light">
            {card.meanings.upright}
          </p>
        </div>

        {/* Reversed Meaning */}
        <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif-sacred text-xl font-bold text-purple-200">
              Reversed Orientation
            </span>
            <span className="text-xs font-mono-sacred px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              REVERSED ↺
            </span>
          </div>

          <div>
            <span className="text-xs font-mono-sacred text-purple-400 block mb-1">
              KEYWORDS
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono-sacred text-slate-300">
              {card.keywords.reversed.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-light">
            {card.meanings.reversed}
          </p>
        </div>
      </div>

      {/* Symbolism Breakdown */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
        <h3 className="font-serif-sacred text-xl font-bold text-amber-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Canonical Symbolism in RWS Art
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
          {card.symbolism.map((sym, i) => (
            <li key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5">
              <span className="text-amber-400">✦</span>
              <span>{sym}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
