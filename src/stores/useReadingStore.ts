import { create } from "zustand";
import { DrawnCardData, StructuredReadingResponse, TarotSpread, Persona } from "@/types/tarot";
import { getSpreadById, getPersonaById } from "@/lib/tarot/data";
import { mysticAudio } from "@/lib/audio/soundscape";

export type ReadingStep =
  | "question"     // Step 1: Inquire & pick spread/persona
  | "shuffling"    // Step 2: 3D Deck shuffling animation
  | "cutting"      // Step 2.5: Interactive 3D deck cutting ritual
  | "picking"      // Step 3: Floating 3D field card selection
  | "revealing"    // Step 4: Staggered flip reveals on velvet board
  | "streaming"    // Step 5: Streaming AI reading
  | "complete";    // Step 6: Complete with follow-ups & guidance cards

export interface FollowupMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ReadingState {
  readingId: string | null;
  step: ReadingStep;
  question: string;
  optionA: string;
  optionB: string;
  spreadId: string;
  personaId: string;
  userPickIndices: number[];
  drawnCards: DrawnCardData[];
  revealedIndices: number[];
  isStreaming: boolean;
  streamedText: string;
  readingResponse: StructuredReadingResponse | null;
  streamError: string | null;
  followups: FollowupMessage[];
  followupInput: string;
  isAudioMuted: boolean;
  allowReversals: boolean;

  // Actions
  setStep: (step: ReadingStep) => void;
  setQuestion: (q: string) => void;
  setOptions: (a: string, b: string) => void;
  setSpreadId: (id: string) => void;
  setPersonaId: (id: string) => void;
  setAllowReversals: (allow: boolean) => void;
  togglePickIndex: (index: number) => boolean;
  clearPicks: () => void;
  setDrawnCards: (cards: DrawnCardData[], readingId: string) => void;
  revealCard: (index: number) => void;
  revealAllCards: () => void;
  setStreaming: (isStreaming: boolean) => void;
  setStreamedText: (text: string) => void;
  setReadingResponse: (res: StructuredReadingResponse | null) => void;
  setStreamError: (err: string | null) => void;
  addFollowupMessage: (msg: FollowupMessage) => void;
  setFollowupInput: (val: string) => void;
  toggleAudio: () => void;
  resetReading: () => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  readingId: null,
  step: "question",
  question: "",
  optionA: "",
  optionB: "",
  spreadId: "three_card",
  personaId: "sage",
  userPickIndices: [],
  drawnCards: [],
  revealedIndices: [],
  isStreaming: false,
  streamedText: "",
  readingResponse: null,
  streamError: null,
  followups: [],
  followupInput: "",
  isAudioMuted: false,
  allowReversals: true,

  setStep: (step) => {
    if (step === "shuffling" && typeof window !== "undefined") {
      mysticAudio.playCardShuffle?.();
    }
    set({ step });
  },
  setQuestion: (question) => set({ question: question.slice(0, 200) }),
  setOptions: (optionA, optionB) => set({ optionA, optionB }),
  setSpreadId: (spreadId) => set({ spreadId, userPickIndices: [] }),
  setPersonaId: (personaId) => set({ personaId }),
  setAllowReversals: (allowReversals: boolean) => set({ allowReversals }),

  togglePickIndex: (index: number) => {
    const { userPickIndices, spreadId } = get();
    const spread = getSpreadById(spreadId);
    const maxCards = spread ? spread.cardCount : 3;

    if (userPickIndices.includes(index)) {
      if (typeof window !== "undefined") mysticAudio.playCardSelect?.();
      set({ userPickIndices: userPickIndices.filter((i) => i !== index) });
      return false;
    } else {
      if (userPickIndices.length < maxCards) {
        if (typeof window !== "undefined") mysticAudio.playCardSelect?.();
        set({ userPickIndices: [...userPickIndices, index] });
        return true;
      }
      return false;
    }
  },

  clearPicks: () => set({ userPickIndices: [] }),

  setDrawnCards: (cards, readingId) =>
    set({
      drawnCards: cards,
      readingId,
      revealedIndices: [],
      step: "revealing",
    }),

  revealCard: (index: number) => {
    const { revealedIndices } = get();
    if (!revealedIndices.includes(index)) {
      if (typeof window !== "undefined") mysticAudio.playCardFlip?.();
      set({ revealedIndices: [...revealedIndices, index] });
    }
  },

  revealAllCards: () => {
    const { drawnCards } = get();
    if (typeof window !== "undefined") mysticAudio.playCardFlip?.();
    set({
      revealedIndices: drawnCards.map((_, i) => i),
    });
  },

  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamedText: (streamedText) => set({ streamedText }),
  setReadingResponse: (readingResponse) => {
    if (readingResponse && typeof window !== "undefined") {
      mysticAudio.playOracleChime?.();
    }
    set({ readingResponse });
  },
  setStreamError: (streamError) => set({ streamError }),

  addFollowupMessage: (msg) =>
    set((state) => ({
      followups: [...state.followups, msg],
    })),

  setFollowupInput: (followupInput) => set({ followupInput }),

  toggleAudio: () => {
    if (typeof window !== "undefined" && mysticAudio.toggleMute) {
      const isUnmuted = mysticAudio.toggleMute();
      set({ isAudioMuted: !isUnmuted });
    } else {
      set((state) => ({ isAudioMuted: !state.isAudioMuted }));
    }
  },

  resetReading: () =>
    set({
      readingId: null,
      step: "question",
      question: "",
      optionA: "",
      optionB: "",
      userPickIndices: [],
      drawnCards: [],
      revealedIndices: [],
      isStreaming: false,
      streamedText: "",
      readingResponse: null,
      streamError: null,
      followups: [],
      followupInput: "",
    }),
}));
