import React from "react";
import Link from "next/link";
import { Sparkles, Moon, Layers, ShieldCheck, Compass, ArrowRight, Dna, Cpu, Eye } from "lucide-react";
import { Locale } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { allSpreads, allPersonas } from "@/lib/tarot/data";
import { ChooseYourReadingSection } from "@/components/ui/ChooseYourReadingSection";
import { PersonaAvatar } from "@/components/ui/PersonaAvatar";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const dict = getDictionary(activeLocale);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle glowing halo banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-sacred mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{dict.hero.tagline}</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif-sacred text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500/80 max-w-4xl leading-[1.15] mb-6">
          {dict.hero.headline}
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-slate-300 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-10">
          {dict.hero.subheading}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href={`/${activeLocale}/reading`}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-semibold font-serif-sacred text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <span>{dict.hero.cta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href={`/${activeLocale}/daily`}
            className="w-full sm:w-auto px-6 py-4 rounded-xl mystic-panel hover:bg-white/5 border border-amber-500/30 text-amber-200 font-medium text-base hover:border-amber-400/60 transition-all flex items-center justify-center gap-2.5"
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>{dict.hero.dailyCta}</span>
          </Link>
        </div>

        {/* Free First Reading Highlight */}
        <p className="mt-4 text-xs font-mono-sacred text-amber-400/70">
          ✦ {dict.readingForm.freeGuestNotice}
        </p>

        {/* 3D Visual Teaser Card Graphic */}
        <div className="mt-16 w-full max-w-3xl p-1 rounded-2xl bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent">
          <div className="rounded-2xl mystic-panel p-6 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-400/10">
                <Layers className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-200 shadow-xl shadow-amber-400/25 ring-2 ring-amber-400/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-400/10">
                <Moon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif-sacred text-xl sm:text-2xl text-amber-200 mb-2">
              {dict.physics3d?.title || "Three-Dimensional Card Physics & Sound"}
            </h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              {dict.physics3d?.desc || "Cards float in a volumetric orbital field. Shuffle, inspect holographic card backs, select cards with real-time feedback, and watch them flip on a sacred velvet spread."}
            </p>
          </div>
        </div>
      </section>

      {/* Choose your Reading Showcase (Matching competitor layout with dedicated URLs) */}
      <ChooseYourReadingSection locale={activeLocale} />

      {/* Spreads Showcase Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-amber-900/20">
        <div className="text-center mb-12">
          <h2 className="font-serif-sacred text-2xl sm:text-4xl text-amber-100 font-bold mb-3">
            {dict.spreadsSection?.title || "Sacred Spread Geometries"}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            {dict.spreadsSection?.desc || "Choose the layout that mirrors the nature of your current life crossroads."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allSpreads.map((spread) => (
            <div
              key={spread.id}
              className="mystic-panel rounded-xl p-6 border border-amber-500/20 hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {spread.cardCount === 1
                      ? (dict.spreadsSection?.cardSingular || "1 CARD")
                      : `${spread.cardCount} ${dict.spreadsSection?.cardPlural || "CARDS"}`}
                  </span>
                  <span className="font-mono-sacred text-[11px] text-slate-400">
                    {spread.creditCost === 0
                      ? (dict.spreadsSection?.freeBadge || "FREE")
                      : `${spread.creditCost} ${dict.spreadsSection?.creditsBadge || "CREDITS"}`}
                  </span>
                </div>
                <h3 className="font-serif-sacred text-lg font-bold text-amber-200 mb-2">
                  {(dict as any).spreads?.[spread.id]?.name || spread.name[activeLocale] || spread.name.en}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(dict as any).spreads?.[spread.id]?.desc || spread.description[activeLocale] || spread.description.en}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <Link
                  href={`/${activeLocale}/reading?spread=${spread.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono-sacred text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>{dict.spreadsSection?.selectSpread || "Select Spread"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reader Personas Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-amber-900/20">
        <div className="text-center mb-12">
          <h2 className="font-serif-sacred text-2xl sm:text-4xl text-amber-100 font-bold mb-3">
            {dict.personasSection?.title || "Three Sovereign Reader Voices"}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            {dict.personasSection?.desc || "The same spread resonates differently depending on the reader you choose. Select a guide whose energy matches your soul's readiness."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allPersonas.map((persona) => (
            <div
              key={persona.id}
              className="mystic-panel rounded-2xl p-7 border border-amber-500/20 relative group hover:border-amber-400/60 transition-all"
            >
              <PersonaAvatar personaId={persona.id} size="lg" className="mb-4" />
              <h3 className="font-serif-sacred text-xl font-bold text-amber-200 mb-1">
                {(dict as any).personas?.[persona.id]?.name || persona.name[activeLocale] || persona.name.en}
              </h3>
              <p className="font-mono-sacred text-xs text-amber-400/80 mb-3 tracking-wide">
                {(dict as any).personas?.[persona.id]?.title || persona.title[activeLocale] || persona.title.en}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {(dict as any).personas?.[persona.id]?.desc || persona.description[activeLocale] || persona.description.en}
              </p>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono-sacred text-slate-400 italic">
                {dict.personasSection?.toneLabel || "Tone"}: {persona.tone}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophical Foundations & Security Highlights */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-amber-900/20 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto sm:mx-0">
              <Dna className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-serif-sacred text-base font-bold text-amber-200">
              {dict.foundations?.randomTitle || "Cryptographic Randomness"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dict.foundations?.randomDesc || "Every card draw uses server-side CSPRNG with rejection sampling. The AI model is never allowed to pick cards."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto sm:mx-0">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-serif-sacred text-base font-bold text-amber-200">
              {dict.foundations?.streamTitle || "Streamed Synthesis"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dict.foundations?.streamDesc || "Sub-second response streaming brings your reader's interpretation to life without long loading screens."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-serif-sacred text-base font-bold text-amber-200">
              {dict.foundations?.ethicsTitle || "Ethical Reflection Mirror"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dict.foundations?.ethicsDesc || "Grounding in personal autonomy and discernment. Zero fatalism or fabricated certainty."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
