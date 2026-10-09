"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Globe,
  Monitor,
  Check,
  Music,
} from "lucide-react";
import { useSoundscape } from "@/lib/audio/useSoundscape";
import { AmbientSoundMode } from "@/lib/audio/soundscape";
import { Locale, ALL_LANGUAGES } from "@/types/tarot";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface SanctuarySettingsModalProps {
  locale: Locale;
  compact?: boolean;
  onToggle2D?: () => void;
  is2DActive?: boolean;
}

export function SanctuarySettingsModal({
  locale,
  compact = false,
  onToggle2D,
  is2DActive = false,
}: SanctuarySettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const dict = getDictionary(locale);

  const {
    isMuted,
    volume,
    ambientMode,
    isSfxEnabled,
    toggleMute,
    setVolume,
    setAmbientMode,
    toggleSfx,
    playButtonClick,
  } = useSoundscape();

  const ambientTones: { id: AmbientSoundMode; label: string; desc: string; hz: string }[] = [
    {
      id: "solfeggio",
      label: dict.settings?.toneSolfeggioLabel || "528Hz Solfeggio",
      desc: dict.settings?.toneSolfeggioDesc || "Miracle tone of renewal & heart expansion",
      hz: "528 Hz",
    },
    {
      id: "nebula",
      label: dict.settings?.toneNebulaLabel || "Celestial Nebula",
      desc: dict.settings?.toneNebulaDesc || "Deep cosmic drone for meditative grounding",
      hz: "Sub-harmonic",
    },
    {
      id: "temple_winds",
      label: dict.settings?.toneTempleLabel || "Temple Singing Bowls",
      desc: dict.settings?.toneTempleDesc || "Tibetan bowl harmonics with sacred breeze",
      hz: "432 Hz",
    },
  ];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const getLocaleUrl = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    const segments = pathname.split("/");
    // segments[0] is "", segments[1] is the current locale
    segments[1] = newLocale;
    return segments.join("/");
  };

  return (
    <div className="relative inline-flex items-center" ref={modalRef}>
      {/* Settings Trigger Gear Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          playButtonClick?.();
        }}
        aria-label={dict.settings?.title || "Sanctuary Settings"}
        title={dict.settings?.title || "Sanctuary Settings"}
        className={`group flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
          compact ? "w-8 h-8 p-1.5" : "w-9 h-9 p-2"
        } ${
          isOpen
            ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20"
            : "bg-black/60 hover:bg-neutral-900 border border-amber-500/30 hover:border-amber-400/70 text-slate-300 hover:text-amber-200"
        }`}
      >
        <Settings
          className={`w-4 h-4 transition-transform duration-500 ${
            isOpen ? "rotate-90 text-amber-300" : "group-hover:rotate-45"
          }`}
        />
      </button>

      {/* Settings Popover Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[380px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#0b0816]/95 backdrop-blur-2xl border border-amber-500/40 shadow-2xl shadow-purple-950/80 p-5 z-50 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-serif-sacred font-bold text-sm text-amber-100 tracking-wide">
                {dict.settings?.title || "Sanctuary Settings"}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
              aria-label="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            {/* SECTION 1: SOUNDSCAPE & AUDIO */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-sacred text-amber-300/90 uppercase tracking-widest flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>{dict.settings?.ambienceSection || "Sacred Ambience & Audio"}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`text-[10px] font-mono-sacred px-2.5 py-0.5 rounded-full border transition-all ${
                    !isMuted
                      ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                      : "bg-neutral-800/80 border-neutral-700 text-neutral-400"
                  }`}
                >
                  {!isMuted ? (dict.settings?.soundOn || "SOUND ON") : (dict.settings?.muted || "MUTED")}
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="bg-black/50 rounded-xl p-3 border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5 font-light">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{dict.settings?.masterVolume || "Master Volume"}</span>
                  </span>
                  <span className="font-mono-sacred text-[11px] text-amber-400">
                    {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  disabled={isMuted}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                />
              </div>

              {/* Ambient Frequency Tone Options */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-sacred text-slate-400 uppercase tracking-wider block">
                  {dict.settings?.harmonicToneMode || "Harmonic Tone Mode"}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {ambientTones.map((tone) => {
                    const isSelected = ambientMode === tone.id && !isMuted;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => {
                          setAmbientMode(tone.id);
                          if (isMuted) toggleMute();
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 text-amber-100 shadow-md shadow-amber-500/10"
                            : "bg-black/40 border-white/5 text-slate-300 hover:border-amber-500/30 hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <div className="font-serif-sacred font-bold text-xs flex items-center gap-1.5">
                            <span>{tone.label}</span>
                            <span className="text-[9px] font-mono-sacred px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                              {tone.hz}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-light">
                            {tone.desc}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SFX Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xs text-slate-300 font-light">
                  {dict.settings?.sfxLabel || "Card Shuffling & Flip SFX"}
                </span>
                <button
                  type="button"
                  onClick={toggleSfx}
                  className={`text-[10px] font-mono-sacred px-2.5 py-1 rounded-full border transition-all ${
                    isSfxEnabled
                      ? "bg-amber-500/20 border-amber-400/60 text-amber-300 font-bold"
                      : "bg-neutral-800 border-neutral-700 text-neutral-400"
                  }`}
                >
                  {isSfxEnabled ? (dict.settings?.sfxEnabled || "ENABLED") : (dict.settings?.sfxMuted || "MUTED")}
                </button>
              </div>
            </div>

            {/* SECTION 2: LANGUAGE / LOCALE */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-mono-sacred text-amber-300/90 uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{dict.settings?.languageSection || "Sacred Language"}</span>
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 max-h-40 overflow-y-auto">
                {ALL_LANGUAGES.map((item) => {
                  const isActive = locale === item.code;
                  return (
                    <Link
                      key={item.code}
                      href={getLocaleUrl(item.code)}
                      onClick={() => setIsOpen(false)}
                      className={`text-center py-1 px-1 rounded-lg text-[11px] font-mono-sacred truncate transition-all ${
                        isActive
                          ? "bg-amber-500/25 border border-amber-400/60 text-amber-200 font-bold shadow-md shadow-amber-500/20"
                          : "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                      }`}
                      title={`${item.nativeName} (${item.englishName})`}
                    >
                      {item.nativeName}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: 3D COSMOS VS 2D ACCESSIBLE (If supported on page) */}
            {onToggle2D && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-mono-sacred text-amber-300/90 uppercase tracking-widest flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>{dict.settings?.dimensionSection || "Visual Dimension"}</span>
                </span>
                <button
                  type="button"
                  onClick={onToggle2D}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/40 text-xs transition-all"
                >
                  <span className="text-slate-300 font-light">
                    {is2DActive
                      ? (dict.settings?.mode2DLabel || "2D Accessible Mode")
                      : (dict.settings?.mode3DLabel || "3D Celestial Cosmos")}
                  </span>
                  <span className="text-[10px] font-mono-sacred px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300">
                    {is2DActive
                      ? (dict.settings?.switchTo3D || "SWITCH TO 3D")
                      : (dict.settings?.switchTo2D || "SWITCH TO 2D")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
