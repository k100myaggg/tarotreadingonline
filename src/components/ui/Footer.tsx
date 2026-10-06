import React from "react";
import Link from "next/link";
import { Sparkles, Shield, HeartHandshake, Eye } from "lucide-react";
import { Locale } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="w-full mystic-panel border-t border-amber-900/30 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-serif-sacred text-base font-bold text-amber-200">
                {dict.nav.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging the 1909 Pamela Colman Smith hermetic archetypes with modern sovereign artificial intelligence.
            </p>
            <div className="pt-2 text-[11px] font-mono-sacred text-amber-400/70">
              PUBLIC DOMAIN RWS (1909) ARCHIVE
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-mono-sacred text-xs text-amber-300 uppercase tracking-wider">
              Sacred Portals
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
              Ethical AI Oracle
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>The LLM never picks cards; random draws are cryptographically certified.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>No absolute fortune-telling or deterministic medical/legal claims.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400/80">•</span>
                <span>Self-harm and crisis inquiries are met with compassion and immediate helpline guidance.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Crisis Support Resources */}
          <div className="space-y-2">
            <h4 className="font-mono-sacred text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              Support & Care
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you or someone you know is in crisis, please connect with confidential support:
            </p>
            <div className="text-[11px] font-mono-sacred space-y-1 text-slate-300">
              <p>US / Canada: <span className="text-amber-300">Call/Text 988</span></p>
              <p>India: <span className="text-amber-300">Vandrevala (+91 9999 666 555)</span></p>
              <p>Japan: <span className="text-amber-300">TELL Japan (03-5774-0992)</span></p>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center sm:text-left">
            {dict.reader.disclaimer}
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono-sacred text-slate-400">
            <span>© {new Date().getFullYear()} ARCANA 3D</span>
            <span>•</span>
            <span className="text-amber-400/80">AUTHENTIC TAROT AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
