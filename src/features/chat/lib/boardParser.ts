/**
 * Parse BOARD_JSON markers from Gemini structured text channel.
 *
 * The system prompt instructs Gemini to emit board state as:
 *   [BOARD_JSON:{"lessonTitle":"...","text":"...","state":"presentation","level":"A1","sectionIndex":1,"sectionTotal":5}]
 *
 * This parser extracts the marker, returning clean text and parsed board data.
 */

export const BOARD_STATES = [
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
] as const;

export type BoardState = (typeof BOARD_STATES)[number];

export interface BoardData {
  lessonTitle: string;
  text: string;
  state: BoardState;
  level: string;
  sectionIndex: number;
  sectionTotal: number;
}

export interface BoardParseResult {
  board: BoardData | null;
  cleanText: string;
}

const BOARD_REGEX = /\[BOARD_JSON:\s*(\{[^}]+\})\s*\]/g;

const validStates = new Set<string>(BOARD_STATES);

function isValidState(value: string): value is BoardState {
  return validStates.has(value);
}

function isValidBoardPayload(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.lessonTitle === 'string' &&
    typeof o.text === 'string' &&
    typeof o.state === 'string' &&
    typeof o.level === 'string' &&
    typeof o.sectionIndex === 'number' &&
    typeof o.sectionTotal === 'number'
  );
}

export function parseBoardMarkers(text: string): BoardParseResult {
  let board: BoardData | null = null;

  const cleanText = text.replace(BOARD_REGEX, (_, jsonStr: string) => {
    // Only keep the first valid marker per turn
    if (board) return '';

    try {
      const obj: unknown = JSON.parse(jsonStr);
      if (!isValidBoardPayload(obj)) return '';

      const raw = obj as Record<string, unknown>;
      const state = isValidState(raw.state as string)
        ? (raw.state as BoardState)
        : 'presentation';

      board = {
        lessonTitle: String(raw.lessonTitle),
        text: String(raw.text),
        state,
        level: String(raw.level),
        sectionIndex: Number(raw.sectionIndex),
        sectionTotal: Number(raw.sectionTotal),
      };
    } catch {
      // Malformed JSON — skip marker silently
    }
    return '';
  }).trim();

  return { board, cleanText };
}
