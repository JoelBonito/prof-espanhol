import { describe, expect, it } from 'vitest';
import { buildSessionSummary, hydrateSessionSummary } from '../sessionSummary';
import type { PhonemeCorrectionEvent } from '../../../../stores/chatStore';

function correction(
  phoneme: string,
  score: number,
  accepted: boolean,
  timestamp: number,
): PhonemeCorrectionEvent {
  return {
    phoneme,
    expected: phoneme,
    heard: phoneme,
    score,
    timestamp,
    attempt: 1,
    accepted,
  };
}

describe('buildSessionSummary', () => {
  it('marks pending phonemes when no accepted attempts exist', () => {
    const data = buildSessionSummary({
      sessionId: 's1',
      durationMs: 120000,
      corrections: [correction('rr', 40, false, 1), correction('j', 35, false, 2)],
      messageCount: 4,
    });

    expect(data.phonemesCorrect).toEqual([]);
    expect(data.phonemesPending).toEqual(['rr', 'j']);
    expect(data.overallScore).toBe(0);
  });

  it('computes score based on unique corrected phonemes', () => {
    const data = buildSessionSummary({
      sessionId: 's2',
      durationMs: 180000,
      corrections: [
        correction('rr', 45, false, 1),
        correction('rr', 70, true, 2),
        correction('ll', 80, true, 3),
      ],
      messageCount: 7,
    });

    expect(data.phonemesCorrect).toEqual(['rr', 'll']);
    expect(data.phonemesPending).toEqual([]);
    expect(data.overallScore).toBe(100);
    expect(data.totalCorrections).toBe(3);
    expect(data.messageCount).toBe(7);
  });

  it('hydrates persisted adaptive evaluation without losing previous values', () => {
    const hydrated = hydrateSessionSummary(
      's3',
      {
        overallScore: 88,
        adaptiveEvaluation: {
          estimatedLevel: 'B1',
          confidence: 0.82,
          dimensions: {
            pronunciation: 79,
            fluency: 81,
            comprehension: 85,
            grammar: 74,
            vocabulary: 83,
          },
          strengths: ['boa compreensão auditiva'],
          priorityFocus: ['concordância verbal'],
          nextLesson: {
            phase: 'conversation',
            instructionPtBr: 'Treinar concordância em frases curtas.',
            promptEsPy: 'Practiquemos la concordancia verbal con ejemplos cotidianos.',
          },
          languageContract: {
            tutorSpeech: 'es-PY',
            metaInstructions: 'pt-BR',
          },
        },
      },
      {
        sessionId: 's3',
        durationMs: 120000,
        phonemesCorrect: ['rr'],
        phonemesPending: ['ll'],
        overallScore: 50,
        totalCorrections: 2,
        messageCount: 6,
      },
    );

    expect(hydrated.sessionId).toBe('s3');
    expect(hydrated.durationMs).toBe(120000);
    expect(hydrated.overallScore).toBe(88);
    expect(hydrated.adaptiveEvaluation?.estimatedLevel).toBe('B1');
    expect(hydrated.adaptiveEvaluation?.languageContract.tutorSpeech).toBe('es-PY');
  });
});
