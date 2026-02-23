import { Timestamp } from "firebase-admin/firestore";

// --- users/{uid} ---
export interface UserProfile {
  name: string;
  email: string;
  level: SpanishLevel | null;
  levelScore: number | null;
  persona: Persona | null;
  correctionIntensity: CorrectionIntensity | null;
  streakCurrent: number;
  streakLastDate: Timestamp | null;
  scheduleWeekly: Record<string, string[]>;
  scheduleMinBlocks: number;
  diagnosticCompleted: boolean;
  lastDiagnosticDate: Timestamp | null;
  adapterState: Record<AdapterArea, AdapterZone>;
  dailyChatCount: number;
  dailyChatResetDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- users/{uid}/diagnostics/{diagnosticId} ---
export interface Diagnostic {
  type: "initial" | "retest";
  status: "in_progress" | "completed";
  grammarScore: number | null;
  grammarAnswers: GrammarAnswer[];
  listeningScore: number | null;
  listeningAnswers: ListeningAnswer[];
  pronunciationScore: number | null;
  pronunciationResults: PronunciationResult[];
  overallScore: number | null;
  levelAssigned: SpanishLevel | null;
  strengths: string[];
  weaknesses: string[];
  phonemesToWork: string[];
  previousDiagnosticId: string | null;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  resumeSection: DiagnosticSection | null;
  resumeIndex: number | null;
}

// --- users/{uid}/sessions/{sessionId} ---
export interface Session {
  type: "chat" | "lesson";
  status: "active" | "completed" | "abandoned";
  lessonId: string | null;
  topic: string | null;
  durationMs: number | null;
  overallScore: number | null;
  grammarScore: number | null;
  pronunciationScore: number | null;
  vocabularyScore: number | null;
  phonemesCorrected: PhonemeCorrected[];
  topicsCovered: string[];
  corrections: SessionCorrection[];
  adapterSnapshot: Record<string, string>;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
}

// --- users/{uid}/lessonProgress/{lessonId} ---
export interface LessonProgress {
  moduleTitle: string;
  level: SpanishLevel;
  status: "locked" | "available" | "in_progress" | "completed";
  currentBlock: number;
  totalBlocks: number;
  score: number | null;
  exerciseResults: ExerciseResult[];
  weakExercises: string[];
  prerequisiteId: string | null;
  completedAt: Timestamp | null;
}

// --- users/{uid}/homework/{homeworkId} ---
export interface Homework {
  sourceSessionId: string;
  sourceType: "grammar" | "pronunciation" | "vocabulary";
  contentRef: string;
  status: "pending" | "completed" | "overdue";
  score: number | null;
  deadline: Timestamp;
  spacedRepetitionStep: number;
  nextReviewDate: Timestamp | null;
  attempts: number;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

// --- users/{uid}/adaptations/{adaptationId} ---
export interface Adaptation {
  triggerSessionId: string;
  area: AdapterArea;
  previousZone: AdapterZone;
  newZone: AdapterZone;
  recentAccuracy: number;
  adjustment: "increased" | "maintained" | "decreased";
  reason: string;
  createdAt: Timestamp;
}

// --- users/{uid}/scheduleLogs/{logId} ---
export interface ScheduleLog {
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "completed" | "missed";
  sessionId: string | null;
  completedAt: Timestamp | null;
  toleranceWindowMinutes: number;
}

// --- users/{uid}/reports/{reportId} ---
export interface Report {
  category: ReportCategory;
  screen: string;
  contentSnapshot: string;
  sessionId: string | null;
  userComment: string | null;
  reviewed: boolean;
  createdAt: Timestamp;
}

// --- Shared Types ---

export type SpanishLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type Persona = "iniciante" | "intermediario" | "profissional";

export type CorrectionIntensity = "intensive" | "moderate" | "minimal";

export type AdapterArea = "grammar" | "pronunciation" | "vocabulary";

export type AdapterZone = "tooEasy" | "ideal" | "tooHard";

export type DiagnosticSection = "grammar" | "listening" | "pronunciation";

export type ReportCategory =
  | "grammar_error"
  | "wrong_translation"
  | "bad_phonetic_correction"
  | "other";

// --- Nested Types ---

export interface GrammarAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
  timeMs: number;
}

export interface ListeningAnswer {
  audioId: string;
  answer: string;
  correct: boolean;
  errorType: string;
}

export interface PronunciationResult {
  phraseId: string;
  score: number;
  problematicPhonemes: string[];
}

export interface PhonemeCorrected {
  phoneme: string;
  attempts: number;
  finalScore: number;
}

export interface SessionCorrection {
  timestamp: Timestamp;
  type: string;
  original: string;
  corrected: string;
  accepted: boolean;
}

export interface ExerciseResult {
  exerciseId: string;
  type: string;
  score: number;
  attempts: number;
}
