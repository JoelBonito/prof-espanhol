import { describe, expect, it } from 'vitest';
import {
  calculateOverallScore,
  deriveStrengths,
  deriveWeaknesses,
  scoreToLevel,
} from '../functions/src/lib/diagnosticScoring';

describe('diagnostic scoring logic', () => {
  it('calculates weighted score with pronunciation weight = 40%', () => {
    const overall = calculateOverallScore(80, 60, 70);
    expect(overall).toBe(70);
  });

  it('maps CEFR with lower-level tie-breaking', () => {
    expect(scoreToLevel(20)).toBe('A1');
    expect(scoreToLevel(40)).toBe('A2');
    expect(scoreToLevel(60)).toBe('B1');
    expect(scoreToLevel(80)).toBe('B2');
    expect(scoreToLevel(81)).toBe('C1');
  });

  it('derives strengths and weaknesses from area scores', () => {
    expect(deriveStrengths(72, 71, 40)).toEqual(['Gramática sólida', 'Boa compreensão auditiva']);
    expect(deriveWeaknesses(45, 60, 49)).toEqual([
      'Gramática precisa de atenção',
      'Pronúncia precisa de atenção',
    ]);
  });
});
