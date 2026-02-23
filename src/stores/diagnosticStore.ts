import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PronunciationItemResult } from '../features/diagnostic/types';

interface DiagnosticState {
  // Session
  diagnosticId: string | null;

  // Grammar section
  grammarIndex: number;
  grammarAnswers: Record<string, string>;
  grammarTimes: Record<string, number>;
  grammarScore: number | null;
  grammarCompleted: boolean;

  // Listening section
  listeningIndex: number;
  listeningAnswers: Record<string, string>;
  listeningScore: number | null;
  listeningCompleted: boolean;

  // Pronunciation section
  pronunciationIndex: number;
  pronunciationResults: PronunciationItemResult[];
  pronunciationScore: number | null;
  pronunciationCompleted: boolean;

  // Actions
  setDiagnosticId: (id: string) => void;

  recordGrammarAnswer: (questionId: string, answer: string, timeMs: number) => void;
  advanceGrammar: () => void;
  completeGrammar: (score: number) => void;

  recordListeningAnswer: (itemId: string, answer: string) => void;
  advanceListening: () => void;
  completeListening: (score: number) => void;

  recordPronunciationResult: (result: PronunciationItemResult) => void;
  advancePronunciation: () => void;
  completePronunciation: (score: number) => void;

  reset: () => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set) => ({
      diagnosticId: null,

      grammarIndex: 0,
      grammarAnswers: {},
      grammarTimes: {},
      grammarScore: null,
      grammarCompleted: false,

      listeningIndex: 0,
      listeningAnswers: {},
      listeningScore: null,
      listeningCompleted: false,

      pronunciationIndex: 0,
      pronunciationResults: [],
      pronunciationScore: null,
      pronunciationCompleted: false,

      setDiagnosticId: (id) => set({ diagnosticId: id }),

      recordGrammarAnswer: (questionId, answer, timeMs) =>
        set((s) => ({
          grammarAnswers: { ...s.grammarAnswers, [questionId]: answer },
          grammarTimes: { ...s.grammarTimes, [questionId]: timeMs },
        })),

      advanceGrammar: () => set((s) => ({ grammarIndex: s.grammarIndex + 1 })),

      completeGrammar: (score) => set({ grammarScore: score, grammarCompleted: true }),

      recordListeningAnswer: (itemId, answer) =>
        set((s) => ({
          listeningAnswers: { ...s.listeningAnswers, [itemId]: answer },
        })),

      advanceListening: () => set((s) => ({ listeningIndex: s.listeningIndex + 1 })),

      completeListening: (score) => set({ listeningScore: score, listeningCompleted: true }),

      recordPronunciationResult: (result) =>
        set((s) => ({
          pronunciationResults: [...s.pronunciationResults, result],
        })),

      advancePronunciation: () =>
        set((s) => ({ pronunciationIndex: s.pronunciationIndex + 1 })),

      completePronunciation: (score) =>
        set({ pronunciationScore: score, pronunciationCompleted: true }),

      reset: () =>
        set({
          diagnosticId: null,
          grammarIndex: 0,
          grammarAnswers: {},
          grammarTimes: {},
          grammarScore: null,
          grammarCompleted: false,
          listeningIndex: 0,
          listeningAnswers: {},
          listeningScore: null,
          listeningCompleted: false,
          pronunciationIndex: 0,
          pronunciationResults: [],
          pronunciationScore: null,
          pronunciationCompleted: false,
        }),
    }),
    { name: 'espanhol-diagnostic' },
  ),
);
