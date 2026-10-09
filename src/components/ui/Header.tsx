"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Moon,
  Menu,
  X,
  Coins,
  Compass,
  BookOpen,
  Layers,
  ArrowRight,
  Music,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Locale } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SanctuarySettingsModal } from "@/components/ui/SanctuarySettingsModal";
import { useSoundscape } from "@/lib/audio/useSoundscape";

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMuted, toggleMute, playButtonClick } = useSoundscape();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // The 3D reading room has its own specialized minimalist HUD
  const isDedicatedReadingRoom = [
    "/reading",
    "/card-of-the-day",
    "/yes-or-no-tarot",
    "/love-tarot-reading",
    "/relationship-tarot-reading",
    "/two-choices-tarot-reading",
    "/question-tarot-reading",
    "/month-ahead-tarot-reading",
    "/career-tarot-reading",
  ].some((r) => pathname?.includes(r));

  if (isDedicatedReadingRoom) {
    return null;
  }

  const getLocaleUrl = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  // Curated, highest-intent tarot categories (Clean, friendly navigation)
  const readingOptions = [
    {
      href: `/${locale}/card-of-the-day`,
      label: locale === "hi" ? "दिन का कार्ड" : locale === "ja" ? "今日のカード" : "Daily Tarot",
    },
    {
      href: `/${locale}/yes-or-no-tarot`,
      label: locale === "hi" ? "हाँ या ना टैरो" : locale === "ja" ? "イエス・ノー リーディング" : "Yes or No",
    },
    {
      href: `/${locale}/love-tarot-reading`,
      label: locale === "hi" ? "प्रेम और संबंध टैरो" : locale === "ja" ? "愛と絆のリーディング" : "Love & Relationship",
    },
    {
      href: `/${locale}/career-tarot-reading`,
      label: locale === "hi" ? "करियर और जीवन उद्देश्य" : locale === "ja" ? "キャリア＆ライフパーパス" : "Career & Purpose",
    },
    {
      href: `/${locale}/spreads`,
      label: locale === "hi" ? "समस्त टैरो विन्यास" : locale === "ja" ? "すべてのリーディング" : "Tarot Spreads",
    },
  ];

  const standardNavLinks = [
    {
      href: `/${locale}/daily`,
      label: dict.nav.daily || "Daily Card",
      icon: Moon,
    },
    {
      href: `/${locale}/cards`,
      label: dict.nav.cards || "78 Cards",
      icon: BookOpen,
    },
    {
      href: `/${locale}/dashboard`,
      label: dict.nav.dashboard || "My Journey",
      icon: Compass,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07050e]/90 border-b border-amber-500/20 shadow-lg shadow-black/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 1. Brand Logo */}
          <Link
            href={`/${locale}`}
            onClick={() => playButtonClick?.()}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-xl p-1 shrink-0"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 group-hover:shadow-amber-400/40 transition-all duration-300">
              <Sparkles className="w-4.5 h-4.5 text-neutral-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-sacred text-base sm:text-lg font-bold tracking-wider text-amber-200 group-hover:text-amber-100 transition-colors">
                {dict.nav.title || "ARCANA 3D"}
              </span>
              <span className="font-mono-sacred text-[9px] sm:text-[10px] text-amber-400/70 -mt-1 tracking-widest uppercase">
                {dict.nav.subtitle || "Sacred AI Sanctuary"}
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation with Readings Dropdown matching Competitor */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3" aria-label="Main Navigation">
            {/* Readings Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs xl:text-sm font-medium tracking-wide px-3.5 py-1.5 rounded-full text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                aria-haspopup="true"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">{dict.nav?.readingsDropdown || "Readings"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Clean Glass Dropdown Popover */}
              <div className="absolute left-0 top-full pt-2 w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="rounded-2xl p-1.5 bg-[#090714]/95 backdrop-blur-2xl border border-amber-500/25 shadow-2xl shadow-purple-950/70 space-y-0.5">
                  {readingOptions.map((opt) => (
                    <Link
                      key={opt.href}
                      href={opt.href}
                      onClick={() => playButtonClick?.()}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-amber-200 hover:bg-amber-500/10 transition-all group/item"
                    >
                      <span className="font-medium group-hover/item:translate-x-0.5 transition-transform">
                        {opt.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-400/40 group-hover/item:text-amber-300 group-hover/item:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Nav Links */}
            {standardNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== `/${locale}` && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => playButtonClick?.()}
                  className={`flex items-center gap-2 text-xs xl:text-sm font-medium tracking-wide transition-all duration-200 px-3.5 py-1.5 rounded-full ${
                    isActive
                      ? "text-amber-200 bg-amber-500/20 border border-amber-400/50 shadow-md shadow-amber-500/10 font-semibold"
                      : "text-slate-300 hover:text-amber-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-amber-400/70"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Actions Right: Credits Pill + Settings Gear + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Free Credit Pill */}
            <Link
              href={`/${locale}/dashboard`}
              onClick={() => playButtonClick?.()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-950/70 to-purple-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono-sacred hover:border-amber-400 hover:scale-105 transition-all shadow-md shadow-amber-500/10"
              title="Available Divine Credits"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-bold tracking-wider">1 {dict.nav?.creditPill || "CREDIT"}</span>
            </Link>

            {/* Consolidated Settings Popover (Audio, Theme, Language) */}
            <SanctuarySettingsModal locale={locale} />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                playButtonClick?.();
              }}
              className="lg:hidden p-2 rounded-full text-slate-300 hover:text-amber-300 bg-black/40 hover:bg-white/5 border border-amber-500/30 transition-all focus:outline-none"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. Luxury Full-Height Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-between bg-[#06040c]/98 backdrop-blur-2xl animate-in fade-in duration-300">
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-amber-500/20 bg-black/40">
            <Link
              href={`/${locale}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif-sacred font-bold text-lg text-amber-200 tracking-wider">
                ARCANA 3D
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-amber-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-2.5">
            {/* Quick Credit Status Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-purple-950/30 to-black/60 border border-amber-500/30 flex items-center justify-between mb-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-sacred text-amber-300 font-bold uppercase tracking-wider">
                    {dict.nav?.sacredBalance || "Sacred Balance"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {dict.nav?.freeDailyCreditDesc || "1 Free Daily Divination Credit"}
                  </div>
                </div>
              </div>
              <Link
                href={`/${locale}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-mono-sacred text-amber-400 hover:text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-full bg-black/60 uppercase"
              >
                {dict.nav?.view || "View"}
              </Link>
            </div>

            {/* Readings Section */}
            <div className="space-y-1 mb-4">
              <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase px-1">
                {dict.nav?.readingsDropdown || "Readings"}
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {readingOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 text-xs text-slate-200 hover:text-amber-200 transition-all"
                  >
                    <span className="font-medium">{opt.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400/50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Standard Sanctuary Links */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="font-mono-sacred text-[10px] text-slate-400 tracking-widest uppercase px-1">
                {dict.nav?.sanctuaryHeader || "SANCTUARY"}
              </span>
              {standardNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-amber-500/15 border-amber-400/60 text-amber-100 shadow-md shadow-amber-500/10"
                        : "bg-black/40 border-white/5 text-slate-200 hover:border-amber-500/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-amber-500/25 text-amber-300 border border-amber-400/40"
                            : "bg-white/5 text-slate-300 border border-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="font-serif-sacred font-bold text-xs text-slate-100">
                        {link.label}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400/60" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer: Language & Quick Audio */}
          <div className="p-5 border-t border-amber-500/20 bg-black/50 space-y-3">
            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-sacred text-amber-400/80 flex items-center gap-1.5 uppercase">
                <Globe className="w-3.5 h-3.5" />
                <span>{dict.settings?.languageSection || "Language"}</span>
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: "en", label: "EN" },
                  { id: "hi", label: "हिन्दी" },
                  { id: "ja", label: "日本語" },
                  { id: "zh", label: "中文" },
                  { id: "es", label: "ES" },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={getLocaleUrl(item.id as Locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-sacred transition-all ${
                      locale === item.id
                        ? "bg-amber-500/25 border border-amber-400/60 text-amber-200 font-bold"
                        : "text-slate-400 hover:text-slate-200 bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono-sacred"
            >
              <span className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span>{dict.settings?.ambienceSection || "Sacred Ambience"}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${!isMuted ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "bg-neutral-800 text-neutral-400"}`}>
                {!isMuted ? (dict.settings?.soundOn || "ACTIVE") : (dict.settings?.muted || "MUTED")}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
