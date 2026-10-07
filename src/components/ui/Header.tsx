"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Moon, Menu, X, Coins, Compass, BookOpen, Layers } from "lucide-react";
import { Locale } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The 3D reading room is a dedicated full-screen experience and has its own minimal HUD bar
  if (pathname?.includes("/reading")) {
    return null;
  }

  // Switch locale while preserving path
  const getLocaleUrl = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  const navLinks = [
    { href: `/${locale}/reading`, label: dict.nav.reading, icon: Sparkles },
    { href: `/${locale}/daily`, label: dict.nav.daily, icon: Moon },
    { href: `/${locale}/cards`, label: dict.nav.cards, icon: BookOpen },
    { href: `/${locale}/spreads`, label: dict.nav.spreads, icon: Layers },
    { href: `/${locale}/dashboard`, label: dict.nav.dashboard, icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 w-full mystic-panel border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-neutral-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-sacred text-lg font-bold tracking-wider text-amber-200 group-hover:text-amber-100 transition-colors">
              {dict.nav.title}
            </span>
            <span className="font-mono-sacred text-[10px] text-amber-400/70 -mt-1 tracking-widest">
              {dict.nav.subtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-colors duration-200 px-3 py-1.5 rounded-md ${
                  isActive
                    ? "text-amber-300 bg-amber-500/10 border border-amber-500/30 shadow-inner"
                    : "text-slate-300 hover:text-amber-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 opacity-75" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Locale Selector */}
        <div className="flex items-center gap-3">
          {/* Guest / Free Credit Badge */}
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred hover:border-amber-400 transition-colors"
            title="Available Credits"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>1 CREDIT</span>
          </Link>

          {/* Locale Picker */}
          <div className="hidden sm:flex items-center bg-black/40 border border-amber-900/40 rounded-lg p-0.5 text-xs font-mono-sacred">
            {(["en", "hi", "ja"] as Locale[]).map((loc) => (
              <Link
                key={loc}
                href={getLocaleUrl(loc)}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === loc
                    ? "bg-amber-500/20 text-amber-300 font-semibold"
                    : "text-slate-400 hover:text-amber-200"
                }`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mystic-panel border-t border-amber-900/30 px-4 pt-3 pb-5 space-y-3">
          <div className="flex justify-around bg-black/50 p-1.5 rounded-lg border border-amber-900/30 mb-3 text-xs font-mono-sacred">
            {(["en", "hi", "ja"] as Locale[]).map((loc) => (
              <Link
                key={loc}
                href={getLocaleUrl(loc)}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-1 rounded ${
                  locale === loc ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400"
                }`}
              >
                {loc === "en" ? "ENGLISH" : loc === "hi" ? "हिन्दी" : "日本語"}
              </Link>
            ))}
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? "bg-amber-500/15 text-amber-200 border border-amber-500/30"
                    : "text-slate-300 hover:text-amber-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400/80" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
