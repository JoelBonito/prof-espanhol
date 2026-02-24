import { grammarQuestions } from './data/grammarQuestions';
import type { ListeningAnswer, PronunciationItemResult, QuestionAnswer } from './types';

const TOTAL_GRAMMAR_QUESTIONS = grammarQuestions.length;

export function createDiagnosticSessionPayload(startedAt: unknown) {
  return {
    type: 'initial' as const,
    status: 'in_progress' as const,
    startedAt,
    grammarScore: null,
    listeningScore: null,
    pronunciationScore: null,
    overallScore: null,
  };
}

export function buildGrammarPayload(
  score: number,
  answers: QuestionAnswer[],
  completedAt: string,
  updatedAt: unknown,
) {
  const avgTimeMs = Math.round(
    answers.reduce((sum, answer) => sum + answer.timeMs, 0) / TOTAL_GRAMMAR_QUESTIONS,
  );

  return {
    grammarScore: score,
    grammarAnswers: answers,
    grammarAvgTimeMs: avgTimeMs,
    grammarCompletedAt: completedAt,
    status: 'grammar_complete' as const,
    updatedAt,
  };
}

export function buildListeningPayload(
  score: number,
  answers: ListeningAnswer[],
  breakdown: Record<'vocabulario' | 'velocidade' | 'contexto', number>,
  completedAt: string,
  updatedAt: unknown,
) {
  return {
    listeningScore: score,
    listeningAnswers: answers,
    listeningBreakdown: breakdown,
    listeningCompletedAt: completedAt,
    status: 'listening_complete' as const,
    updatedAt,
  };
}

export function buildPronunciationPayload(
  score: number,
  results: PronunciationItemResult[],
  phonemesToWork: string[],
  completedAt: string,
  updatedAt: unknown,
) {
  return {
    pronunciationScore: score,
    pronunciationResults: results,
    phonemesToWork,
    pronunciationCompletedAt: completedAt,
    status: 'pronunciation_complete' as const,
    updatedAt,
  };
}
