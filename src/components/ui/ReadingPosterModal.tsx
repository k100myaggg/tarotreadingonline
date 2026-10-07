"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { StructuredReadingResponse, DrawnCardData, Locale } from "@/types/tarot";
import { getCardById, getCardDisplayName } from "@/lib/tarot/data";
import { getCardImagePath } from "@/lib/tarot/cardImages";
import { useSoundscape } from "@/lib/audio/useSoundscape";
import {
  X,
  Download,
  Share2,
  Copy,
  Sparkles,
  Check,
  Smartphone,
  Square,
  Palette,
  Loader2,
} from "lucide-react";

interface ReadingPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: StructuredReadingResponse;
  drawnCards: DrawnCardData[];
  question?: string;
  locale?: Locale;
}

type PosterFormat = "story" | "square";
type PosterTheme = "gold" | "violet" | "emerald";

export function ReadingPosterModal({
  isOpen,
  onClose,
  reading,
  drawnCards,
  question,
  locale = "en",
}: ReadingPosterModalProps) {
  const { playButtonClick, playOracleChime } = useSoundscape();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [format, setFormat] = useState<PosterFormat>("story");
  const [theme, setTheme] = useState<PosterTheme>("gold");
  const [isGenerating, setIsGenerating] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  // Theme palettes
  const THEME_COLORS = {
    gold: {
      bgTop: "#080511",
      bgBottom: "#160b24",
      accent: "#d4af37",
      accentGlow: "#ffd700",
      textPrimary: "#fcf8eb",
      textMuted: "#c8bca6",
      boxBg: "rgba(25, 14, 40, 0.75)",
      border: "#d4af37",
    },
    violet: {
      bgTop: "#06030e",
      bgBottom: "#1f0933",
      accent: "#c084fc",
      accentGlow: "#e9d5ff",
      textPrimary: "#faf5ff",
      textMuted: "#d8b4fe",
      boxBg: "rgba(35, 10, 58, 0.75)",
      border: "#a855f7",
    },
    emerald: {
      bgTop: "#020908",
      bgBottom: "#06241c",
      accent: "#34d399",
      accentGlow: "#a7f3d0",
      textPrimary: "#f0fdf4",
      textMuted: "#86efac",
      boxBg: "rgba(6, 36, 28, 0.75)",
      border: "#10b981",
    },
  };

  // Helper to wrap text cleanly on Canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 6
  ): number => {
    const words = text.split(" ");
    let line = "";
    let linesDrawn = 0;
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        if (linesDrawn >= maxLines - 1) {
          ctx.fillText(line.trim() + "...", x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
        linesDrawn++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // Load an image safely into HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  };

  // Render the poster onto high-res canvas
  const renderPoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: Story is 1080 x 1920 (9:16), Square is 1080 x 1080 (1:1)
    const width = 1080;
    const height = format === "story" ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    const colors = THEME_COLORS[theme];

    // 1. Background Cosmic Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, colors.bgTop);
    bgGradient.addColorStop(0.5, "#0b0617");
    bgGradient.addColorStop(1, colors.bgBottom);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Stardust & Constellation Sparkles
    ctx.fillStyle = colors.accentGlow;
    for (let i = 0; i < 90; i++) {
      const sx = (Math.sin(i * 997) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 631) * 0.5 + 0.5) * height;
      const sRadius = (i % 3 === 0 ? 1.8 : 0.9) * (Math.sin(i) * 0.5 + 1);
      ctx.globalAlpha = 0.15 + (i % 5) * 0.12;
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. Ornate Double Gold Border Frame
    const pad = 44;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.accentGlow;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(pad + 10, pad + 10, width - (pad + 10) * 2, height - (pad + 10) * 2);
    ctx.globalAlpha = 1.0;

    // Corner Filigree Accents
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 24);
      ctx.stroke();

      ctx.fillStyle = colors.accentGlow;
      ctx.beginPath();
      ctx.arc(6, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(pad + 4, pad + 4, 0);
    drawCorner(width - pad - 4, pad + 4, Math.PI / 2);
    drawCorner(width - pad - 4, height - pad - 4, Math.PI);
    drawCorner(pad + 4, height - pad - 4, -Math.PI / 2);

    // 4. Header: Sacred Seal & Title
    ctx.textAlign = "center";
    ctx.fillStyle = colors.accent;
    ctx.font = "600 22px 'Cinzel', serif, Georgia";
    ctx.letterSpacing = "6px";
    ctx.fillText("✦  ARCANA SACRED ORACLE  ✦", width / 2, pad + 60);

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
    ctx.font = "400 15px 'Cinzel Decorative', monospace";
    ctx.fillStyle = colors.textMuted;
    ctx.letterSpacing = "3px";
    ctx.fillText(`DIVINE TRANSMISSION · ${dateStr}`, width / 2, pad + 95);

    // 5. Seeker's Inquiry (Quote Box)
    const inquiryText = question
      ? `"${question}"`
      : '"What deeper truth unfolds for my current path?"';

    ctx.fillStyle = colors.boxBg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;

    const qBoxY = pad + 125;
    const qBoxH = format === "story" ? 130 : 90;
    const qBoxW = width - 160;
    ctx.beginPath();
    ctx.roundRect((width - qBoxW) / 2, qBoxY, qBoxW, qBoxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "italic 400 24px 'Playfair Display', Georgia, serif";
    ctx.letterSpacing = "1px";
    wrapText(ctx, inquiryText, width / 2, qBoxY + (format === "story" ? 50 : 42), qBoxW - 60, 32, 2);

    // 6. Draw the Sacred Cards
    const cardsToDraw = drawnCards.slice(0, 3); // Top 3 cards
    const cardCount = cardsToDraw.length || 1;

    // Card sizes calibrated for layout
    const cardW = format === "story" ? (cardCount === 1 ? 400 : 250) : 210;
    const cardH = cardW * 1.68;
    const cardsTotalWidth = cardCount * cardW + (cardCount - 1) * 36;
    const startX = (width - cardsTotalWidth) / 2;
    const cardsY = format === "story" ? qBoxY + qBoxH + 45 : qBoxY + qBoxH + 28;

    // Load card images or draw styled backings
    for (let i = 0; i < cardCount; i++) {
      const drawnCard = cardsToDraw[i];
      const cardInfo = getCardById(drawnCard.cardId);
      const cardImagePath = getCardImagePath(drawnCard.cardId);
      const cx = startX + i * (cardW + 36);

      // Card shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;

      // Card background placeholder
      ctx.fillStyle = "#180d2b";
      ctx.beginPath();
      ctx.roundRect(cx, cardsY, cardW, cardH, 12);
      ctx.fill();
      ctx.restore();

      // Try loading actual high-res card artwork
      try {
        const img = await loadImage(cardImagePath);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cx, cardsY, cardW, cardH, 12);
        ctx.clip();

        // Handle reversal
        if (drawnCard.isReversed) {
          ctx.translate(cx + cardW / 2, cardsY + cardH / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
        } else {
          ctx.drawImage(img, cx, cardsY, cardW, cardH);
        }
        ctx.restore();
      } catch {
        // Fallback card graphic if image fails
        ctx.fillStyle = "#2a1645";
        ctx.beginPath();
        ctx.roundRect(cx, cardsY, cardW, cardH, 12);
        ctx.fill();

        ctx.fillStyle = colors.accent;
        ctx.font = "bold 20px serif";
        ctx.fillText(cardInfo?.name.en || drawnCard.cardId, cx + cardW / 2, cardsY + cardH / 2);
      }

      // Card Gold Foil Border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cx, cardsY, cardW, cardH, 12);
      ctx.stroke();

      // Badge below card (Position & Upright/Reversed)
      const badgeY = cardsY + cardH + 28;
      const cardName = cardInfo ? getCardDisplayName(cardInfo, locale) : drawnCard.cardId;
      const statusText = drawnCard.isReversed ? "REVERSED" : "UPRIGHT";
      const posName = drawnCard.positionName || `Position ${i + 1}`;

      ctx.fillStyle = colors.accent;
      ctx.font = "bold 16px 'Cinzel', serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText(cardName.toUpperCase(), cx + cardW / 2, badgeY);

      ctx.fillStyle = drawnCard.isReversed ? "#e879f9" : colors.accentGlow;
      ctx.font = "600 12px 'Cinzel', monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(`${posName.toUpperCase()} · ${statusText}`, cx + cardW / 2, badgeY + 22);
    }

    // 7. Oracle Key Synthesis / Actionable Wisdom
    const synthesisY = format === "story" ? cardsY + cardH + 90 : cardsY + cardH + 75;
    const synthBoxW = width - 150;
    const synthBoxH = format === "story" ? 420 : 230;

    ctx.fillStyle = colors.boxBg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect((width - synthBoxW) / 2, synthesisY, synthBoxW, synthBoxH, 18);
    ctx.fill();
    ctx.stroke();

    // Box Header
    ctx.fillStyle = colors.accent;
    ctx.font = "600 16px 'Cinzel', serif";
    ctx.letterSpacing = "4px";
    ctx.fillText(
      "✦ SACRED SYNTHESIS & GUIDANCE ✦",
      width / 2,
      synthesisY + 44
    );

    // Oracle Core Text (Synthesis or Actionable step)
    const coreAdvice =
      reading?.actionableStep ||
      reading?.spreadSynthesis ||
      "Trust the subtle currents revealed in this spread. What you seek is already seeking you.";

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "300 21px 'Playfair Display', Georgia, serif";
    ctx.letterSpacing = "0.5px";
    wrapText(
      ctx,
      coreAdvice,
      width / 2,
      synthesisY + 88,
      synthBoxW - 80,
      34,
      format === "story" ? 9 : 4
    );

    // 8. Footer: Brand & Website Watermark
    ctx.fillStyle = colors.accent;
    ctx.font = "500 14px 'Cinzel', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("WWW.TAROTREADINGONLINE.COM", width / 2, height - pad - 30);

    ctx.fillStyle = colors.textMuted;
    ctx.font = "300 12px 'Cinzel', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("SEEK YOUR TRUTH · SHARE THE LIGHT", width / 2, height - pad - 10);

    // Generate preview URL
    const url = canvas.toDataURL("image/png");
    setPreviewUrl(url);
    setIsGenerating(false);
  }, [format, theme, reading, drawnCards, question, locale]);

  useEffect(() => {
    if (isOpen) {
      renderPoster();
    }
  }, [isOpen, renderPoster]);

  if (!isOpen) return null;

  // Actions
  const handleDownload = () => {
    playButtonClick();
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `arcana-tarot-reading-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    playOracleChime();
  };

  const handleShare = async () => {
    playButtonClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "sacred-tarot-reading.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "My Tarot Reading · Arcana",
            text: `Here is the divine insight revealed in my tarot reading: "${question || "Arcana Oracle"}"`,
            files: [file],
          });
          playOracleChime();
        } else {
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  };

  const handleCopy = async () => {
    playButtonClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        playOracleChime();
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-amber-500/40 shadow-2xl shadow-black overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif-sacred text-base font-bold text-amber-200">
                Shareable Reading Poster
              </h3>
              <p className="font-mono-sacred text-[11px] text-amber-400/70">
                Instagram Stories · WhatsApp Status · Social Cards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live Canvas Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-4 border border-amber-500/20 relative min-h-[360px]">
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10 rounded-2xl">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                <span className="font-mono-sacred text-xs text-amber-200">
                  Rendering Sacred Poster...
                </span>
              </div>
            )}

            {/* Hidden High-Resolution Render Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scaled Preview Image */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Sacred Tarot Reading Poster"
                className={`rounded-xl shadow-2xl border border-amber-500/30 object-contain max-h-[58vh] ${
                  format === "story" ? "aspect-[9/16]" : "aspect-square"
                }`}
              />
            )}
          </div>

          {/* Right Column: Customization Controls & Actions */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Format Picker */}
              <div>
                <label className="text-xs font-mono-sacred text-amber-300 uppercase tracking-wider block mb-2">
                  Poster Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormat("story");
                      playButtonClick();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                      format === "story"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Story (9:16)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormat("square");
                      playButtonClick();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                      format === "square"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                    }`}
                  >
                    <Square className="w-4 h-4 text-amber-400" />
                    <span>Square (1:1)</span>
                  </button>
                </div>
              </div>

              {/* Theme Palette Picker */}
              <div>
                <label className="text-xs font-mono-sacred text-amber-300 uppercase tracking-wider block mb-2">
                  Sacred Aura Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "gold", label: "Solar Gold", border: "border-amber-400" },
                      { id: "violet", label: "Amethyst", border: "border-purple-400" },
                      { id: "emerald", label: "Emerald", border: "border-emerald-400" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        playButtonClick();
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                        theme === t.id
                          ? `bg-neutral-900 ${t.border} text-slate-100 shadow-md`
                          : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[11px]">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/80 leading-relaxed font-sans">
                💡 <strong>Tip:</strong> Stories look best on Instagram, WhatsApp & TikTok. Square format is ideal for Twitter/X posts and private messages.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-amber-900/40">
              {/* Primary Mobile Share */}
              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-serif-sacred font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share to Story / Socials</span>
                </button>
              )}

              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownload}
                className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif-sacred font-semibold uppercase tracking-wider transition-all ${
                  !canShare
                    ? "bg-amber-400 hover:bg-amber-300 text-neutral-950 border-amber-400 shadow-lg"
                    : "bg-neutral-900/80 hover:bg-neutral-800 border-amber-500/40 text-amber-200"
                }`}
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download High-Res PNG</span>
              </button>

              {/* Copy to Clipboard */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900/40 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-900/60 text-neutral-300 hover:text-amber-200 text-xs font-mono-sacred flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
