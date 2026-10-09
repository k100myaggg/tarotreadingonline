"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StructuredReadingResponse, Locale } from "@/types/tarot";
import { getCardImagePath } from "@/lib/tarot/cardImages";
import { useReadingStore } from "@/stores/useReadingStore";
import { allSpreads } from "@/lib/tarot/data";
import { ReadingPosterModal } from "./ReadingPosterModal";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Heart,
  CheckCircle2,
  Share2,
  Image as ImageIcon,
  Star,
  Send,
  BookOpen,
} from "lucide-react";
import { PersonaAvatar } from "./PersonaAvatar";

interface ReadingStreamViewerProps {
  reading: StructuredReadingResponse | null;
  rawStreamText: string;
  isStreaming: boolean;
  crisisData?: any;
  locale: Locale;
  onSelectFollowup?: (question: string) => void;
  followupChatNode?: React.ReactNode;
}

export function ReadingStreamViewer({
  reading,
  rawStreamText,
  isStreaming,
  crisisData,
  locale,
  onSelectFollowup,
  followupChatNode,
}: ReadingStreamViewerProps) {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const { drawnCards, question, personaId, setSpreadId, setStep, resetReading } = useReadingStore();

  // 5-Star Rating State
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // If crisis detected, show supportive redirect
  if (crisisData) {
    const msg = crisisData.message?.[locale] || crisisData.message?.en;
    return (
      <div className="w-full max-w-4xl mx-auto mystic-panel p-8 rounded-2xl border border-rose-500/50 shadow-2xl my-8">
        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <Heart className="w-7 h-7 animate-pulse" />
          <h3 className="font-serif-sacred text-2xl font-bold text-rose-200">
            You Are Not Alone
          </h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-6 font-light">
          {msg}
        </p>
        <div className="p-4 rounded-xl bg-black/50 border border-rose-900/40 space-y-2">
          <h4 className="font-mono-sacred text-xs text-rose-300 uppercase tracking-wider">
            Confidential 24/7 Helplines:
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 font-mono-sacred">
            {crisisData.helplines?.map((hl: any, i: number) => (
              <li key={i} className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">{hl.region}:</span>
                <span className="text-amber-300 font-semibold">{hl.contact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating > 0) {
      setIsRatingSubmitted(true);
    }
  };

  const overallText = reading?.overallAnalysis || reading?.spreadSynthesis || "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 my-8">
      {/* ─── 1. STREAMING / SYNTHESIS STATUS BANNER ─── */}
      <div className="mystic-panel rounded-2xl p-6 border border-amber-500/30 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <PersonaAvatar personaId={personaId || "sage"} size="md" />
          <div>
            <h3 className="font-serif-sacred text-lg font-bold text-amber-200">
              {reading?.readerPersona || "The Oracle Voice"}
            </h3>
            <p className="font-mono-sacred text-[11px] text-amber-400/70">
              {isStreaming ? "TRANSCRIBING SACRED CURRENTS & CELESTIAL GUIDANCE..." : "SYNTHESIS MANIFESTED"}
            </p>
          </div>
        </div>

        {isStreaming ? (
          <div className="flex items-center gap-2 text-xs font-mono-sacred text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Streaming</span>
          </div>
        ) : reading ? (
          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-400/30 border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif-sacred font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Share Poster</span>
          </button>
        ) : null}
      </div>

      {/* ─── 2. COMPREHENSIVE OVERALL READING ANALYSIS (TOP POSITIONED) ─── */}
      {overallText && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-9 border border-amber-500/35 shadow-2xl space-y-4 bg-gradient-to-b from-[#140c26]/90 via-[#0a0715]/95 to-[#06040d]/95 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="font-serif-sacred text-xl sm:text-2xl font-bold text-amber-100 tracking-wide">
                {locale === "hi" ? "सम्पूर्ण विश्लेषण (Overall Analysis)" : "Overall Reading Analysis"}
              </h4>
            </div>
            <span className="font-mono-sacred text-[10px] px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-widest shadow-sm">
              ✦ Deep Synthesis ✦
            </span>
          </div>

          <div className="font-serif-sacred text-sm sm:text-base text-amber-100/95 leading-relaxed sm:leading-loose whitespace-pre-line font-normal space-y-3">
            {overallText}
          </div>
        </div>
      )}

      {/* ─── 3. INDIVIDUAL CARD BREAKDOWN (POSITIONED DIRECTLY BELOW OVERALL ANALYSIS) ─── */}
      {reading?.cards && reading.cards.length > 0 && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <h4 className="font-serif-sacred text-lg sm:text-xl font-bold text-amber-200">
              {locale === "hi" ? "कार्ड-वार विस्तृत विवेचन" : "Individual Card Illuminations"}
            </h4>
            <span className="text-xs font-mono-sacred text-slate-400">
              ({reading.cards.length} {reading.cards.length === 1 ? "Card" : "Cards"})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {reading.cards.map((c, i) => (
              <div
                key={i}
                className="mystic-panel rounded-xl p-5 sm:p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-lg flex flex-col sm:flex-row gap-5 items-start bg-black/40"
              >
                {c.cardId && (
                  <div className="relative w-24 sm:w-28 aspect-[1/1.65] rounded-lg overflow-hidden border border-amber-400/60 shadow-lg shadow-amber-500/20 shrink-0 bg-[#0e0a1f] self-center sm:self-start">
                    <img
                      src={getCardImagePath(c.cardId)}
                      alt={c.cardName}
                      className={`w-full h-full object-cover transition-transform ${
                        c.orientation === "reversed" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-sacred text-xs px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        {c.positionName}
                      </span>
                      <h5 className="font-serif-sacred font-bold text-lg text-amber-100">
                        {c.cardName}
                      </h5>
                    </div>
                    <span
                      className={`font-mono-sacred text-xs px-2 py-0.5 rounded uppercase ${
                        c.orientation === "reversed"
                          ? "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                          : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {c.orientation === "reversed" ? "Reversed ↺" : "Upright ↑"}
                    </span>
                  </div>

                  <p className="text-xs font-mono-sacred text-amber-300/90 mb-3 italic">
                    Essence: {c.coreEssence}
                  </p>

                  <div className="text-sm text-slate-200/90 leading-relaxed mb-4 whitespace-pre-line space-y-2">
                    {c.contextualMeaning}
                  </div>

                  {c.advice && (
                    <div className="pt-3 border-t border-white/5 text-xs text-slate-400 font-serif-sacred flex items-start gap-2">
                      <span className="text-amber-400">✦ Contemplation:</span>
                      <span>{c.advice}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. PRACTICAL ACTION ANCHOR ─── */}
      {reading?.actionableStep && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-purple-950/50 border border-amber-400/40 shadow-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-serif-sacred font-bold text-base text-amber-100 mb-1">
              {locale === "hi" ? "व्यावहारिक कर्म संकेत (Action Anchor)" : "Practical Action Anchor"}
            </h5>
            <p className="text-sm text-slate-300 leading-relaxed">
              {reading.actionableStep}
            </p>
          </div>
        </div>
      )}

      {/* ─── 5. GO DEEPER: CLICKABLE FOLLOW-UP QUESTIONS ─── */}
      {reading?.followUpSuggestions && reading.followUpSuggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h5 className="font-mono-sacred text-xs text-amber-300/80 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{locale === "hi" ? "गहराई में जाएं (Go deeper into this reading)" : "Go deeper into this reading"}</span>
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reading.followUpSuggestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectFollowup && onSelectFollowup(q)}
                className="text-left p-3.5 rounded-xl mystic-panel border border-amber-900/40 hover:border-amber-400/60 hover:bg-white/5 transition-all text-xs text-slate-300 hover:text-amber-200 flex flex-col justify-between group"
              >
                <span className="leading-snug">{q}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-sacred text-amber-400 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>Ask this</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5b. DIALOGUE WITH PERSONA (FOLLOW-UP CHAT DIRECTLY UNDER SUGGESTIONS) ─── */}
      {reading && !isStreaming && followupChatNode && (
        <div className="pt-2">
          {followupChatNode}
        </div>
      )}

      {/* ─── 6. YOUR READING IS SAVED / STORY POSTER ─── */}
      {reading && !isStreaming && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-7 border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-serif-sacred font-bold text-base text-amber-100 flex items-center gap-2">
                <span>{locale === "hi" ? "आपकी रीडिंग सुरक्षित है" : "Your reading is saved"}</span>
                <span className="text-[10px] font-mono-sacred px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold uppercase">
                  Story Ready
                </span>
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Download an illuminated Instagram Story or WhatsApp status poster of your reading.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPosterModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-serif-sacred font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Download & Save as Image</span>
          </button>
        </div>
      )}

      {/* ─── 7. HOW WAS YOUR READING? (5-STAR RATING & FEEDBACK WIDGET) ─── */}
      {reading && !isStreaming && (
        <div className="mystic-panel rounded-2xl p-6 sm:p-7 border border-amber-500/25 text-center space-y-4 bg-black/50">
          <h5 className="font-serif-sacred text-lg sm:text-xl font-bold text-amber-100">
            {locale === "hi" ? "आपकी रीडिंग कैसी रही?" : "How was your reading?"}
          </h5>
          <p className="text-xs text-slate-400 font-light max-w-md mx-auto">
            {locale === "hi"
              ? "आपका अनुभव हमारे ओरेकल की सटीकता और मार्गदर्शन को बेहतर बनाता है।"
              : "Help us refine our sacred oracle. Rate your reading and leave your reflections."}
          </p>

          {isRatingSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-serif-sacred animate-in fade-in">
              ✦ Thank you, seeker! Your sacred feedback has been recorded in the cosmos. ✦
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Star Rating Buttons */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(star)}
                    className="p-1 hover:scale-125 transition-transform focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        (hoverRating || userRating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "text-slate-600 hover:text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Input */}
              <div className="relative">
                <textarea
                  rows={2}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder={
                    locale === "hi"
                      ? "अपने विचार लिखें (वैकल्पिक)..."
                      : "Share your thoughts or reflection (optional)..."
                  }
                  className="w-full bg-[#080512] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={userRating === 0}
                className="px-6 py-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-200 font-mono-sacred text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 mx-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* ─── 8. EXPLORE OUR OTHER READINGS ─── */}
      {reading && !isStreaming && (
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="text-center">
            <h5 className="font-serif-sacred text-xl sm:text-2xl font-bold text-amber-100 flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>{locale === "hi" ? "अन्य पवित्र रीडिंग खोजें" : "Explore Our Other Readings"}</span>
            </h5>
            <p className="text-xs text-slate-400 mt-1">
              {locale === "hi"
                ? "जीवन के विभिन्न पहलुओं पर दिव्य अंतर्दृष्टि के लिए समर्पित रीडिंग रूम चुनें।"
                : "Select another dedicated sacred reading room to consult the cards on different life facets."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                href: `/${locale}/yes-or-no-tarot`,
                badge: "1 Card · Instant",
                title: locale === "hi" ? "हाँ या ना टैरो" : "Yes/No Reading",
                desc: locale === "hi" ? "त्वरित निर्णायक उत्तर" : "Instant decisive verdict",
              },
              {
                href: `/${locale}/love-tarot-reading`,
                badge: "3 Cards · Romance",
                title: locale === "hi" ? "प्रेम और संबंध" : "Love Reading",
                desc: locale === "hi" ? "दिल की सच्चाई और भविष्य" : "Heart dynamics & romance",
              },
              {
                href: `/${locale}/career-tarot-reading`,
                badge: "3 Cards · Wealth",
                title: locale === "hi" ? "करियर व उद्देश्य" : "Career & Purpose",
                desc: locale === "hi" ? "कार्यक्षेत्र व आर्थिक दिशा" : "Work, wealth & calling",
              },
              {
                href: `/${locale}/card-of-the-day`,
                badge: "1 Card · Daily",
                title: locale === "hi" ? "दिन का कार्ड" : "Card of the Day",
                desc: locale === "hi" ? "दैनिक मार्गदर्शन व ध्यान" : "Daily guiding archetype",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  resetReading();
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                className="p-4 rounded-xl mystic-panel border border-amber-900/40 hover:border-amber-400/60 hover:scale-[1.02] transition-all text-left flex flex-col justify-between group bg-black/40 shadow-lg"
              >
                <div>
                  <span className="font-mono-sacred text-[10px] text-amber-400 block mb-1">
                    ✦ {item.badge}
                  </span>
                  <h6 className="font-serif-sacred font-bold text-sm text-amber-100 group-hover:text-amber-200">
                    {item.title}
                  </h6>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-mono-sacred text-amber-400/80 group-hover:text-amber-300">
                  <span>Enter Room</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Poster Generation Modal */}
      {reading && (
        <ReadingPosterModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          reading={reading}
          drawnCards={drawnCards}
          question={question}
          locale={locale}
        />
      )}
    </div>
  );
}
