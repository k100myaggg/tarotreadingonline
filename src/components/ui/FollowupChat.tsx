"use client";

import React, { useState } from "react";
import { useReadingStore, FollowupMessage } from "@/stores/useReadingStore";
import { getPersonaById, getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { getCardImagePath } from "@/lib/tarot/cardImages";
import { Locale } from "@/types/tarot";
import { Send, Sparkles, MessageCircle, AlertCircle, PlusCircle, CheckCircle2 } from "lucide-react";

interface FollowupChatProps {
  locale: Locale;
}

export function FollowupChat({ locale }: FollowupChatProps) {
  const {
    readingId,
    question,
    personaId,
    drawnCards,
    readingResponse,
    followups,
    followupInput,
    setFollowupInput,
    addFollowupMessage,
  } = useReadingStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guidanceCard, setGuidanceCard] = useState<any>(null);
  const [isDrawingGuidance, setIsDrawingGuidance] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when user clicks a suggested follow-up chip
  React.useEffect(() => {
    if (followupInput) {
      setInput(followupInput);
    }
  }, [followupInput]);

  const persona = getPersonaById(personaId);
  const personaName = persona ? persona.name[locale] || persona.name.en : "The Reader";

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userText = (typeof overrideText === "string" ? overrideText : input).trim();
    if (!userText || isLoading) return;

    setInput("");
    setFollowupInput("");
    setErrorMessage(null);

    const userMsg: FollowupMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    };
    addFollowupMessage(userMsg);

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 30000);

    const formattedCardsSummary = drawnCards
      .map((c) => {
        const cardInfo = getCardById(c.cardId);
        const cardName = cardInfo ? getCardDisplayName(cardInfo, locale) : c.cardId;
        return `${c.positionName}: ${cardName} (${c.isReversed ? "Reversed" : "Upright"})`;
      })
      .join(", ");

    try {
      setIsLoading(true);
      const res = await fetch("/api/reading/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          readingId,
          personaId,
          originalQuestion: question,
          drawnCardsSummary: formattedCardsSummary,
          synthesisSummary: readingResponse?.spreadSynthesis || "",
          conversationHistory: followups,
          userQuestion: userText,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get reader response");
      }

      if (data.isCrisis) {
        setErrorMessage("If you are in distress, please connect with a 24/7 crisis counselor at 988 or your local emergency line.");
        return;
      }

      const assistantMsg: FollowupMessage = {
        id: `ast_${Date.now()}`,
        role: "assistant",
        content: data.content,
        createdAt: data.createdAt,
      };
      addFollowupMessage(assistantMsg);
    } catch (err: any) {
      console.error("Follow-up error:", err);
      setErrorMessage(
        locale === "hi"
          ? "ओरेकल से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।"
          : "Unable to connect with the reader. Please try asking again."
      );
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleDrawGuidance = async () => {
    if (isDrawingGuidance) return;
    try {
      setIsDrawingGuidance(true);
      setErrorMessage(null);
      const existingIds = drawnCards.map((c) => c.cardId);
      if (guidanceCard) existingIds.push(guidanceCard.cardId);

      const res = await fetch("/api/reading/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingCardIds: existingIds,
          locale,
          personaId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to draw guidance card");
      }

      setGuidanceCard(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not draw guidance card");
    } finally {
      setIsDrawingGuidance(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mystic-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl mt-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-900/30">
        <div className="flex items-center gap-3">
          <div className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            {persona?.avatar || "🔮"}
          </div>
          <div>
            <h4 className="font-serif-sacred text-lg font-bold text-amber-200">
              Dialogue with {personaName}
            </h4>
            <p className="font-mono-sacred text-[11px] text-amber-400/70">
              Direct inquiry anchored in your spread ({Math.floor(followups.length / 2)}/5 questions asked)
            </p>
          </div>
        </div>

        {/* Guidance Card Draw Trigger */}
        <button
          type="button"
          disabled={isDrawingGuidance || Boolean(guidanceCard)}
          onClick={handleDrawGuidance}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-sacred transition-all ${
            guidanceCard
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-bold hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{guidanceCard ? "Guidance Drawn" : "Draw Guidance Card (1 Credit)"}</span>
        </button>
      </div>

      {/* Extra Guidance Card Callout */}
      {guidanceCard && (() => {
        const cardData = guidanceCard.card || guidanceCard;
        return (
          <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#140e2b] via-[#1a1236] to-[#140e2b] border border-amber-400/50 shadow-2xl animate-fade-in flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Real Tarot Card Image Artwork */}
            <div className="relative w-24 sm:w-28 aspect-[1/1.65] rounded-xl overflow-hidden border-2 border-amber-400/70 shadow-xl shadow-amber-500/25 shrink-0 bg-[#0e0a1f] group">
              <img
                src={getCardImagePath(cardData.cardId)}
                alt={cardData.cardName}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  cardData.isReversed ? "rotate-180" : ""
                }`}
              />
              <div className="absolute bottom-0 inset-x-0 p-1 bg-black/90 backdrop-blur-sm text-center border-t border-amber-500/30">
                <span className="font-serif-sacred text-[10px] font-bold text-amber-200 leading-tight block truncate">
                  {cardData.cardName}
                </span>
                <span className={`font-mono-sacred text-[8.5px] uppercase block font-semibold ${cardData.isReversed ? "text-purple-300" : "text-amber-300"}`}>
                  {cardData.isReversed ? "Reversed ↺" : "Upright ↑"}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h5 className="font-serif-sacred font-bold text-base text-amber-100">
                  Additional Oracle Guidance
                </h5>
                <span className="text-[9px] font-mono-sacred px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 uppercase">
                  Clarifying Beacon
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                {guidanceCard.interpretation}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Messages Stream */}
      <div className="space-y-4 my-6 max-h-[420px] overflow-y-auto pr-2">
        {followups.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs font-mono-sacred">
            ✦ Ask a question to delve deeper into your spread, or draw a clarifying card above ✦
          </div>
        )}

        {followups.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500/20 border border-amber-400/40 text-amber-100 rounded-br-none"
                  : "mystic-panel border border-white/10 text-slate-200 rounded-bl-none shadow-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono-sacred text-amber-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{personaName} is meditating upon your words...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
        <input
          id="followup-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder="Ask a clarifying question to the reader..."
          className="w-full bg-[#090714] border border-amber-500/30 rounded-xl px-4 py-3 pr-24 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs font-mono-sacred hover:bg-amber-400 disabled:opacity-40 transition-all flex items-center gap-1"
        >
          <span>Ask</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
