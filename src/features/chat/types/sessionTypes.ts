export interface CompleteChatSessionInput {
  sessionId: string;
  durationMs: number;
  phonemesCorrected: string[];
  phonemesPending: string[];
  overallScore: number;
  totalCorrections: number;
  messageCount: number;
}

export interface EvaluateAdaptiveSessionInput {
  sessionId: string;
  durationMs: number;
  overallScore: number;
  messages: Array<{
    role: 'tutor' | 'user';
    text: string;
    timestamp: number;
  }>;
  corrections: Array<{
    phoneme: string;
    expected: string;
    heard: string;
    score: number;
    attempt: number;
    accepted: boolean;
  }>;
}
