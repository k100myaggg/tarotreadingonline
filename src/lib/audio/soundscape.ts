"use client";

/**
 * Mystical Soundscape & Sacred Synthesis Engine
 * 
 * Powered 100% natively by Web Audio API:
 * - Zero external assets or bandwidth overhead
 * - Real-time algorithmic synthesis (Tibetan Singing Bowls, 528Hz Solfeggio drone, Card Shuffles)
 * - Zero clicks, pop-free exponential gain ramping
 * - Seamless background persistence with localStorage memory
 */

export type AmbientSoundMode = "solfeggio" | "nebula" | "temple_winds";

export interface SoundscapeState {
  isMuted: boolean;
  volume: number;          // 0 to 1
  isAmbientActive: boolean;
  ambientMode: AmbientSoundMode;
  isSfxEnabled: boolean;
}

class MysticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Active ambient oscillator references
  private ambientNodes: {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    filters: BiquadFilterNode[];
    noiseSource?: AudioNode;
    intervalId?: NodeJS.Timeout;
  } | null = null;

  private state: SoundscapeState = {
    isMuted: true, // Default muted until user interacts or unmuts
    volume: 0.65,
    isAmbientActive: false,
    ambientMode: "solfeggio",
    isSfxEnabled: true,
  };

  private listeners: Set<(state: SoundscapeState) => void> = new Set();
  private isUnlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadSettings();
      // Setup auto-unlock on first user gesture
      const unlock = () => {
        this.unlockContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  private loadSettings() {
    try {
      const savedMuted = localStorage.getItem("tarot_audio_muted");
      const savedVol = localStorage.getItem("tarot_audio_volume");
      const savedMode = localStorage.getItem("tarot_audio_mode") as AmbientSoundMode;
      const savedSfx = localStorage.getItem("tarot_audio_sfx");

      if (savedMuted !== null) this.state.isMuted = savedMuted === "true";
      if (savedVol !== null) this.state.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      if (savedMode && ["solfeggio", "nebula", "temple_winds"].includes(savedMode)) {
        this.state.ambientMode = savedMode;
      }
      if (savedSfx !== null) this.state.isSfxEnabled = savedSfx === "true";
    } catch {
      // Ignore localStorage errors
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem("tarot_audio_muted", String(this.state.isMuted));
      localStorage.setItem("tarot_audio_volume", String(this.state.volume));
      localStorage.setItem("tarot_audio_mode", this.state.ambientMode);
      localStorage.setItem("tarot_audio_sfx", String(this.state.isSfxEnabled));
    } catch {
      // Ignore
    }
    this.notify();
  }

  public subscribe(fn: (state: SoundscapeState) => void) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((fn) => fn(s));
  }

  public getState(): SoundscapeState {
    return { ...this.state };
  }

  /**
   * Initializes or unlocks Web Audio Context
   */
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.isMuted ? 0 : this.state.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  private unlockContext() {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx && ctx.state === "running") {
      this.isUnlocked = true;
      if (!this.state.isMuted && !this.state.isAmbientActive) {
        this.startAmbient();
      }
    }
  }

  // ==========================================
  // MASTER CONTROLS
  // ==========================================

  public toggleMute(): boolean {
    const ctx = this.getContext();
    const nextMuted = !this.state.isMuted;
    this.state.isMuted = nextMuted;

    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      if (nextMuted) {
        this.masterGain.gain.setTargetAtTime(0, now, 0.08);
      } else {
        this.masterGain.gain.setTargetAtTime(this.state.volume, now, 0.15);
        if (!this.state.isAmbientActive) {
          this.startAmbient();
        }
      }
    }

    this.saveSettings();
    return !nextMuted;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    const ctx = this.getContext();
    if (ctx && this.masterGain && !this.state.isMuted) {
      this.masterGain.gain.setTargetAtTime(clamped, ctx.currentTime, 0.05);
    }
    this.saveSettings();
  }

  public setAmbientMode(mode: AmbientSoundMode) {
    if (this.state.ambientMode === mode) return;
    this.state.ambientMode = mode;
    this.saveSettings();
    if (this.state.isAmbientActive) {
      this.stopAmbient();
      this.startAmbient();
    }
  }

  public toggleSfx(): boolean {
    this.state.isSfxEnabled = !this.state.isSfxEnabled;
    this.saveSettings();
    return this.state.isSfxEnabled;
  }

  // ==========================================
  // AMBIENT SACRED DRONE SYNTHESIS
  // ==========================================

  public startAmbient() {
    const ctx = this.getContext();
    if (!ctx || this.ambientNodes) return;

    this.stopAmbient(); // Cleanup any residue

    const now = ctx.currentTime;
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    const filters: BiquadFilterNode[] = [];

    if (this.state.ambientMode === "solfeggio") {
      // 528 Hz Sacred Miracle Tone + harmonic undertones (132 Hz, 264 Hz, 396 Hz)
      const freqs = [132, 264, 396, 528, 792];
      const masterAmb = ctx.createGain();
      masterAmb.gain.setValueAtTime(0.001, now);
      masterAmb.gain.exponentialRampToValueAtTime(0.28, now + 3.0); // smooth 3s fade-in
      masterAmb.connect(this.ambientGain!);

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc.type = idx === 0 ? "sine" : idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, now);

        // Subtle detuning for lush, warm binaural shimmer
        osc.detune.setValueAtTime((idx - 2) * 3.5, now);

        // Lower volumes for higher harmonics
        const relGain = 0.4 / (idx + 1);
        g.gain.setValueAtTime(relGain, now);

        if (panner) {
          panner.pan.setValueAtTime((idx % 2 === 0 ? -1 : 1) * 0.35, now);
          osc.connect(g).connect(panner).connect(masterAmb);
        } else {
          osc.connect(g).connect(masterAmb);
        }

        osc.start(now);
        oscillators.push(osc);
        gains.push(g);
      });

      gains.push(masterAmb);
    } else if (this.state.ambientMode === "nebula") {
      // Deep Cosmic Nebula Pad (sub-bass, dark lowpass filter breathing, celestial reverb feel)
      const freqs = [73.42, 110, 146.83, 220]; // D2, A2, D3, A3
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(2.5, now);

      const masterAmb = ctx.createGain();
      masterAmb.gain.setValueAtTime(0.001, now);
      masterAmb.gain.exponentialRampToValueAtTime(0.35, now + 3.5);
      masterAmb.connect(filter).connect(this.ambientGain!);

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, now);
        osc.detune.setValueAtTime((idx % 2 === 0 ? 5 : -5), now);
        g.gain.setValueAtTime(0.15 / (idx + 1), now);

        osc.connect(g).connect(masterAmb);
        osc.start(now);
        oscillators.push(osc);
        gains.push(g);
      });

      filters.push(filter);
      gains.push(masterAmb);
    } else {
      // Temple Winds & Tibetan Singing Bowl resonance
      const freqs = [108, 216, 432, 648];
      const masterAmb = ctx.createGain();
      masterAmb.gain.setValueAtTime(0.001, now);
      masterAmb.gain.exponentialRampToValueAtTime(0.3, now + 2.5);
      masterAmb.connect(this.ambientGain!);

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.3 / (idx + 1), now);

        osc.connect(g).connect(masterAmb);
        osc.start(now);
        oscillators.push(osc);
        gains.push(g);
      });

      gains.push(masterAmb);
    }

    this.ambientNodes = { oscillators, gains, filters };
    this.state.isAmbientActive = true;
    this.notify();
  }

  public stopAmbient() {
    if (!this.ambientNodes || !this.ctx) {
      this.state.isAmbientActive = false;
      this.notify();
      return;
    }

    const { oscillators, gains } = this.ambientNodes;
    const now = this.ctx.currentTime;

    // Smooth 1.5s fade out
    gains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      } catch {
        // Ignore
      }
    });

    setTimeout(() => {
      oscillators.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Ignore
        }
      });
      this.ambientNodes = null;
    }, 1300);

    this.state.isAmbientActive = false;
    this.notify();
  }

  // ==========================================
  // SACRED TACTILE SFX (Zero Latency)
  // ==========================================

  /**
   * Sound of cards gliding, shuffling, or cutting across velvet
   */
  public playCardShuffle() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.12; // 120ms burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Shaped filtered noise
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.12);
    filter.Q.setValueAtTime(2.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter).connect(gain).connect(this.sfxGain!);
    noise.start(now);
  }

  /**
   * Authentic rapid card dealing & fanning sound ("khad-khad-khad-khad" paper riffle cascade)
   */
  public playCardDealCascade() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const totalCards = 18;
    const interval = 0.046; // ~46ms between cards

    for (let i = 0; i < totalCards; i++) {
      const cardTime = now + i * interval + (Math.random() - 0.5) * 0.005;

      // 1. Crisp paper friction noise burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600 + Math.random() * 400, cardTime);
      filter.Q.setValueAtTime(2.8, cardTime);

      const gain = ctx.createGain();
      const volume = 0.32 * (1 - (i / totalCards) * 0.3); // Gentle decay
      gain.gain.setValueAtTime(volume, cardTime);
      gain.gain.exponentialRampToValueAtTime(0.001, cardTime + 0.04);

      noise.connect(filter).connect(gain).connect(this.sfxGain!);
      noise.start(cardTime);

      // 2. Subtle soft tactile snap (thump)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260 + i * 8, cardTime);
      osc.frequency.exponentialRampToValueAtTime(110, cardTime + 0.035);

      oscGain.gain.setValueAtTime(0.14, cardTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, cardTime + 0.035);

      osc.connect(oscGain).connect(this.sfxGain!);
      osc.start(cardTime);
      osc.stop(cardTime + 0.04);
    }
  }

  /**
   * Gentle, luminous crystalline bell when hovering or picking a card
   */
  public playCardSelect() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(1760, now); // A6
    overtone.frequency.exponentialRampToValueAtTime(2349.32, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    overtone.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.38);
    overtone.stop(now + 0.38);
  }

  /**
   * Deep, resonant Tibetan / Crystal Singing Bowl strike on card flip
   */
  public playCardFlip() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fundamentalFreq = 432; // Sacred A4 tuning
    const harmonics = [fundamentalFreq, fundamentalFreq * 1.5, fundamentalFreq * 2.76, fundamentalFreq * 4.2];

    const masterSfx = ctx.createGain();
    masterSfx.gain.setValueAtTime(0.001, now);
    masterSfx.gain.linearRampToValueAtTime(0.4, now + 0.025);
    masterSfx.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    masterSfx.connect(this.sfxGain!);

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 0 ? "sine" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Subtle pitch bend at strike
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 1.8);

      const amp = 0.35 / (idx + 1);
      g.gain.setValueAtTime(amp, now);

      osc.connect(g).connect(masterSfx);
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  /**
   * Shimmering Celestial Pentatonic Arpeggio when AI oracle interpretation is complete
   */
  public playOracleChime() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // F# Major Pentatonic scale (ethereal, uplifting)
    const notes = [369.99, 415.3, 466.16, 554.37, 622.25, 739.99];

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain).connect(this.sfxGain!);
      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });
  }

  /**
   * Soft, warm crystal tick for buttons & step changes
   */
  public playButtonClick() {
    if (this.state.isMuted || !this.state.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

// Global Singleton Instance
export const mysticAudio = typeof window !== "undefined" ? new MysticAudioEngine() : ({} as MysticAudioEngine);
