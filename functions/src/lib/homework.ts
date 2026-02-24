import { FieldValue, Firestore, Timestamp, WriteBatch } from "firebase-admin/firestore";
import type { Sm2Interval } from "./spacedRepetition.js";

export type HomeworkSourceType = "grammar" | "pronunciation" | "vocabulary";

const HOMEWORK_DEADLINE_HOURS = 48;
const SM2_INTERVAL_HOURS = [1, 24, 72, 168, 720] as const;

interface QueueHomeworkInput {
  db: Firestore;
  batch: WriteBatch;
  uid: string;
  homeworkId: string;
  sourceSessionId: string;
  sourceType: HomeworkSourceType;
  contentRef: string;
}

export function buildHomeworkDeadline(): Timestamp {
  const deadlineMs = Date.now() + HOMEWORK_DEADLINE_HOURS * 60 * 60 * 1000;
  return Timestamp.fromMillis(deadlineMs);
}

export function nextReviewTimestamp(step: number): Timestamp {
  const safeStep = Math.max(0, Math.min(step, SM2_INTERVAL_HOURS.length - 1));
  const nextMs = Date.now() + SM2_INTERVAL_HOURS[safeStep] * 60 * 60 * 1000;
  return Timestamp.fromMillis(nextMs);
}

export function queueHomework({
  db,
  batch,
  uid,
  homeworkId,
  sourceSessionId,
  sourceType,
  contentRef,
}: QueueHomeworkInput): void {
  const homeworkRef = db.doc(`users/${uid}/homework/${homeworkId}`);

  batch.set(
    homeworkRef,
    {
      sourceSessionId,
      sourceType,
      contentRef,
      status: "pending",
      score: null,
      deadline: buildHomeworkDeadline(),
      interval: "1h" as Sm2Interval,
      repetitionCount: 0,
      nextReviewAt: null,
      spacedRepetitionStep: 0,
      nextReviewDate: null,
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
      completedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
