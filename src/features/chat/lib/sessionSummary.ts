import type { PhonemeCorrectionEvent } from '../../../stores/chatStore';

export interface SessionSummaryData {
  sessionId: string;
  durationMs: number;
  phonemesCorrect: string[];
  phonemesPending: string[];
  overallScore: number;
  totalCorrections: number;
  messageCount: number;
}

/**
 * Compute session summary from raw session data.
 */
export function buildSessionSummary(params: {
  sessionId: string;
  durationMs: number;
  corrections: PhonemeCorrectionEvent[];
  messageCount: number;
}): SessionSummaryData {
  const { sessionId, durationMs, corrections, messageCount } = params;

  // Phonemes corrected (at least one accepted attempt)
  const phonemesCorrect = [
    ...new Set(
      corrections.filter((c) => c.accepted).map((c) => c.phoneme.toLowerCase()),
    ),
  ];

  // Phonemes pending = phonemes where no attempt was ever accepted
  const allPhonemes = [...new Set(corrections.map((c) => c.phoneme.toLowerCase()))];
  const phonemesPending = allPhonemes.filter((p) => !phonemesCorrect.includes(p));

  // Overall score: % of unique phonemes corrected vs total encountered
  // If no corrections occurred, 80 (base score for completing a session)
  const overallScore =
    allPhonemes.length === 0
      ? 80
      : Math.round((phonemesCorrect.length / allPhonemes.length) * 100);

  return {
    sessionId,
    durationMs,
    phonemesCorrect,
    phonemesPending,
    overallScore,
    totalCorrections: corrections.length,
    messageCount,
  };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 50) return 'Regular';
  return 'A melhorar';
}
