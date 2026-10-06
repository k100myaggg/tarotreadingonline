"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/types/tarot";
import { analyzeHistoricalThemes, HistoricalReadingItem } from "@/lib/analytics/recurringThemes";
import {
  Sparkles,
  Coins,
  Flame,
  Calendar,
  Compass,
  ArrowRight,
  TrendingUp,
  Share2,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = use(params);
  const locale = (resolvedParams.locale || "en") as Locale;
  const dict = getDictionary(locale);

  const [balance, setBalance] = useState({
    freeCredits: 1,
    purchasedCredits: 0,
    totalCredits: 1,
    dailyStreak: 3,
  });

  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  // Sample historical readings for recurring theme analysis
  const [history] = useState<HistoricalReadingItem[]>([
    {
      id: "rd_1",
      createdAt: "2026-10-05T10:30:00Z",
      question: "Creative project direction",
      spreadId: "three_card",
      cards: [
        { cardId: "minor_wands_ace", isReversed: false },
        { cardId: "major_01_magician", isReversed: false },
        { cardId: "minor_wands_three", isReversed: false },
      ],
    },
    {
      id: "rd_2",
      createdAt: "2026-10-04T15:00:00Z",
      question: "Navigating team collaboration",
      spreadId: "three_card",
      cards: [
        { cardId: "minor_cups_two", isReversed: false },
        { cardId: "minor_cups_three", isReversed: false },
        { cardId: "minor_wands_four", isReversed: false },
      ],
    },
    {
      id: "rd_3",
      createdAt: "2026-10-03T09:15:00Z",
      question: "Inner clarity on life transition",
      spreadId: "single",
      cards: [{ cardId: "major_17_star", isReversed: false }],
    },
    {
      id: "rd_4",
      createdAt: "2026-10-02T18:45:00Z",
      question: "Financial and practical next steps",
      spreadId: "three_card",
      cards: [
        { cardId: "minor_pentacles_ace", isReversed: false },
        { cardId: "minor_pentacles_three", isReversed: false },
        { cardId: "major_19_sun", isReversed: false },
      ],
    },
    {
      id: "rd_5",
      createdAt: "2026-10-01T11:20:00Z",
      question: "Overcoming self-doubt",
      spreadId: "three_card",
      cards: [
        { cardId: "major_08_strength", isReversed: false },
        { cardId: "minor_swords_eight", isReversed: true },
        { cardId: "major_00_fool", isReversed: false },
      ],
    },
    {
      id: "rd_6",
      createdAt: "2026-09-30T14:10:00Z",
      question: "Career crossroads Option A vs B",
      spreadId: "decision_ab",
      cards: [
        { cardId: "major_02_high_priestess", isReversed: false },
        { cardId: "minor_wands_eight", isReversed: false },
        { cardId: "minor_cups_ten", isReversed: false },
        { cardId: "minor_swords_ace", isReversed: false },
        { cardId: "major_21_world", isReversed: false },
      ],
    },
    {
      id: "rd_7",
      createdAt: "2026-09-29T16:00:00Z",
      question: "Sovereign personal vision for autumn",
      spreadId: "three_card",
      cards: [
        { cardId: "major_04_emperor", isReversed: false },
        { cardId: "minor_wands_six", isReversed: false },
        { cardId: "minor_wands_king", isReversed: false },
      ],
    },
  ]);

  const themes = analyzeHistoricalThemes(history, locale);

  useEffect(() => {
    fetch("/api/credits?userId=guest_default")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance) {
          setBalance({
            freeCredits: data.balance.freeCredits,
            purchasedCredits: data.balance.purchasedCredits,
            totalCredits: data.balance.totalCredits,
            dailyStreak: data.balance.dailyStreak || 3,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleBuyPack = async (packId: string) => {
    try {
      setIsCheckingOut(packId);
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, userId: "guest_default", locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-amber-900/30">
        <div>
          <span className="font-mono-sacred text-xs text-amber-400">
            SEEKER SANCTUARY & ARCHIVE
          </span>
          <h1 className="font-serif-sacred text-3xl sm:text-4xl font-bold text-amber-100">
            My Journey & Credit Ledger
          </h1>
        </div>

        <Link
          href={`/${locale}/reading`}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-serif-sacred font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Reading</span>
        </Link>
      </div>

      {/* Credit Ledger & Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="mystic-panel rounded-2xl p-6 border border-amber-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-sacred text-xs text-amber-400">AVAILABLE BALANCE</span>
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div className="font-serif-sacred text-4xl font-bold text-amber-100">
              {balance.totalCredits} <span className="text-lg font-light text-amber-300">Credits</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono-sacred">
              {balance.freeCredits} Daily Free • {balance.purchasedCredits} Purchased
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono-sacred text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Atomic double-entry protection active</span>
          </div>
        </div>

        {/* Streak Card */}
        <div className="mystic-panel rounded-2xl p-6 border border-amber-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-sacred text-xs text-amber-400">DAILY STREAK</span>
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="font-serif-sacred text-4xl font-bold text-amber-100">
              {balance.dailyStreak} <span className="text-lg font-light text-amber-300">Days</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono-sacred">
              Milestone: Mystic Novice (Claim daily card to keep alive)
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono-sacred text-amber-300">
            Next Milestone: 7-Day Mystic (+2 bonus credits)
          </div>
        </div>

        {/* Readings Count Card */}
        <div className="mystic-panel rounded-2xl p-6 border border-amber-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-sacred text-xs text-amber-400">READINGS LOGGED</span>
              <Compass className="w-5 h-5 text-purple-400" />
            </div>
            <div className="font-serif-sacred text-4xl font-bold text-amber-100">
              {history.length} <span className="text-lg font-light text-purple-300">Readings</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono-sacred">
              7/7 Readings: Recurring-Theme Analysis Unlocked!
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono-sacred text-purple-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Archetypal patterns computed</span>
          </div>
        </div>
      </div>

      {/* Recurring-Theme Analysis Section */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-10 border border-amber-500/40 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-900/30">
          <div>
            <span className="font-mono-sacred text-xs text-amber-400">
              ✦ 7-READING RECURRING THEME ANALYSIS ✦
            </span>
            <h2 className="font-serif-sacred text-2xl font-bold text-amber-100 mt-1">
              Your Current "Soul Season" Pattern
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-mono-sacred">
            UNLOCKED
          </span>
        </div>

        {/* Dominant Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="p-4 rounded-xl bg-black/40 border border-amber-900/30">
            <span className="font-mono-sacred text-[11px] text-slate-400 block mb-1">
              DOMINANT ELEMENT
            </span>
            <span className="font-serif-sacred text-xl font-bold text-amber-300 uppercase">
              {themes.dominantElement.element} ({themes.dominantElement.percentage}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-amber-900/30">
            <span className="font-mono-sacred text-[11px] text-slate-400 block mb-1">
              DOMINANT SUIT
            </span>
            <span className="font-serif-sacred text-xl font-bold text-amber-300 uppercase">
              {themes.dominantSuit.suit} ({themes.dominantSuit.percentage}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-amber-900/30">
            <span className="font-mono-sacred text-[11px] text-slate-400 block mb-1">
              MAJOR ARCANA RATIO
            </span>
            <span className="font-serif-sacred text-xl font-bold text-purple-300">
              {themes.majorArcanaRatio}% Soul Lessons
            </span>
          </div>
        </div>

        {/* Holistic Soul Season Narrative */}
        <div className="p-6 rounded-xl bg-[#140e2b] border border-amber-500/30">
          <h4 className="font-serif-sacred font-bold text-lg text-amber-200 mb-2">
            Soul Season Insight:
          </h4>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
            {themes.soulSeasonInsight}
          </p>
        </div>
      </div>

      {/* Credit Vessel Purchase Packs (Stripe) */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-6">
        <div>
          <span className="font-mono-sacred text-xs text-amber-400">MONETIZATION & PACKS</span>
          <h3 className="font-serif-sacred text-2xl font-bold text-amber-100 mt-1">
            Acquire Credit Vessels
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Credits never expire. Support deep Celtic Cross spreads, extra guidance draws, and unlimited persona dialogue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Seeker Pack */}
          <div className="p-6 rounded-xl bg-black/40 border border-amber-900/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
            <div>
              <span className="font-mono-sacred text-xs text-amber-400">ENTRY</span>
              <h4 className="font-serif-sacred text-xl font-bold text-amber-200 mt-1">
                Seeker Pack
              </h4>
              <div className="font-serif-sacred text-3xl font-bold text-amber-100 my-3">
                $4.99 <span className="text-xs font-mono-sacred text-slate-400">/ 10 CREDITS</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono-sacred">
                <li>• 10 Deep Readings or Follow-ups</li>
                <li>• Instant Stripe activation</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isCheckingOut === "seeker"}
              onClick={() => handleBuyPack("seeker")}
              className="mt-6 w-full py-2.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-mono-sacred hover:bg-amber-500/30 transition-all"
            >
              {isCheckingOut === "seeker" ? "Connecting..." : "Acquire Vessel"}
            </button>
          </div>

          {/* Mystic Pack (Popular) */}
          <div className="p-6 rounded-xl bg-[#140e2b] border-2 border-amber-400 shadow-lg shadow-amber-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 font-mono-sacred text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold">
              MOST POPULAR
            </span>
            <div>
              <span className="font-mono-sacred text-xs text-amber-400">DEVOTED</span>
              <h4 className="font-serif-sacred text-xl font-bold text-amber-200 mt-1">
                Mystic Pack
              </h4>
              <div className="font-serif-sacred text-3xl font-bold text-amber-100 my-3">
                $11.99 <span className="text-xs font-mono-sacred text-slate-400">/ 30 CREDITS</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono-sacred">
                <li>• 30 Deep Readings or Follow-ups</li>
                <li>• 20% savings vs single purchases</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isCheckingOut === "mystic"}
              onClick={() => handleBuyPack("mystic")}
              className="mt-6 w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-mono-sacred font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              {isCheckingOut === "mystic" ? "Connecting..." : "Acquire Vessel"}
            </button>
          </div>

          {/* Oracle Pack */}
          <div className="p-6 rounded-xl bg-black/40 border border-amber-900/40 hover:border-amber-400/50 transition-all flex flex-col justify-between">
            <div>
              <span className="font-mono-sacred text-xs text-purple-400">ILLUMINATED</span>
              <h4 className="font-serif-sacred text-xl font-bold text-amber-200 mt-1">
                Oracle Pack
              </h4>
              <div className="font-serif-sacred text-3xl font-bold text-amber-100 my-3">
                $29.99 <span className="text-xs font-mono-sacred text-slate-400">/ 100 CREDITS</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono-sacred">
                <li>• 100 Deep Readings or Follow-ups</li>
                <li>• Maximum volume discount</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isCheckingOut === "oracle"}
              onClick={() => handleBuyPack("oracle")}
              className="mt-6 w-full py-2.5 rounded-lg bg-purple-500/20 border border-purple-400 text-purple-200 text-xs font-mono-sacred hover:bg-purple-500/30 transition-all"
            >
              {isCheckingOut === "oracle" ? "Connecting..." : "Acquire Vessel"}
            </button>
          </div>
        </div>
      </div>

      {/* Reading History Log */}
      <div className="mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 shadow-xl space-y-6">
        <h3 className="font-serif-sacred text-2xl font-bold text-amber-100">
          Reading History Archive
        </h3>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <span className="font-mono-sacred text-[10px] text-amber-400">
                  {new Date(item.createdAt).toLocaleDateString()} • {item.spreadId.toUpperCase()}
                </span>
                <h4 className="font-serif-sacred font-bold text-base text-amber-100 mt-0.5">
                  "{item.question}"
                </h4>
                <p className="text-xs text-slate-400 font-mono-sacred mt-1">
                  Cards: {item.cards.map((c) => c.cardId.replace("minor_", "").replace("major_", "")).join(", ")}
                </p>
              </div>

              <Link
                href={`/${locale}/reading`}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred hover:bg-amber-500/20 transition-colors shrink-0"
              >
                View Spread →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
