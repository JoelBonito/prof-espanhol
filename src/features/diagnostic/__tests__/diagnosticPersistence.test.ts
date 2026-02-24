import { describe, expect, it } from 'vitest';
import {
  buildGrammarPayload,
  buildListeningPayload,
  buildPronunciationPayload,
  createDiagnosticSessionPayload,
} from '../persistence';
import { grammarQuestions } from '../data/grammarQuestions';

describe('diagnostic persistence payloads', () => {
  it('builds initial diagnostic payload with required fields', () => {
    const payload = createDiagnosticSessionPayload('ts');

    expect(payload).toMatchObject({
      type: 'initial',
      status: 'in_progress',
      startedAt: 'ts',
      grammarScore: null,
      listeningScore: null,
      pronunciationScore: null,
      overallScore: null,
    });
  });

  it('builds section payloads for grammar and listening', () => {
    const grammarPayload = buildGrammarPayload(
      80,
      [
        { questionId: 'g1', answer: 'uno', correct: true, timeMs: 1000 },
        { questionId: 'g2', answer: 'dos', correct: false, timeMs: 3000 },
      ],
      '2026-02-24T10:00:00.000Z',
      'ts',
    );

    const listeningPayload = buildListeningPayload(
      60,
      [{ itemId: 'l1', answer: 'a', correct: true, errorType: 'vocabulario' }],
      { vocabulario: 1, velocidade: 0, contexto: 0 },
      '2026-02-24T10:01:00.000Z',
      'ts',
    );

    const expectedAvg = Math.round((1000 + 3000) / grammarQuestions.length);
    expect(grammarPayload.status).toBe('grammar_complete');
    expect(grammarPayload.grammarAvgTimeMs).toBe(expectedAvg);
    expect(listeningPayload.status).toBe('listening_complete');
    expect(listeningPayload.listeningScore).toBe(60);
  });

  it('builds pronunciation payload with final score and phonemes list', () => {
    const payload = buildPronunciationPayload(
      72,
      [{ phraseId: 'p1', score: 72, problematicPhonemes: ['rr'], feedback: 'bom' }],
      ['rr', 'j'],
      '2026-02-24T10:02:00.000Z',
      'ts',
    );

    expect(payload).toMatchObject({
      pronunciationScore: 72,
      status: 'pronunciation_complete',
      phonemesToWork: ['rr', 'j'],
    });
  });
});
