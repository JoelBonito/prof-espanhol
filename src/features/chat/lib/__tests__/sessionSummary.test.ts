import { describe, expect, it } from 'vitest';
import { buildSessionSummary } from '../sessionSummary';
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
});
