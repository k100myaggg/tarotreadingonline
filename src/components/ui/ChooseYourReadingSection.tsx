"use client";

import React from "react";
import Link from "next/link";
import { Locale } from "@/types/tarot";
import { READING_TYPES, FEATURED_READING_TYPES } from "@/lib/tarot/readingTypes";
import { useSoundscape } from "@/lib/audio/useSoundscape";

interface ChooseYourReadingSectionProps {
  locale: Locale;
}

// Crisp, authentic tarot linework SVGs matching competitor cards
function CardIllustration({ slug }: { slug: string }) {
  switch (slug) {
    case "card-of-the-day":
      // Arcanum XXI - The World (Ouroboros Serpent, Crossed Wands, Zodiac)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer & Inner Frame */}
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          {/* Header & Roman */}
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">XXI</text>
          {/* Zodiac corner glyphs */}
          <text x="22" y="31" textAnchor="middle" className="text-[11px] font-mono" fill="currentColor" stroke="none">♒</text>
          <text x="138" y="31" textAnchor="middle" className="text-[11px] font-mono" fill="currentColor" stroke="none">♏</text>
          <text x="22" y="196" textAnchor="middle" className="text-[11px] font-mono" fill="currentColor" stroke="none">♉</text>
          <text x="138" y="196" textAnchor="middle" className="text-[11px] font-mono" fill="currentColor" stroke="none">♌</text>
          {/* Ouroboros Circle */}
          <circle cx="80" cy="112" r="46" strokeWidth="4.5" />
          <circle cx="80" cy="112" r="38" strokeWidth="1.5" />
          {/* Serpent scale dots */}
          <circle cx="80" cy="66" r="2.5" fill="currentColor" />
          <circle cx="126" cy="112" r="2.5" fill="currentColor" />
          <circle cx="80" cy="158" r="2.5" fill="currentColor" />
          <circle cx="34" cy="112" r="2.5" fill="currentColor" />
          {/* Crossed Wands */}
          <line x1="60" y1="92" x2="100" y2="132" strokeWidth="3" />
          <line x1="100" y1="92" x2="60" y2="132" strokeWidth="3" />
          <circle cx="60" cy="92" r="4.5" fill="currentColor" />
          <circle cx="100" cy="92" r="4.5" fill="currentColor" />
          <circle cx="60" cy="132" r="4.5" fill="currentColor" />
          <circle cx="100" cy="132" r="4.5" fill="currentColor" />
          {/* Sacred bottom curved plate */}
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "yes-or-no-tarot":
      // Arcanum XVII - The Star (8-point radiant star, ripples in water, water droplets)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">XVII</text>
          <path d="M 22 28 L 22 34 M 19 31 L 25 31" strokeWidth="1.5" />
          <path d="M 138 28 L 138 34 M 135 31 L 141 31" strokeWidth="1.5" />
          {/* Radiant Star (8 points) */}
          <polygon points="80,52 87,74 109,74 91,88 98,110 80,96 62,110 69,88 51,74 73,74" fill="currentColor" />
          <polygon points="80,59 85,76 102,76 88,87 93,104 80,93 67,104 72,87 58,76 75,76" fill="#f6f2e8" />
          <polygon points="80,68 83,78 93,78 85,84 88,94 80,88 72,94 75,84 67,78 77,78" fill="currentColor" />
          {/* Water droplets falling */}
          <path d="M 68 126 C 68 122 72 118 72 118 C 72 118 76 122 76 126 C 76 128 74 130 72 130 C 70 130 68 128 68 126 Z" fill="currentColor" />
          <path d="M 88 126 C 88 122 92 118 92 118 C 92 118 96 122 96 126 C 96 128 94 130 92 130 C 90 130 88 128 88 126 Z" fill="currentColor" />
          {/* Concentric ripples */}
          <ellipse cx="80" cy="155" rx="48" ry="14" strokeWidth="2.5" />
          <ellipse cx="80" cy="155" rx="34" ry="10" strokeWidth="2" />
          <ellipse cx="80" cy="155" rx="18" ry="5" strokeWidth="1.8" />
          <circle cx="80" cy="155" r="2.5" fill="currentColor" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "two-choices-tarot-reading":
      // Arcanum XIX - The Sun (Smiling Sun Face, Sunflowers)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">XIX</text>
          {/* Sun Rays */}
          <g transform="translate(80, 92)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line key={deg} x1="0" y1="-32" x2="0" y2="-48" strokeWidth="3" transform={`rotate(${deg})`} />
            ))}
            <circle cx="0" cy="0" r="28" fill="#f6f2e8" strokeWidth="3" />
            {/* Sun Face */}
            <path d="M -12 -5 Q -8 -10 -4 -5" strokeWidth="2" />
            <path d="M 4 -5 Q 8 -10 12 -5" strokeWidth="2" />
            <circle cx="-8" cy="-3" r="2.5" fill="currentColor" />
            <circle cx="8" cy="-3" r="2.5" fill="currentColor" />
            <path d="M -1 2 L 1 2 L 0 7 Z" fill="currentColor" />
            <path d="M -12 12 Q 0 20 12 12" strokeWidth="2.5" />
          </g>
          {/* Sunflowers at bottom */}
          <circle cx="48" cy="162" r="12" strokeWidth="2" />
          <circle cx="48" cy="162" r="5" fill="currentColor" />
          <circle cx="80" cy="158" r="14" strokeWidth="2" />
          <circle cx="80" cy="158" r="6" fill="currentColor" />
          <circle cx="112" cy="162" r="12" strokeWidth="2" />
          <circle cx="112" cy="162" r="5" fill="currentColor" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "love-tarot-reading":
      // Arcanum XIV - Temperance (Chalice with flowing sacred water, Pyramid triangle)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">XIV</text>
          {/* Sacred Square & Triangle */}
          <rect x="36" y="52" width="88" height="68" strokeWidth="1.8" />
          <polygon points="80,58 46,112 114,112" strokeWidth="2" />
          {/* Flowing Water from Upper Vessel into Lower Chalice */}
          <path d="M 104 68 Q 112 78 98 84 Q 84 88 88 126" strokeWidth="3" fill="none" />
          <ellipse cx="106" cy="64" rx="10" ry="5" strokeWidth="2" />
          <path d="M 96 64 Q 106 58 116 64 L 112 80 L 100 80 Z" strokeWidth="2" />
          {/* Lower Chalice */}
          <path d="M 64 128 Q 64 150 80 150 Q 96 150 96 128 Z" strokeWidth="3" fill="none" />
          <line x1="80" y1="150" x2="80" y2="168" strokeWidth="4" />
          <ellipse cx="80" cy="168" rx="18" ry="5" strokeWidth="2.5" />
          {/* Water stream inside */}
          <path d="M 76 96 Q 78 128 78 136 M 82 92 Q 83 124 84 136" strokeWidth="2" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "relationship-tarot-reading":
      // Arcanum VI - The Lovers (Two hands holding heart, flame, rainbow arc)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">VI</text>
          {/* Sacred Flame at top */}
          <path d="M 80 48 Q 72 58 80 68 Q 88 58 80 48 Z" fill="currentColor" />
          <path d="M 74 60 Q 68 68 74 74 Q 80 68 74 60 Z" fill="currentColor" />
          <path d="M 86 60 Q 92 68 86 74 Q 80 68 86 60 Z" fill="currentColor" />
          {/* Sacred Heart */}
          <path d="M 80 94 C 80 82 62 76 54 88 C 44 102 80 128 80 128 C 80 128 116 102 106 88 C 98 76 80 82 80 94 Z" fill="currentColor" />
          {/* Cupping Hands & Rainbow Arc */}
          <path d="M 44 146 Q 80 124 116 146" strokeWidth="3" />
          <path d="M 48 154 Q 80 134 112 154" strokeWidth="2" />
          <path d="M 52 162 Q 80 144 108 162" strokeWidth="2" />
          {/* Cloud waves beneath */}
          <path d="M 32 174 Q 44 162 56 174 Q 68 162 80 174 Q 92 162 104 174 Q 116 162 128 174" strokeWidth="2" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "question-tarot-reading":
      // Arcanum XVIII - The Moon (Crescent Moon face, cat/wolf looking up)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">XVIII</text>
          <path d="M 22 28 L 22 34 M 19 31 L 25 31" strokeWidth="1.5" />
          <path d="M 138 28 L 138 34 M 135 31 L 141 31" strokeWidth="1.5" />
          {/* Big Crescent Moon Face */}
          <path d="M 82 50 A 38 38 0 1 1 82 126 A 26 26 0 1 0 82 50 Z" fill="currentColor" />
          {/* Profile Eye and Nose in negative space */}
          <circle cx="94" cy="84" r="2.5" fill="#f6f2e8" />
          {/* Little Stars */}
          <text x="42" y="66" className="text-[12px]" fill="currentColor" stroke="none">✦</text>
          <text x="124" y="80" className="text-[10px]" fill="currentColor" stroke="none">✦</text>
          <text x="36" y="112" className="text-[10px]" fill="currentColor" stroke="none">✦</text>
          {/* Cat Silhouette looking up */}
          <path d="M 88 180 C 88 170 92 160 92 144 C 92 136 86 132 82 132 C 78 132 72 136 72 144 C 72 160 76 170 76 180 Z" fill="currentColor" />
          {/* Cat Ears */}
          <polygon points="74,134 76,126 80,132" fill="currentColor" />
          <polygon points="84,132 88,126 90,134" fill="currentColor" />
          {/* Tail curving around */}
          <path d="M 88 178 C 98 182 108 174 104 162 C 102 156 96 156 96 160" strokeWidth="3" fill="none" />
          {/* Horizon lines */}
          <line x1="28" y1="180" x2="132" y2="180" strokeWidth="2" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "career-tarot-reading":
      // Arcanum IV - The Emperor / Throne, Scepter, Pentacle & Mountain Peaks
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">IV</text>
          {/* Mountain Peaks in background */}
          <polygon points="32,106 58,62 84,106" strokeWidth="1.8" />
          <polygon points="76,106 102,68 128,106" strokeWidth="1.8" />
          {/* Stone Throne */}
          <rect x="42" y="86" width="76" height="88" rx="4" strokeWidth="2.5" />
          {/* Crown */}
          <polygon points="68,86 72,74 80,78 88,74 92,86" fill="currentColor" />
          {/* Ankh / Scepter in right hand */}
          <circle cx="106" cy="116" r="6" strokeWidth="2" />
          <line x1="106" y1="122" x2="106" y2="152" strokeWidth="2.5" />
          <line x1="100" y1="128" x2="112" y2="128" strokeWidth="2" />
          {/* Golden Pentacle Globe in left hand */}
          <circle cx="54" cy="126" r="12" strokeWidth="2.5" />
          <polygon points="54,116 57,124 66,124 59,129 61,137 54,132 47,137 49,129 42,124 51,124" fill="currentColor" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );

    case "month-ahead-tarot-reading":
    default:
      // Arcanum IX - The Hermit (Hooded sage with glowing lantern & staff)
      return (
        <svg viewBox="0 0 160 220" className="w-full h-full text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="144" height="204" rx="6" strokeWidth="2" />
          <rect x="13" y="13" width="134" height="194" rx="4" strokeWidth="1" strokeDasharray="3 2" />
          <text x="80" y="32" textAnchor="middle" className="text-[15px] font-serif font-black tracking-widest" fill="currentColor" stroke="none">IX</text>
          {/* Celestial Stars */}
          <text x="32" y="60" className="text-[10px]" fill="currentColor" stroke="none">✦</text>
          <text x="128" y="70" className="text-[12px]" fill="currentColor" stroke="none">✦</text>
          <text x="132" y="112" className="text-[9px]" fill="currentColor" stroke="none">✦</text>
          {/* Staff */}
          <line x1="120" y1="58" x2="120" y2="180" strokeWidth="3.5" />
          <circle cx="120" cy="56" r="4" fill="currentColor" />
          {/* Lantern held in hand */}
          <line x1="68" y1="84" x2="52" y2="96" strokeWidth="2.5" />
          <rect x="44" y="96" width="16" height="26" rx="2" strokeWidth="2" />
          <line x1="44" y1="109" x2="60" y2="109" strokeWidth="1.5" />
          <line x1="52" y1="96" x2="52" y2="122" strokeWidth="1.5" />
          <polygon points="52,102 54,106 58,107 55,110 56,114 52,112 48,114 49,110 46,107 50,106" fill="currentColor" />
          {/* Hooded Hermit Cloak */}
          <path d="M 88 56 C 76 56 68 66 68 78 C 68 88 74 94 76 104 C 80 120 74 150 72 180 L 108 180 C 106 150 102 120 104 104 C 106 94 108 86 108 78 C 108 66 98 56 88 56 Z" fill="currentColor" />
          {/* Face shadow inside hood */}
          <path d="M 80 72 C 80 78 84 82 88 82 C 90 82 94 78 94 72" stroke="#f6f2e8" strokeWidth="2" fill="none" />
          {/* Cloak folds */}
          <line x1="88" y1="94" x2="88" y2="180" stroke="#f6f2e8" strokeWidth="2" />
          <path d="M 30 185 Q 80 195 130 185" strokeWidth="2.5" />
        </svg>
      );
  }
}

