"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shield, HeartHandshake } from "lucide-react";
import { Locale, ALL_LANGUAGES } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface FooterProps {
  locale: Locale;
  forceShow?: boolean;
}

export function Footer({ locale, forceShow }: FooterProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();

  // The 3D reading rooms are dedicated interactive experiences during steps 1-3
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

  if (isDedicatedReadingRoom && !forceShow) {
    return null;
  }

  const getLocaleUrl = (targetCode: Locale) => {
    if (!pathname) return `/${targetCode}`;
    const segments = pathname.split("/");
    // segments[0] is empty string, segments[1] is the current locale
    segments[1] = targetCode;
    return segments.join("/") || `/${targetCode}`;
  };

  return (
    <footer className="w-full mystic-panel border-t border-amber-900/30 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-serif-sacred text-base font-bold text-amber-200">
                {dict.nav.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dict.footer?.brandDesc || "Bridging the 1909 Pamela Colman Smith hermetic archetypes with modern sovereign artificial intelligence."}
            </p>
            <div className="pt-2 text-[11px] font-mono-sacred text-amber-400/70">
              {dict.footer?.archiveNotice || "PUBLIC DOMAIN RWS (1909) ARCHIVE"}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-mono-sacred text-xs text-amber-300 uppercase tracking-wider">
              {dict.footer?.sacredPortals || "Sacred Portals"}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href={`/${locale}/reading`} className="hover:text-amber-200 transition-colors">
                  {dict.nav.reading}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/daily`} className="hover:text-amber-200 transition-colors">
                  {dict.nav.daily}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cards`} className="hover:text-amber-200 transition-colors">
                  {dict.nav.cards}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/spreads`} className="hover:text-amber-200 transition-colors">
                  {dict.nav.spreads}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Ethical Guardrails */}
          <div className="space-y-2">
            <h4 className="font-mono-sacred text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              {dict.footer?.ethicalTitle || "Ethical AI Oracle"}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>{dict.footer?.ethicalBullet1 || "The LLM never picks cards; random draws are cryptographically certified."}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>{dict.footer?.ethicalBullet2 || "No absolute fortune-telling or deterministic medical/legal claims."}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>{dict.footer?.ethicalBullet3 || "Self-harm and crisis inquiries are met with compassion and immediate helpline guidance."}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Crisis Support Resources */}
          <div className="space-y-2">
            <h4 className="font-mono-sacred text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              {dict.footer?.supportTitle || "Support & Care"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dict.footer?.supportDesc || "If you or someone you know is in crisis, please connect with confidential support:"}
            </p>
            <div className="text-[11px] font-mono-sacred space-y-1 text-slate-300">
              <p>US / Canada: <span className="text-amber-300">Call/Text 988</span></p>
              <p>India: <span className="text-amber-300">Vandrevala (+91 9999 666 555)</span></p>
              <p>Japan: <span className="text-amber-300">TELL Japan (03-5774-0992)</span></p>
            </div>
          </div>
        </div>

        {/* ─── COMPETITOR-STYLE MULTILINGUAL LANGUAGE BAR (Screenshot 1) ─── */}
        <div className="pt-8 pb-6 border-t border-amber-900/30 flex flex-col items-center">
          <nav
            aria-label="Languages"
            className="w-full flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2.5 text-xs text-slate-400 max-w-5xl"
          >
            {ALL_LANGUAGES.map((lang) => {
              const isCurrent = locale === lang.code;
              return (
                <Link
                  key={lang.code}
                  href={getLocaleUrl(lang.code)}
                  className={`transition-colors whitespace-nowrap ${
                    isCurrent
                      ? "text-amber-300 font-semibold underline underline-offset-4 decoration-amber-400/60"
                      : "text-slate-400 hover:text-amber-200"
                  }`}
                  title={`${lang.nativeName} (${lang.englishName})`}
                >
                  {lang.nativeName}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ─── BOTTOM LEGAL & COPYRIGHT BANNER ─── */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-mono-sacred">
              © {new Date().getFullYear()} ARCANA 3D Ltd. {dict.footer?.rightsReserved || "All rights reserved."}
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-[11px] text-slate-400">
              {dict.reader?.disclaimer || "Tarot is a mirror for personal reflection and discernment."}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Link href={`/${locale}`} className="hover:text-amber-300 transition-colors">
              {dict.footer?.privacyPolicy || "Privacy Policy"}
            </Link>
            <span>·</span>
            <Link href={`/${locale}`} className="hover:text-amber-300 transition-colors">
              {dict.footer?.termsOfService || "Terms of Service"}
            </Link>
            <span>·</span>
            <Link href={`/${locale}`} className="hover:text-amber-300 transition-colors">
              {dict.footer?.refundPolicy || "Refund Policy"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
