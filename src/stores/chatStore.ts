import { create } from 'zustand';

export type ChatStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'reconnecting'
  | 'fallback_text'
  | 'expired'
  | 'ended'
  | 'error';

export interface ChatMessage {
  id: string;
  role: 'tutor' | 'user';
  text: string;
  timestamp: number;
}

export interface PhonemeCorrectionEvent {
  phoneme: string;
  expected: string;
  heard: string;
  score: number;
  timestamp: number;
  attempt: number;
  accepted: boolean;
}

interface ChatState {
  // Session
  sessionId: string | null;
  sessionToken: string | null;
  systemPrompt: string | null;
  status: ChatStatus;

  // Timing (RN08: 3-30 min)
  startTime: number | null;
  elapsedMs: number;

  // Messages & corrections
  messages: ChatMessage[];
  corrections: PhonemeCorrectionEvent[];

  // Phoneme attempt tracking (G-UX-10: max 3 per phoneme)
  phonemeAttempts: Record<string, number>;

  // Media
  isMuted: boolean;
  isRecording: boolean;

  // Rate limit (RN11: max 3/day)
  dailySessionCount: number;

  // Actions
  startSession: (sessionId: string, token: string, systemPrompt: string) => void;
  setStatus: (status: ChatStatus) => void;
  updateToken: (token: string) => void;
  addMessage: (msg: ChatMessage) => void;
  addCorrection: (correction: Omit<PhonemeCorrectionEvent, 'attempt' | 'accepted'>) => void;
  getPhonemeAttempts: (phoneme: string) => number;
  setElapsedMs: (ms: number) => void;
  toggleMute: () => void;
  setRecording: (recording: boolean) => void;
  endSession: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  sessionId: null,
  sessionToken: null,
  systemPrompt: null,
  status: 'idle',

  startTime: null,
  elapsedMs: 0,

  messages: [],
  corrections: [],
  phonemeAttempts: {},

  isMuted: false,
  isRecording: false,

  dailySessionCount: 0,

  startSession: (sessionId, token, systemPrompt) =>
    set((s) => ({
      sessionId,
      sessionToken: token,
      systemPrompt,
      status: 'active',
      startTime: Date.now(),
      elapsedMs: 0,
      messages: [],
      corrections: [],
      phonemeAttempts: {},
      dailySessionCount: s.dailySessionCount + 1,
    })),

  setStatus: (status) => set({ status }),

  updateToken: (token) => set({ sessionToken: token, status: 'active' }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  addCorrection: (correction) =>
    set((s) => {
      const key = correction.phoneme.toLowerCase();
      const currentAttempts = s.phonemeAttempts[key] ?? 0;
      const attempt = currentAttempts + 1;
      const accepted = correction.score >= 60;
      const newAttempts = { ...s.phonemeAttempts, [key]: accepted ? 0 : attempt };

      return {
        corrections: [...s.corrections, { ...correction, attempt, accepted }],
        phonemeAttempts: newAttempts,
      };
    }),

  getPhonemeAttempts: (phoneme) => get().phonemeAttempts[phoneme.toLowerCase()] ?? 0,

  setElapsedMs: (ms) => set({ elapsedMs: ms }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  setRecording: (recording) => set({ isRecording: recording }),

  endSession: () =>
    set({
      status: 'ended',
      isRecording: false,
    }),

  reset: () =>
    set({
      sessionId: null,
      sessionToken: null,
      systemPrompt: null,
      status: 'idle',
      startTime: null,
      elapsedMs: 0,
      messages: [],
      corrections: [],
      phonemeAttempts: {},
      isMuted: false,
      isRecording: false,
    }),
}));
