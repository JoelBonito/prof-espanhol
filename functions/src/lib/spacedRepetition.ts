import { Timestamp } from "firebase-admin/firestore";

export const SM2_INTERVAL_LABELS = ["1h", "1d", "3d", "7d", "30d"] as const;
export type Sm2Interval = (typeof SM2_INTERVAL_LABELS)[number];

const SM2_INTERVAL_HOURS: Record<Sm2Interval, number> = {
  "1h": 1,
  "1d": 24,
  "3d": 72,
  "7d": 168,
  "30d": 720,
};

interface ProgressionInput {
  repetitionCount: number;
  score: number;
}

export interface ProgressionResult {
  status: "pending" | "completed" | "mastered";
  interval: Sm2Interval;
  repetitionCount: number;
  nextReviewAt: Timestamp | null;
  nextReviewDate: Timestamp | null;
  spacedRepetitionStep: number;
}

function nextTimestamp(interval: Sm2Interval): Timestamp {
  const nextMs = Date.now() + SM2_INTERVAL_HOURS[interval] * 60 * 60 * 1000;
  return Timestamp.fromMillis(nextMs);
}

export function processSpacedRepetition({
  repetitionCount,
  score,
}: ProgressionInput): ProgressionResult {
  // Fail path: restart the curve at 1h.
  if (score < 70) {
    const next = nextTimestamp("1h");
    return {
      status: "pending",
      interval: "1h",
      repetitionCount: 1,
      nextReviewAt: next,
      nextReviewDate: next,
      spacedRepetitionStep: 0,
    };
  }

  // Success path:
  // repetitionCount=0 => schedule 1h
  // repetitionCount=1 => schedule 1d
  // repetitionCount=2 => schedule 3d
  // repetitionCount=3 => schedule 7d
  // repetitionCount=4 => schedule 30d
  // repetitionCount>=5 with success => mastered
  if (repetitionCount >= 5) {
    return {
      status: "mastered",
      interval: "30d",
      repetitionCount: repetitionCount + 1,
      nextReviewAt: null,
      nextReviewDate: null,
      spacedRepetitionStep: 4,
    };
  }

  const nextIndex = Math.min(repetitionCount, SM2_INTERVAL_LABELS.length - 1);
  const interval = SM2_INTERVAL_LABELS[nextIndex];
  const next = nextTimestamp(interval);

  return {
    status: "completed",
    interval,
    repetitionCount: repetitionCount + 1,
    nextReviewAt: next,
    nextReviewDate: next,
    spacedRepetitionStep: nextIndex,
  };
}

