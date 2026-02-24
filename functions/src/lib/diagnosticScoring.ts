import type { SpanishLevel } from '../types/firestore.js';

// CEFR thresholds per story spec (0-20=A1, 21-40=A2, 41-60=B1, 61-80=B2, 81-100=C1)
// Tie-breaking: lower level wins (boundary belongs to lower level)
export function scoreToLevel(score: number): SpanishLevel {
  if (score <= 20) return 'A1';
  if (score <= 40) return 'A2';
  if (score <= 60) return 'B1';
  if (score <= 80) return 'B2';
  return 'C1';
}

export function deriveStrengths(
  grammarScore: number,
  listeningScore: number,
  pronunciationScore: number,
): string[] {
  const strengths: string[] = [];
  if (grammarScore >= 70) strengths.push('Gramática sólida');
  if (listeningScore >= 70) strengths.push('Boa compreensão auditiva');
  if (pronunciationScore >= 70) strengths.push('Boa pronúncia');
  return strengths;
}

export function deriveWeaknesses(
  grammarScore: number,
  listeningScore: number,
  pronunciationScore: number,
): string[] {
  const weaknesses: string[] = [];
  if (grammarScore < 50) weaknesses.push('Gramática precisa de atenção');
  if (listeningScore < 50) weaknesses.push('Compreensão auditiva precisa de prática');
  if (pronunciationScore < 50) weaknesses.push('Pronúncia precisa de atenção');
  return weaknesses;
}

export function calculateOverallScore(
  grammarScore: number,
  listeningScore: number,
  pronunciationScore: number,
): number {
  return Math.round(grammarScore * 0.3 + listeningScore * 0.3 + pronunciationScore * 0.4);
}
