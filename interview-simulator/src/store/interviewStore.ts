import { create } from "zustand";
import type { InterviewSession, InterviewQuestion, AnswerEntry, ExtractedSkill, SessionConfig } from "@/types/interview";

interface InterviewState {
  session: InterviewSession | null;
  currentQuestionIndex: number;
  currentQuestion: InterviewQuestion | null;
  liveTranscript: string;
  finalTranscript: string;
  isSpeaking: boolean;     // AI is reading question
  isListening: boolean;    // mic is active / recording user
  captions: string;        // live caption text
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: InterviewSession | null) => void;
  setCurrentQuestionIndex: (idx: number) => void;
  setLiveTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  setIsSpeaking: (val: boolean) => void;
  setIsListening: (val: boolean) => void;
  setCaptions: (text: string) => void;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  addAnswer: (answer: AnswerEntry) => void;
  nextQuestion: () => void;
  reset: () => void;
}

const defaultState = {
  session: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  liveTranscript: "",
  finalTranscript: "",
  isSpeaking: false,
  isListening: false,
  captions: "",
  isLoading: false,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...defaultState,

  setSession: (session) => {
    const q = session?.questions?.[0] ?? null;
    set({ session, currentQuestion: q, currentQuestionIndex: 0 });
  },

  setCurrentQuestionIndex: (idx) => {
    const { session } = get();
    const q = session?.questions?.[idx] ?? null;
    set({ currentQuestionIndex: idx, currentQuestion: q });
  },

  setLiveTranscript: (text) => set({ liveTranscript: text }),
  setFinalTranscript: (text) => set({ finalTranscript: text }),
  setIsSpeaking: (val) => set({ isSpeaking: val }),
  setIsListening: (val) => set({ isListening: val }),
  setCaptions: (text) => set({ captions: text }),
  setIsLoading: (val) => set({ isLoading: val }),
  setError: (err) => set({ error: err }),

  addAnswer: (answer) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        answers: [...session.answers, answer],
      },
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, session } = get();
    const nextIdx = currentQuestionIndex + 1;
    if (!session || nextIdx >= session.questions.length) return;
    const q = session.questions[nextIdx];
    set({ currentQuestionIndex: nextIdx, currentQuestion: q, finalTranscript: "", captions: "" });
  },

  reset: () => set(defaultState),
}));
