"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { allCards, getCardDisplayName } from "@/lib/tarot/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale, TarotCard } from "@/types/tarot";
import { Search, Sparkles, BookOpen, Filter } from "lucide-react";

interface CardsIndexProps {
  params: Promise<{ locale: string }>;
}

export default function CardsIndexPage({ params }: CardsIndexProps) {
  const resolvedParams = use(params);
  const locale = (resolvedParams.locale || "en") as Locale;
  const dict = getDictionary(locale);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "major" | "wands" | "cups" | "swords" | "pentacles">("all");

  const filteredCards = allCards.filter((card) => {
    // Suit/Arcana filter
    if (filter === "major" && card.arcana !== "major") return false;
    if (filter !== "all" && filter !== "major" && card.suit !== filter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = getCardDisplayName(card, locale).toLowerCase();
      const kw = [...card.keywords.upright, ...card.keywords.reversed].join(" ").toLowerCase();
      return name.includes(q) || kw.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>CANONICAL 1909 RIDER-WAITE-SMITH DECK ARCHIVE</span>
        </div>
        <h1 className="font-serif-sacred text-3xl sm:text-5xl font-bold text-amber-100">
          The 78 Sacred Archetypes
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          Explore canonical meanings, symbolism, upright and reversed interpretations for all 22 Major Arcana and 56 Minor Arcana cards.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mystic-panel rounded-2xl p-5 border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or keyword..."
            className="w-full bg-[#0a0815] border border-amber-500/20 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Suit & Arcana Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-sacred">
          {[
            { id: "all", label: "All (78)" },
            { id: "major", label: "Major (22)" },
            { id: "wands", label: "Wands (14)" },
            { id: "cups", label: "Cups (14)" },
            { id: "swords", label: "Swords (14)" },
            { id: "pentacles", label: "Pentacles (14)" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filter === item.id
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                  : "bg-black/30 border-white/5 text-slate-400 hover:text-amber-200 hover:border-amber-900/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCards.map((card) => {
          const cardName = getCardDisplayName(card, locale);
          return (
            <Link
              key={card.id}
              href={`/${locale}/cards/${card.id}`}
              className="mystic-panel rounded-xl p-3.5 border border-amber-900/30 hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group shadow-md"
            >
              {/* Card Thumbnail Graphic */}
              <div className="aspect-[1/1.6] rounded-lg bg-[#0e0a1f] border border-amber-500/20 p-2 flex flex-col items-center justify-between text-center mb-2.5 group-hover:border-amber-400/60 transition-colors">
                <span className="text-[10px] font-mono-sacred text-amber-400/70 uppercase">
                  {card.arcana === "major" ? "Major" : card.suit}
                </span>
                <span className="text-3xl my-auto">
                  {card.arcana === "major" ? "🔮" : card.suit === "wands" ? "🔥" : card.suit === "cups" ? "🌊" : card.suit === "swords" ? "🗡️" : "⭐"}
                </span>
                <span className="text-[9px] font-mono-sacred text-purple-300">
                  #{card.number}
                </span>
              </div>

              <div>
                <h3 className="font-serif-sacred font-bold text-xs sm:text-sm text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {cardName}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono-sacred mt-0.5 line-clamp-1">
                  {card.keywords.upright.slice(0, 2).join(", ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
