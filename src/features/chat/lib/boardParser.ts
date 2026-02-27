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

const BOARD_REGEX = /\[BOARD_JSON:\s*(\{[\s\S]*?\})\s*\]/g;

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
    typeof o.state === 'string'
  );
}

export function parseBoardMarkers(text: string): BoardParseResult {
  let board: BoardData | null = null;

  // Use a temporary list to track markers while cleaning text
  const cleanText = text.replace(BOARD_REGEX, (_, jsonStr: string) => {
    try {
      // Clean up whitespace or potential junk before parsing
      const obj: unknown = JSON.parse(jsonStr.trim());
      if (!isValidBoardPayload(obj)) return '';

      const raw = obj as Record<string, unknown>;
      const state = isValidState(raw.state as string)
        ? (raw.state as BoardState)
        : 'presentation';

      // Keep only the first valid marker; subsequent ones are stripped from text
      if (board !== null) return '';

      board = {
        lessonTitle: String(raw.lessonTitle),
        text: String(raw.text),
        state,
        level: String(raw.level ?? 'A1'),
        sectionIndex: Number(raw.sectionIndex ?? 1),
        sectionTotal: Number(raw.sectionTotal ?? 1),
      };

      return ''; // Remove marker from text
    } catch (e) {
      console.warn('[board-parser] Failed to parse JSON marker:', jsonStr, e);
      return ''; // Still remove the malformed marker so it doesn't leak into chat
    }
  }).trim();

  return { board, cleanText };
}
