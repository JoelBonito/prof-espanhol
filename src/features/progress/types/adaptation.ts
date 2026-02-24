export type AdaptationArea = 'grammar' | 'pronunciation' | 'vocabulary' | 'all';
export type AdaptationZone = 'tooEasy' | 'ideal' | 'tooHard';

export interface AdapterHistoryEntry {
  date: string;
  area: AdaptationArea;
  zone: AdaptationZone;
  previousZone: AdaptationZone;
  adjustment: 'increased' | 'maintained' | 'decreased';
  reason: string;
  difficultyBefore?: string;
  difficultyAfter?: string;
  previousDifficulty?: string;
  newDifficulty?: string;
  diagnosticId?: string;
}
