"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSoundscape } from "@/lib/audio/useSoundscape";
import { AmbientSoundMode } from "@/lib/audio/soundscape";
import { Volume2, VolumeX, Music, Sparkles, Sliders, Check } from "lucide-react";

interface MysticAudioPlayerProps {
  compact?: boolean;
}

const AMBIENT_MODES: { id: AmbientSoundMode; label: string; desc: string; hz: string }[] = [
  {
    id: "solfeggio",
    label: "528Hz Solfeggio",
    desc: "Miracle tone of renewal & heart expansion",
    hz: "528 Hz",
  },
  {
    id: "nebula",
    label: "Celestial Nebula",
    desc: "Deep cosmic drone for meditative grounding",
    hz: "Sub-harmonic",
  },
  {
    id: "temple_winds",
    label: "Temple Singing Bowls",
    desc: "Tibetan bowl harmonics with sacred breeze",
    hz: "432 Hz",
  },
];

export function MysticAudioPlayer({ compact = false }: MysticAudioPlayerProps) {
  const {
    isMuted,
    volume,
    isAmbientActive,
    ambientMode,
    isSfxEnabled,
    toggleMute,
    setVolume,
    setAmbientMode,
    toggleSfx,
    playButtonClick,
  } = useSoundscape();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const handleToggle = () => {
    toggleMute();
    playButtonClick();
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* Main Pill Button */}
      <div className="flex items-center rounded-full bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 p-1 shadow-lg shadow-black/40 hover:border-amber-400/60 transition-all">
        <button
          onClick={handleToggle}
          type="button"
          aria-label={isMuted ? "Unmute Ambiance" : "Mute Ambiance"}
          title={isMuted ? "Unmute Ambiance" : "Mute Ambiance"}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-mono-sacred transition-all ${
            !isMuted
              ? "text-amber-300 bg-amber-500/15"
              : "text-neutral-400 hover:text-amber-200"
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
          )}

          {/* Equalizer Wave Bars (Animates when unmuted) */}
          <div className="flex items-center gap-0.5 h-3 px-1">
            <span
              className={`w-0.5 rounded-full bg-amber-400 transition-all ${
                !isMuted
                  ? "h-3 animate-[pulse_0.8s_ease-in-out_infinite]"
                  : "h-1 bg-neutral-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-amber-300 transition-all ${
                !isMuted
                  ? "h-2 animate-[pulse_1.1s_ease-in-out_infinite_0.2s]"
                  : "h-1 bg-neutral-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-amber-400 transition-all ${
                !isMuted
                  ? "h-3.5 animate-[pulse_0.9s_ease-in-out_infinite_0.4s]"
                  : "h-1 bg-neutral-600"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-amber-200 transition-all ${
                !isMuted
                  ? "h-2 animate-[pulse_1.3s_ease-in-out_infinite_0.1s]"
                  : "h-1 bg-neutral-600"
              }`}
            />
          </div>

          {!compact && (
            <span className="hidden sm:inline font-sans text-[11px] font-medium tracking-wide">
              {isMuted ? "Sound Off" : "Ambiance"}
            </span>
          )}
        </button>

        {/* Dropdown Toggle Cog / Slider button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            playButtonClick();
          }}
          type="button"
          aria-label="Sound Settings"
          title="Soundscape Settings"
          className={`p-1.5 rounded-full transition-colors ${
            isOpen
              ? "text-amber-300 bg-amber-500/20"
              : "text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Settings Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-amber-500/30 p-4 shadow-2xl shadow-black/80 z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif-sacred text-sm font-semibold text-amber-200 tracking-wider">
                Sacred Soundscape
              </h3>
            </div>
            <span className="text-[10px] font-mono-sacred text-amber-400/70 border border-amber-500/20 px-1.5 py-0.5 rounded">
              WebAudio 432/528Hz
            </span>
          </div>

          {/* Master Volume Slider */}
          <div className="py-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">Master Volume</span>
              <span className="font-mono text-amber-400 text-[11px]">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Ambient Frequency Modes */}
          <div className="py-2">
            <div className="text-[11px] font-mono-sacred uppercase tracking-wider text-neutral-400 mb-2">
              Harmonic Frequency
            </div>
            <div className="space-y-1.5">
              {AMBIENT_MODES.map((mode) => {
                const isSelected = ambientMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setAmbientMode(mode.id);
                      playButtonClick();
                    }}
                    type="button"
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between border ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400/50 text-amber-200"
                        : "bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/60 text-neutral-300 hover:border-amber-900/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {mode.label}
                        <span className="text-[10px] text-amber-400/80 font-mono">
                          ({mode.hz})
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                        {mode.desc}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SFX Toggle */}
          <div className="pt-3 mt-2 border-t border-amber-900/40 flex items-center justify-between text-xs">
            <div>
              <div className="text-neutral-200 font-medium">Tactile Sound Effects</div>
              <div className="text-[10px] text-neutral-400">Card flips, singing bowls & shuffles</div>
            </div>
            <button
              onClick={() => {
                toggleSfx();
                playButtonClick();
              }}
              type="button"
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                isSfxEnabled ? "bg-amber-500" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${
                  isSfxEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
