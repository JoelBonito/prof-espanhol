/**
 * Parse CORRECTION_JSON markers from Gemini text responses.
 *
 * The system prompt instructs Gemini to emit structured correction data as:
 *   [CORRECTION_JSON:{"phoneme":"rr","expected":"perro","heard":"pero","score":45}]
 *
 * This parser extracts those markers, returning the clean text and parsed corrections.
 */

export interface ParsedCorrection {
  phoneme: string;
  expected: string;
  heard: string;
  score: number;
}

export interface ParseResult {
  cleanText: string;
  corrections: ParsedCorrection[];
}

const CORRECTION_REGEX = /\[CORRECTION_JSON:\s*(\{[^}]+\})\s*\]/g;

export function parseCorrectionMarkers(text: string): ParseResult {
  const corrections: ParsedCorrection[] = [];

  const cleanText = text.replace(CORRECTION_REGEX, (_, jsonStr: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      if (obj.phoneme && obj.expected && obj.heard && typeof obj.score === 'number') {
        corrections.push({
          phoneme: String(obj.phoneme),
          expected: String(obj.expected),
          heard: String(obj.heard),
          score: Number(obj.score),
        });
      }
    } catch {
      // Malformed JSON — skip marker, keep text
    }
    return '';
  }).trim();

  return { cleanText, corrections };
}
