"use client";

import React, { useState, useEffect, use } from "react";
import confetti from "canvas-confetti";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale, TarotCard } from "@/types/tarot";
import { allCards, getCardDisplayName } from "@/lib/tarot/data";
import { secureRandomInt } from "@/lib/rng/draw";
import { Sparkles, Moon, Flame, CheckCircle2, Bookmark, Calendar } from "lucide-react";

interface DailyPageProps {
  params: Promise<{ locale: string }>;
}

export default function DailyPage({ params }: DailyPageProps) {
  const resolvedParams = use(params);
  const locale = (resolvedParams.locale || "en") as Locale;
  const dict = getDictionary(locale);

  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [streak, setStreak] = useState(1);
  const [credits, setCredits] = useState(1);
  const [canClaim, setCanClaim] = useState(true);
  const [isClaimed, setIsClaimed] = useState(false);
  const [reflection, setReflection] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  // Deterministically seed daily card for today based on calendar date
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Simple numeric hash of date
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const cardIndex = Math.abs(hash) % allCards.length;
    setDailyCard(allCards[cardIndex]);
    setIsReversed(Math.abs(hash) % 2 === 1);

    // Fetch user balance & streak
    fetch("/api/credits?userId=guest_default")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance) {
          setStreak(data.balance.dailyStreak || 1);
          setCredits(data.balance.totalCredits);
          setCanClaim(data.balance.canClaimDaily);
        }
      })
      .catch(() => {});
  }, []);

  const handleClaimReward = async () => {
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "guest_default", action: "claim_daily" }),
      });
      const data = await res.json();
      if (data.success) {
        setStreak(data.streak);
        setCredits(data.totalCredits);
        setCanClaim(false);
        setIsClaimed(true);

        // Celebration burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#d4af37", "#f3e5ab", "#8b5cf6"],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReflection = () => {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  if (!dailyCard) return null;

  const cardName = getCardDisplayName(dailyCard, locale);
  const keywords = isReversed ? dailyCard.keywords.reversed : dailyCard.keywords.upright;
  const meaning = isReversed ? dailyCard.meanings.reversed : dailyCard.meanings.upright;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred mb-3">
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span>DAILY ORACLE & STREAK SANCTUARY</span>
        </div>
        <h1 className="font-serif-sacred text-3xl sm:text-5xl font-bold text-amber-100">
          Your Card for Today
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-mono-sacred">
          {new Date().toLocaleDateString(locale === "ja" ? "ja-JP" : locale === "hi" ? "hi-IN" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Streak & Credit Rewards Bar */}
      <div className="w-full mystic-panel rounded-2xl p-5 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            <div>
              <span className="font-serif-sacred text-lg font-bold text-amber-200">
                {streak} Day Streak
              </span>
              <p className="text-[10px] font-mono-sacred text-amber-400/70">
                DAILY RETURN REWARD
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="text-xs font-mono-sacred text-slate-300">
            Available Credits: <span className="text-amber-300 font-bold">{credits}</span>
          </div>
        </div>

        <div>
          {canClaim && !isClaimed ? (
            <button
              type="button"
              onClick={handleClaimReward}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-xs shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim +1 Free Credit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-sacred text-emerald-400 bg-emerald-950/40 px-3.5 py-1.5 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Claimed Today (+1 Added)</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Card Display Card */}
      <div className="w-full mystic-panel rounded-2xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center gap-8 mb-8">
        {/* Card Graphic */}
        <div className="w-48 aspect-[1/1.7] rounded-2xl bg-[#120d26] border-2 border-amber-400/80 p-4 flex flex-col items-center justify-between text-center shadow-xl shadow-amber-500/20 shrink-0 relative overflow-hidden">
          <span className="font-mono-sacred text-[11px] text-amber-400/80 uppercase">
            {dailyCard.arcana} arcana
          </span>

          <div className="my-auto">
            <span className="text-4xl block mb-2">
              {dailyCard.arcana === "major" ? "🔮" : "✨"}
            </span>
            <h3 className="font-serif-sacred text-lg font-bold text-amber-100">
              {cardName}
            </h3>
            <span className="inline-block mt-2 text-[10px] font-mono-sacred px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              {isReversed ? "Reversed ↺" : "Upright ↑"}
            </span>
          </div>

          <div className="text-[10px] font-mono-sacred text-purple-300">
            {keywords.slice(0, 2).join(" • ")}
          </div>
        </div>

        {/* Interpretation Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              ELEMENT: {dailyCard.element.toUpperCase()}
            </span>
            <span className="font-mono-sacred text-xs text-slate-400">
              NUMEROLOGY: {dailyCard.numerology}
            </span>
          </div>

          <h2 className="font-serif-sacred text-2xl font-bold text-amber-200">
            {cardName} ({isReversed ? "Reversed" : "Upright"})
          </h2>

          <p className="text-sm font-mono-sacred text-amber-300/80 italic">
            Keywords: {keywords.join(", ")}
          </p>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
            {meaning}
          </p>

          <div className="pt-3 border-t border-white/5 text-xs text-slate-400 font-serif-sacred italic">
            ✦ Today's Contemplation: How does this card's current mirror the quiet decisions you face before sundown?
          </div>
        </div>
      </div>

      {/* Reflection Journal */}
      <div className="w-full mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 shadow-xl">
        <h4 className="font-serif-sacred text-lg font-bold text-amber-200 mb-2 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          Today's Reflection Notes
        </h4>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Jot down how this card resonates with your day..."
          rows={3}
          className="w-full bg-[#0a0815] border border-amber-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed mb-3"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono-sacred text-emerald-400">
            {savedNote ? "✦ Reflection noted in local journal" : ""}
          </span>
          <button
            type="button"
            onClick={handleSaveReflection}
            className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-mono-sacred hover:bg-amber-500/30 transition-colors"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
