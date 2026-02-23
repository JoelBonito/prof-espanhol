export type QuestionType = 'mc' | 'fill';

export interface MCQuestion {
  id: string;
  type: 'mc';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  instruction: string;
  sentence: string;
  options: [string, string, string, string];
  correct: string;
}

export interface FillQuestion {
  id: string;
  type: 'fill';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  instruction: string;
  sentence: string;
  correct: string;
  alternatives?: string[];
  hint: string;
}

export type GrammarQuestion = MCQuestion | FillQuestion;

export interface QuestionAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
  timeMs: number;
}

export interface GrammarResult {
  score: number; // 0-100
  answers: QuestionAnswer[];
  completedAt: string; // ISO
  avgTimeMs: number;
}

// ─── Listening ────────────────────────────────────────────────────────────────

export type ErrorType = 'vocabulario' | 'velocidade' | 'contexto';

export interface ListeningItem {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  audioText: string; // fed to SpeechSynthesis for TTS
  question: string;
  options: [string, string, string, string];
  correct: string;
  errorType: ErrorType; // what kind of error wrong answers indicate
}

export interface ListeningAnswer {
  itemId: string;
  answer: string;
  correct: boolean;
  errorType: ErrorType;
}

export interface ListeningResult {
  score: number; // 0-100
  answers: ListeningAnswer[];
  breakdown: Record<ErrorType, number>; // error count per type
  completedAt: string;
}

// ─── Pronunciation ───────────────────────────────────────────────────────────

export interface PronunciationPhrase {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  text: string;
  targetPhonemes: string[];
  tip: string; // hint shown before recording
}

export interface PronunciationItemResult {
  phraseId: string;
  score: number; // 0-100
  problematicPhonemes: string[];
  feedback: string;
}

export interface PronunciationResult {
  score: number; // 0-100
  items: PronunciationItemResult[];
  allProblematicPhonemes: string[];
  completedAt: string;
}
