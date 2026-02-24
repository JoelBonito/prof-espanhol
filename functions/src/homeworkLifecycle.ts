import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { requireAppCheck } from "./middleware/appcheck.js";
import { validateInput } from "./middleware/validate.js";
import { queueHomework } from "./lib/homework.js";
import { processSpacedRepetition } from "./lib/spacedRepetition.js";

type LessonExerciseType = "flashcard" | "multiple_choice" | "fill_blank";

const COMPLETE_HOMEWORK_SCHEMA = z.object({
  homeworkId: z.string().min(1),
  score: z.number().int().min(0).max(100),
});

function mapExerciseTypeToSource(type: LessonExerciseType): "grammar" | "vocabulary" {
  if (type === "fill_blank") return "grammar";
  return "vocabulary";
}

function getUidFromPath(path: string): string | null {
  const parts = path.split("/");
  const usersIndex = parts.indexOf("users");
  if (usersIndex < 0 || usersIndex + 1 >= parts.length) return null;
  return parts[usersIndex + 1];
}

export const generateHomeworkOnLessonCompleted = onDocumentUpdated(
  {
    document: "users/{uid}/lessonProgress/{lessonId}",
    region: "us-east1",
  },
  async (event) => {
    const beforeData = event.data?.before.data() as Record<string, unknown> | undefined;
    const afterData = event.data?.after.data() as Record<string, unknown> | undefined;
    const uid = event.params.uid;
    const lessonId = event.params.lessonId;

    if (!afterData) return;
    if (beforeData?.status === "completed") return;
    if (afterData.status !== "completed") return;
    if (typeof afterData.score !== "number" || afterData.score >= 70) return;

    const exerciseResults = Array.isArray(afterData.exerciseResults)
      ? afterData.exerciseResults
      : [];

    let weakestType: LessonExerciseType = "fill_blank";
    let weakestScore = Number.POSITIVE_INFINITY;

    for (const item of exerciseResults) {
      if (!item || typeof item !== "object") continue;
      const value = item as Record<string, unknown>;
      if (
        typeof value.type === "string" &&
        (value.type === "flashcard" ||
          value.type === "multiple_choice" ||
          value.type === "fill_blank") &&
        typeof value.score === "number" &&
        value.score < weakestScore
      ) {
        weakestType = value.type;
        weakestScore = value.score;
      }
    }

    const sourceType = mapExerciseTypeToSource(weakestType);
    const db = getFirestore();
    const batch = db.batch();

    queueHomework({
      db,
      batch,
      uid,
      homeworkId: `lesson_${lessonId}`,
      sourceSessionId: `lesson:${lessonId}`,
      sourceType,
      contentRef: `lesson:${lessonId}:reinforcement:${sourceType}`,
    });

    await batch.commit();
  },
);

export const checkHomeworkDeadlines = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "America/Asuncion",
    region: "us-east1",
  },
  async () => {
    const db = getFirestore();
    const now = Timestamp.now();

    const overdueSnap = await db
      .collectionGroup("homework")
      .where("status", "==", "pending")
      .where("deadline", "<=", now)
      .get();

    for (const docSnap of overdueSnap.docs) {
      const data = docSnap.data() as Record<string, unknown>;
      const uid = getUidFromPath(docSnap.ref.path);
      if (!uid) continue;

      const contentRef =
        typeof data.contentRef === "string" ? data.contentRef : "reinforcement:unknown";

      await docSnap.ref.set(
        {
          status: "overdue",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await db.doc(`users/${uid}`).set(
        {
          adherenceScore: FieldValue.increment(-1),
          homeworkPriorityQueue: FieldValue.arrayUnion(contentRef),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await db.collection(`users/${uid}/scheduleAlerts`).add({
        reason: "homework_overdue",
        contentRef,
        homeworkRef: docSnap.ref.path,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  },
);

export const completeHomework = onCall(
  {
    enforceAppCheck: true,
    timeoutSeconds: 15,
  },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const { homeworkId, score } = validateInput(COMPLETE_HOMEWORK_SCHEMA, request.data ?? {});
    const db = getFirestore();
    const homeworkRef = db.doc(`users/${uid}/homework/${homeworkId}`);
    const homeworkSnap = await homeworkRef.get();

    if (!homeworkSnap.exists) {
      throw new HttpsError("not-found", "Homework not found.");
    }

    const homework = homeworkSnap.data() as Record<string, unknown>;
    const currentStatus = (homework.status as string | undefined) ?? "pending";
    const step =
      typeof homework.spacedRepetitionStep === "number"
        ? homework.spacedRepetitionStep
        : 0;
    const repetitionCount =
      typeof homework.repetitionCount === "number"
        ? homework.repetitionCount
        : Math.max(0, step);
    const attempts = typeof homework.attempts === "number" ? homework.attempts : 0;
    const contentRef =
      typeof homework.contentRef === "string" ? homework.contentRef : "reinforcement:unknown";

    const progression = processSpacedRepetition({ repetitionCount, score });
    const lateCredit = currentStatus === "overdue" ? 0.5 : 1;

    await Promise.all([
      homeworkRef.set(
        {
          status: progression.status,
          score,
          attempts: attempts + 1,
          interval: progression.interval,
          repetitionCount: progression.repetitionCount,
          spacedRepetitionStep: progression.spacedRepetitionStep,
          nextReviewAt: progression.nextReviewAt,
          nextReviewDate: progression.nextReviewDate,
          completedAt:
            score >= 70 ? FieldValue.serverTimestamp() : homework.completedAt ?? null,
          masteredAt:
            progression.status === "mastered" ? FieldValue.serverTimestamp() : null,
          sm2ProcessedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
      db.doc(`users/${uid}`).set(
        {
          adherenceScore:
            score >= 70 ? FieldValue.increment(lateCredit) : FieldValue.increment(0),
          homeworkPriorityQueue:
            progression.status === "mastered"
              ? FieldValue.arrayRemove(contentRef)
              : FieldValue.arrayUnion(contentRef),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
    ]);

    return {
      ok: true,
      status: progression.status,
      accepted: score >= 70,
      creditApplied: score >= 70 ? lateCredit : 0,
    };
  },
);

export const processSpacedRepetitionOnHomeworkCompleted = onDocumentUpdated(
  {
    document: "users/{uid}/homework/{homeworkId}",
    region: "us-east1",
  },
  async (event) => {
    const before = event.data?.before.data() as Record<string, unknown> | undefined;
    const after = event.data?.after.data() as Record<string, unknown> | undefined;
    const uid = event.params.uid;
    const homeworkId = event.params.homeworkId;

    if (!before || !after) return;
    if (before.status === "completed" || after.status !== "completed") return;
    if (typeof after.score !== "number") return;
    if ("sm2ProcessedAt" in after) return;

    const repetitionCount =
      typeof after.repetitionCount === "number"
        ? after.repetitionCount
        : typeof after.spacedRepetitionStep === "number"
          ? after.spacedRepetitionStep
          : 0;

    const progression = processSpacedRepetition({
      repetitionCount,
      score: after.score,
    });

    const db = getFirestore();
    await db.doc(`users/${uid}/homework/${homeworkId}`).set(
      {
        status: progression.status,
        interval: progression.interval,
        repetitionCount: progression.repetitionCount,
        spacedRepetitionStep: progression.spacedRepetitionStep,
        nextReviewAt: progression.nextReviewAt,
        nextReviewDate: progression.nextReviewDate,
        masteredAt:
          progression.status === "mastered" ? FieldValue.serverTimestamp() : null,
        sm2ProcessedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  },
);
