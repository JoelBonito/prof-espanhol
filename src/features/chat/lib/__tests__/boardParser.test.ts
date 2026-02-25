import { describe, expect, it } from 'vitest';
import { parseBoardMarkers } from '../boardParser';

describe('parseBoardMarkers', () => {
  it('extracts valid BOARD_JSON marker and returns board data + clean text', () => {
    const raw =
      'Some text before\n[BOARD_JSON:{"lessonTitle":"En el mercado","text":"Hola, ¿cuánto cuesta?","state":"presentation","level":"A1","sectionIndex":1,"sectionTotal":5}]\nSome text after';

    const result = parseBoardMarkers(raw);

    expect(result.board).toEqual({
      lessonTitle: 'En el mercado',
      text: 'Hola, ¿cuánto cuesta?',
      state: 'presentation',
      level: 'A1',
      sectionIndex: 1,
      sectionTotal: 5,
    });
    expect(result.cleanText).toBe('Some text before\n\nSome text after');
  });

  it('returns null board when no marker is present', () => {
    const result = parseBoardMarkers('Just normal text without markers');

    expect(result.board).toBeNull();
    expect(result.cleanText).toBe('Just normal text without markers');
  });

  it('falls back to presentation for unknown state', () => {
    const raw =
      '[BOARD_JSON:{"lessonTitle":"Test","text":"Hello","state":"unknown_state","level":"B1","sectionIndex":2,"sectionTotal":3}]';

    const result = parseBoardMarkers(raw);

    expect(result.board).not.toBeNull();
    expect(result.board!.state).toBe('presentation');
  });

  it('ignores malformed JSON without crashing', () => {
    const raw = 'Text [BOARD_JSON:{invalid-json}] end';

    const result = parseBoardMarkers(raw);

    expect(result.board).toBeNull();
    expect(result.cleanText).toBe('Text  end');
  });

  it('ignores marker with missing required fields', () => {
    const raw =
      '[BOARD_JSON:{"lessonTitle":"Test","state":"presentation"}]';

    const result = parseBoardMarkers(raw);

    expect(result.board).toBeNull();
  });

  it('only keeps the first valid marker when multiple exist', () => {
    const raw =
      '[BOARD_JSON:{"lessonTitle":"First","text":"A","state":"presentation","level":"A1","sectionIndex":1,"sectionTotal":3}]\n[BOARD_JSON:{"lessonTitle":"Second","text":"B","state":"correcting","level":"A2","sectionIndex":2,"sectionTotal":3}]';

    const result = parseBoardMarkers(raw);

    expect(result.board!.lessonTitle).toBe('First');
  });

  it('handles all valid board states', () => {
    const states = [
      'presentation',
      'tutor_reading',
      'student_reading',
      'analyzing',
      'correcting',
      'request_translation',
      'student_translating',
      'correcting_translation',
      'next_section',
      'completed',
    ];

    for (const state of states) {
      const raw = `[BOARD_JSON:{"lessonTitle":"T","text":"X","state":"${state}","level":"A1","sectionIndex":1,"sectionTotal":1}]`;
      const result = parseBoardMarkers(raw);
      expect(result.board!.state).toBe(state);
    }
  });
});