export function ChooseYourReadingSection({ locale }: ChooseYourReadingSectionProps) {
  const { playButtonClick } = useSoundscape();

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Section Title */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="font-serif-sacred text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f4ebd0] drop-shadow-sm">
          {locale === "hi" ? "अपना पवित्र टैरो विन्यास चुनें" : locale === "ja" ? "聖なるリーディングを選択する" : "Choose your Reading"}
        </h2>
        <p className="text-xs sm:text-sm font-mono-sacred text-amber-400/80 uppercase tracking-widest mt-2">
          ✦ HIGH-DEMAND SACRED ARCHETYPES · REAL-TIME 3D DIVINATION · DEDICATED ORACLES ✦
        </p>
      </div>

      {/* Curated Grid of 4 High-Demand Readings */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-2">
        {FEATURED_READING_TYPES.map((reading) => {
          const href = `/${locale}/${reading.slug}`;
          return (
            <Link
              key={reading.slug}
              href={href}
              onClick={() => playButtonClick?.()}
              className="group flex flex-col items-center p-3 sm:p-4 rounded-2xl mystic-panel border border-amber-500/20 hover:border-amber-400/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 focus:outline-none"
            >
              {/* 1. Vintage Ivory Card Frame */}
              <div className="w-full max-w-[155px] aspect-[1/1.5] rounded-xl bg-[#f6f2e8] p-1.5 shadow-xl shadow-black/80 border border-[#e5dcba] group-hover:border-amber-400/70 transition-all relative flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-lg border border-neutral-900/10 flex items-center justify-center p-1 bg-[#f9f6ed]">
                  <CardIllustration slug={reading.slug} />
                </div>
              </div>

              {/* 2. Badge, Title & Subtitle */}
              <div className="mt-4 text-center flex flex-col items-center w-full px-1">
                <span className="text-[9px] font-mono-sacred text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 uppercase tracking-wider mb-1">
                  {reading.badge}
                </span>
                <h3 className="font-serif-sacred text-sm sm:text-base font-bold text-amber-100 group-hover:text-amber-200 transition-colors leading-tight">
                  {reading.name[locale] || reading.name.en}
                </h3>
                <p className="font-serif-sacred italic text-[11px] sm:text-xs text-slate-300 font-light mt-1 leading-tight line-clamp-2">
                  {reading.subtitle[locale] || reading.subtitle.en}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

