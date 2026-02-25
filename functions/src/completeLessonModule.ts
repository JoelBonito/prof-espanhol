import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

const REVIEW_INTERVAL_HOURS = [1, 24, 72, 168, 720] as const;

const ExerciseResultSchema = z.object({
  exerciseId: z.string().min(1).max(120),
  attempts: z.number().int().min(1).max(2),
  answer: z.string().max(300).optional(),
});

const NextModuleSchema = z
  .object({
    id: z.string().min(1).max(32),
    title: z.string().min(1).max(120),
    level: z.string().min(2).max(8),
  })
  .optional();

const InputSchema = z.object({
  moduleId: z.string().min(1).max(32),
  moduleTitle: z.string().min(1).max(120),
  level: z.string().min(2).max(8),
  totalBlocks: z.number().int().min(1).max(20),
  exerciseResults: z.array(ExerciseResultSchema).max(100),
  nextModule: NextModuleSchema,
});

interface CachedLessonData {
  lesson?: {
    exercises?: Array<{ id?: string; type?: string; answer?: string }>;
  };
}

function parseModuleId(moduleId: string): { track: string; order: number } | null {
  const match = /^([a-z]\d)-(\d+)$/i.exec(moduleId.trim());
  if (!match) return null;

  const order = Number.parseInt(match[2], 10);
  if (!Number.isFinite(order) || order <= 0) return null;

  return {
    track: match[1].toLowerCase(),
    order,
  };
}

function canUnlockNext(currentModuleId: string, nextModuleId: string): boolean {
  const current = parseModuleId(currentModuleId);
  const next = parseModuleId(nextModuleId);
  if (!current || !next) return false;

  return current.track === next.track && next.order === current.order + 1;
}

function scoreByAttempts(attempts: number, correct: boolean): number {
  if (correct && attempts === 1) return 100;
  if (correct) return 70;
  return 40;
}

