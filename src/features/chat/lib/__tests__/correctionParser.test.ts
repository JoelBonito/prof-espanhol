import { describe, expect, it } from 'vitest';
import { parseCorrectionMarkers } from '../correctionParser';

describe('parseCorrectionMarkers', () => {
  it('extracts correction markers and returns clean tutor text', () => {
    const raw = `Buen intento.
[CORRECTION_JSON:{"phoneme":"rr","expected":"perro","heard":"pero","score":45}]
Repeti conmigo: perro.`;

    const parsed = parseCorrectionMarkers(raw);

    expect(parsed.cleanText).toContain('Buen intento.');
    expect(parsed.cleanText).toContain('Repeti conmigo: perro.');
    expect(parsed.corrections).toEqual([
      {
        phoneme: 'rr',
        expected: 'perro',
        heard: 'pero',
        score: 45,
      },
    ]);
  });

  it('ignores malformed markers without crashing', () => {
    const raw = 'Texto [CORRECTION_JSON:{invalid-json}] final';
    const parsed = parseCorrectionMarkers(raw);

    expect(parsed.cleanText).toBe('Texto  final');
    expect(parsed.corrections).toEqual([]);
  });
});
