"use client";

import { useEffect, useState } from "react";
import { mysticAudio, SoundscapeState, AmbientSoundMode } from "./soundscape";

export function useSoundscape() {
  const [state, setState] = useState<SoundscapeState>(() => {
    if (typeof window !== "undefined" && mysticAudio.getState) {
      return mysticAudio.getState();
    }
    return {
      isMuted: true,
      volume: 0.65,
      isAmbientActive: false,
      ambientMode: "solfeggio",
      isSfxEnabled: true,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mysticAudio.subscribe) return;
    const unsub = mysticAudio.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  const toggleMute = () => mysticAudio.toggleMute();
  const setVolume = (v: number) => mysticAudio.setVolume(v);
  const setAmbientMode = (m: AmbientSoundMode) => mysticAudio.setAmbientMode(m);
  const toggleSfx = () => mysticAudio.toggleSfx();

  return {
    ...state,
    toggleMute,
    setVolume,
    setAmbientMode,
    toggleSfx,
    playCardShuffle: () => mysticAudio.playCardShuffle(),
    playCardDealCascade: () => mysticAudio.playCardDealCascade(),
    playCardSelect: () => mysticAudio.playCardSelect(),
    playCardFlip: () => mysticAudio.playCardFlip(),
    playOracleChime: () => mysticAudio.playOracleChime(),
    playButtonClick: () => mysticAudio.playButtonClick(),
  };
}