function normalizeExerciseId(exerciseId: string): string {
  const colonIndex = exerciseId.lastIndexOf(":");
  const rawId = colonIndex >= 0 ? exerciseId.slice(colonIndex + 1) : exerciseId;
  return rawId.replace(/__retry$/, "");
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildReviewSchedule(
  weakExerciseIds: string[],
  previousSteps: Record<string, number>,
): Array<{ exerciseId: string; step: number; intervalHours: number; nextReviewAt: string }> {
  const now = Date.now();

  return weakExerciseIds.map((exerciseId) => {
    const prevStep = previousSteps[exerciseId];
    const step =
      typeof prevStep === "number" && Number.isFinite(prevStep)
        ? Math.min(prevStep + 1, REVIEW_INTERVAL_HOURS.length - 1)
        : 0;
    const intervalHours = REVIEW_INTERVAL_HOURS[step];
    const nextReviewAt = new Date(now + intervalHours * 60 * 60 * 1000).toISOString();

    return { exerciseId, step, intervalHours, nextReviewAt };
  });
}

export async function completeLessonModuleHandler(
  request: CallableRequest<unknown>,
  deps?: { db?: Pick<Firestore, "doc" | "batch"> },
) {
  requireAppCheck(request);

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const uid = request.auth.uid;
  const input = validateInput(InputSchema, request.data ?? {});
  const db = deps?.db ?? getFirestore();
  const lessonRef = db.doc(`users/${uid}/lessonProgress/${input.moduleId}`);
  const cacheRef = db.doc(`lessons/${uid}/cache/${input.moduleId}`);

  const [lessonSnap, cacheSnap] = await Promise.all([lessonRef.get(), cacheRef.get()]);
  const existing = (lessonSnap.data() ?? {}) as {
    reviewSchedule?: Array<{ exerciseId?: string; step?: number }>;
  };
  const cacheData = (cacheSnap.data() ?? {}) as CachedLessonData;
  const lessonExercises = cacheData.lesson?.exercises ?? [];
  const exerciseById = new Map(
    lessonExercises
      .filter(
        (item): item is { id: string; type: string; answer: string } =>
          typeof item.id === "string" &&
          typeof item.type === "string" &&
          typeof item.answer === "string",
      )
      .map((item) => [item.id, item] as const),
  );

  if (exerciseById.size === 0) {
    throw new HttpsError(
      "failed-precondition",
      "Lesson cache not found or invalid. Generate lesson first.",
    );
  }

  const previousSteps = (existing.reviewSchedule ?? []).reduce<Record<string, number>>(
    (acc, item) => {
      if (item.exerciseId && typeof item.step === "number") {
        acc[normalizeExerciseId(item.exerciseId)] = item.step;
      }
      return acc;
    },
    {},
  );

  const normalizedResults = input.exerciseResults.map((item) => {
    const canonicalExerciseId = normalizeExerciseId(item.exerciseId);
    const canonicalExercise = exerciseById.get(canonicalExerciseId);
    if (!canonicalExercise) {
      throw new HttpsError(
        "invalid-argument",
        `Exercise does not belong to lesson: ${item.exerciseId}`,
      );
    }

    const isObjectiveExercise =
      canonicalExercise.type === "multiple_choice" ||
      canonicalExercise.type === "fill_blank";
    const normalizedSubmitted = normalizeAnswer(item.answer ?? "");
    const normalizedExpected = normalizeAnswer(canonicalExercise.answer);
    const correct = isObjectiveExercise
      ? normalizedSubmitted.length > 0 && normalizedSubmitted === normalizedExpected
      : null;
    const score =
      correct === null ? null : scoreByAttempts(item.attempts, correct);

    return {
      exerciseId: item.exerciseId,
      canonicalExerciseId,
      type: canonicalExercise.type,
      attempts: item.attempts,
      answer: item.answer ?? null,
      correct,
      score,
      isObjectiveExercise,
    };
  });

  const scoreByExercise = normalizedResults.reduce<Record<string, number>>((acc, item) => {
    if (!item.isObjectiveExercise || item.score === null) return acc;
    const prev = acc[item.canonicalExerciseId];
    acc[item.canonicalExerciseId] = typeof prev === "number" ? Math.max(prev, item.score) : item.score;
    return acc;
  }, {});

  const canonicalScores = Object.values(scoreByExercise);
  const finalScore =
    canonicalScores.length > 0
      ? Math.round(canonicalScores.reduce((sum, score) => sum + score, 0) / canonicalScores.length)
      : 0;
  const weakExerciseIds = Object.entries(scoreByExercise)
    .filter(([, score]) => score < 70)
    .map(([exerciseId]) => exerciseId);
  const reviewSchedule = buildReviewSchedule(weakExerciseIds, previousSteps);
  const shouldUnlockNext =
    finalScore >= 60 &&
    !!input.nextModule &&
    canUnlockNext(input.moduleId, input.nextModule.id);

  const batch = db.batch();
  batch.set(
    lessonRef,
    {
      moduleTitle: input.moduleTitle,
      level: input.level,
      status: "completed",
      totalBlocks: input.totalBlocks,
      currentBlock: input.totalBlocks,
      score: finalScore,
      exerciseResults: normalizedResults,
      weakExercises: weakExerciseIds,
      reviewSchedule,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  if (shouldUnlockNext && input.nextModule) {
    const nextRef = db.doc(`users/${uid}/lessonProgress/${input.nextModule.id}`);
    batch.set(
      nextRef,
      {
        status: "available",
        unlocked: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  await batch.commit();

  return {
    ok: true,
    finalScore,
    unlockedNextModule: shouldUnlockNext,
    unlockedModuleId: shouldUnlockNext ? input.nextModule?.id : null,
  };
}

export const completeLessonModule = onCall(
  {
    enforceAppCheck: false,
    timeoutSeconds: 15,
  },
  (request) => completeLessonModuleHandler(request),
);
