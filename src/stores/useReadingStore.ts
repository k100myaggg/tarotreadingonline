import { create } from "zustand";
import { DrawnCardData, StructuredReadingResponse, TarotSpread, Persona } from "@/types/tarot";
import { getSpreadById, getPersonaById } from "@/lib/tarot/data";

export type ReadingStep =
  | "question"     // Step 1: Inquire & pick spread/persona
  | "shuffling"    // Step 2: 3D Deck shuffling animation
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
  isAudioMuted: boolean;

  // Actions
  setStep: (step: ReadingStep) => void;
  setQuestion: (q: string) => void;
  setOptions: (a: string, b: string) => void;
  setSpreadId: (id: string) => void;
  setPersonaId: (id: string) => void;
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
  isAudioMuted: false,

  setStep: (step) => set({ step }),
  setQuestion: (question) => set({ question: question.slice(0, 200) }),
  setOptions: (optionA, optionB) => set({ optionA, optionB }),
  setSpreadId: (spreadId) => set({ spreadId, userPickIndices: [] }),
  setPersonaId: (personaId) => set({ personaId }),

  togglePickIndex: (index: number) => {
    const { userPickIndices, spreadId } = get();
    const spread = getSpreadById(spreadId);
    const maxCards = spread ? spread.cardCount : 3;

    if (userPickIndices.includes(index)) {
      set({ userPickIndices: userPickIndices.filter((i) => i !== index) });
      return false;
    } else {
      if (userPickIndices.length < maxCards) {
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
      set({ revealedIndices: [...revealedIndices, index] });
    }
  },

  revealAllCards: () => {
    const { drawnCards } = get();
    set({
      revealedIndices: drawnCards.map((_, i) => i),
    });
  },

  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamedText: (streamedText) => set({ streamedText }),
  setReadingResponse: (readingResponse) => set({ readingResponse }),
  setStreamError: (streamError) => set({ streamError }),

  addFollowupMessage: (msg) =>
    set((state) => ({
      followups: [...state.followups, msg],
    })),

  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),

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
    }),
}));
