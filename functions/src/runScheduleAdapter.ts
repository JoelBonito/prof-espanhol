import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type {
  AdapterArea,
  AdapterZone,
  Diagnostic,
  Session,
  SpanishLevel,
  UserProfile,
} from "./types/firestore.js";
import { queueHomework } from "./lib/homework.js";

const ADAPTER_AREAS: AdapterArea[] = ["grammar", "pronunciation", "vocabulary"];
const DEFAULT_ZONE: AdapterZone = "ideal";
const WINDOW_DEFAULT = 5;
const WINDOW_ERRATIC = 7;
const MIN_SESSIONS = 3;
const CONSECUTIVE_SESSIONS_THRESHOLD = 3;

const DIFFICULTY_STEPS = [
  "A1-low",
  "A1-mid",
  "A1-high",
  "A2-low",
  "A2-mid",
  "A2-high",
  "B1-low",
  "B1-mid",
  "B1-high",
  "B2-low",
  "B2-mid",
  "B2-high",
  "C1-low",
  "C1-mid",
  "C1-high",
] as const;

type DifficultyStep = (typeof DIFFICULTY_STEPS)[number];

function scoreToZone(score: number): AdapterZone {
  if (score > 80) return "tooEasy";
  if (score >= 60) return "ideal";
  return "tooHard";
}

function zoneWeight(zone: AdapterZone): number {
  if (zone === "tooHard") return 0;
  if (zone === "ideal") return 1;
  return 2;
}

function computeAdjustment(
  previousZone: AdapterZone,
  newZone: AdapterZone,
): "increased" | "maintained" | "decreased" {
  const prevWeight = zoneWeight(previousZone);
  const nextWeight = zoneWeight(newZone);
  if (nextWeight > prevWeight) return "increased";
  if (nextWeight < prevWeight) return "decreased";
  return "maintained";
}

function safeScore(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function baseStateFromLevel(level: SpanishLevel | null | undefined): Record<AdapterArea, AdapterZone> {
  // Under MIN_SESSIONS we keep a neutral baseline tied to diagnostic completion.
  // We do not adapt difficulty yet.
  void level;
  return {
    grammar: DEFAULT_ZONE,
    pronunciation: DEFAULT_ZONE,
    vocabulary: DEFAULT_ZONE,
  };
}

function isErratic(scores: number[]): boolean {
  if (scores.length < 3) return false;

  for (let index = 1; index < scores.length; index += 1) {
    const delta = Math.abs(scores[index - 1] - scores[index]);
    if (delta > 20) {
      return true;
    }
  }

  return false;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function pickRecentCompletedSessions(sessions: Session[]): Session[] {
  return sessions
    .filter((session) => session.status === "completed")
    .slice(0, WINDOW_ERRATIC);
}

function getAreaScores(sessions: Session[], area: AdapterArea): number[] {
  return sessions.map((session) => {
    const overall = safeScore(session.overallScore, 70);
    if (area === "grammar") return safeScore(session.grammarScore, overall);
    if (area === "pronunciation") return safeScore(session.pronunciationScore, overall);
    return safeScore(session.vocabularyScore, overall);
  });
}

function levelToMidDifficulty(level: SpanishLevel | null | undefined): DifficultyStep {
  const normalized = (level ?? "A1").toUpperCase() as SpanishLevel;
  return `${normalized}-mid` as DifficultyStep;
}

function normalizeDifficulty(value: unknown, fallbackLevel: SpanishLevel | null | undefined): DifficultyStep {
  if (typeof value === "string" && DIFFICULTY_STEPS.includes(value as DifficultyStep)) {
    return value as DifficultyStep;
  }
  return levelToMidDifficulty(fallbackLevel);
}

function shiftDifficulty(current: DifficultyStep, delta: -1 | 0 | 1): DifficultyStep {
  if (delta === 0) return current;
  const index = DIFFICULTY_STEPS.indexOf(current);
  if (index < 0) return current;
  const nextIndex = Math.min(
    DIFFICULTY_STEPS.length - 1,
    Math.max(0, index + delta),
  );
  return DIFFICULTY_STEPS[nextIndex];
}

function recentZonesByArea(sessions: Session[], area: AdapterArea): AdapterZone[] {
  return sessions.map((session) => {
    const overall = safeScore(session.overallScore, 70);
    const score =
      area === "grammar"
        ? safeScore(session.grammarScore, overall)
        : area === "pronunciation"
          ? safeScore(session.pronunciationScore, overall)
          : safeScore(session.vocabularyScore, overall);
    return scoreToZone(score);
  });
}

function consecutiveCount(zones: AdapterZone[]): number {
  if (zones.length === 0) return 0;
  const first = zones[0];
  let count = 1;
  for (let index = 1; index < zones.length; index += 1) {
    if (zones[index] !== first) break;
    count += 1;
  }
  return count;
}

function adjustmentDelta(zones: AdapterZone[]): -1 | 0 | 1 {
  if (zones.length < CONSECUTIVE_SESSIONS_THRESHOLD) return 0;
  const streak = consecutiveCount(zones);
  if (streak < CONSECUTIVE_SESSIONS_THRESHOLD) return 0;
  if (zones[0] === "tooEasy") return 1;
  if (zones[0] === "tooHard") return -1;
  return 0;
}

export const runScheduleAdapterOnSessionCompleted = onDocumentUpdated(
  {
    document: "users/{uid}/sessions/{sessionId}",
    region: "us-east1",
  },
  async (event) => {
    const beforeData = event.data?.before.data() as Session | undefined;
    const afterData = event.data?.after.data() as Session | undefined;
    const uid = event.params.uid;
    const sessionId = event.params.sessionId;

    if (!beforeData || !afterData) return;
    if (beforeData.status === "completed") return;
    if (afterData.status !== "completed") return;

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);
    const sessionRef = db.doc(`users/${uid}/sessions/${sessionId}`);

    const [userSnap, sessionsSnap] = await Promise.all([
      userRef.get(),
      db
        .collection(`users/${uid}/sessions`)
        .orderBy("completedAt", "desc")
        .limit(15)
        .get(),
    ]);

    if (!userSnap.exists) return;

    const profile = userSnap.data() as UserProfile;
    const prevState = profile.adapterState ?? baseStateFromLevel(profile.level);
    const previousDifficultyMap = ((profile as unknown) as Record<string, unknown>).currentDifficulty as
      | Record<string, unknown>
      | undefined;

    const previousDifficulty: Record<AdapterArea, DifficultyStep> = {
      grammar: normalizeDifficulty(previousDifficultyMap?.grammar, profile.level),
      pronunciation: normalizeDifficulty(previousDifficultyMap?.pronunciation, profile.level),
      vocabulary: normalizeDifficulty(previousDifficultyMap?.vocabulary, profile.level),
    };

    const sessions = sessionsSnap.docs
      .map((doc) => doc.data() as Session)
      .filter((session) => session.completedAt != null);

    const recentCompleted = pickRecentCompletedSessions(sessions);

    // RN17/RF05: with less than 3 sessions, do not adapt yet.
    if (recentCompleted.length < MIN_SESSIONS) {
      const baseline = baseStateFromLevel(profile.level);
      await Promise.all([
        userRef.set(
          {
            adapterState: profile.adapterState ?? baseline,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        ),
        sessionRef.set(
          {
            adapterSnapshot: profile.adapterState ?? baseline,
            adapterMeta: {
              mode: "diagnostic_fallback",
              sessionsConsidered: recentCompleted.length,
            },
          },
          { merge: true },
        ),
      ]);
      return;
    }

    const allOverallScores = recentCompleted.map((session) =>
      safeScore(session.overallScore, 70),
    );
    const useErraticWindow = isErratic(allOverallScores);
    const windowSize = useErraticWindow ? WINDOW_ERRATIC : WINDOW_DEFAULT;
    const windowedSessions = recentCompleted.slice(0, windowSize);

    const areaAverages: Record<AdapterArea, number> = {
      grammar: average(getAreaScores(windowedSessions, "grammar")),
      pronunciation: average(getAreaScores(windowedSessions, "pronunciation")),
      vocabulary: average(getAreaScores(windowedSessions, "vocabulary")),
    };

    const nextState: Record<AdapterArea, AdapterZone> = {
      grammar: scoreToZone(areaAverages.grammar),
      pronunciation: scoreToZone(areaAverages.pronunciation),
      vocabulary: scoreToZone(areaAverages.vocabulary),
    };

    const zoneSequence: Record<AdapterArea, AdapterZone[]> = {
      grammar: recentZonesByArea(windowedSessions, "grammar"),
      pronunciation: recentZonesByArea(windowedSessions, "pronunciation"),
      vocabulary: recentZonesByArea(windowedSessions, "vocabulary"),
    };

    const nextDifficulty: Record<AdapterArea, DifficultyStep> = {
      grammar: shiftDifficulty(previousDifficulty.grammar, adjustmentDelta(zoneSequence.grammar)),
      pronunciation: shiftDifficulty(previousDifficulty.pronunciation, adjustmentDelta(zoneSequence.pronunciation)),
      vocabulary: shiftDifficulty(previousDifficulty.vocabulary, adjustmentDelta(zoneSequence.vocabulary)),
    };

    const batch = db.batch();

    batch.set(
      userRef,
      {
        adapterState: nextState,
        currentDifficulty: nextDifficulty,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    batch.set(
      sessionRef,
      {
        adapterSnapshot: nextState,
        adapterMeta: {
          mode: useErraticWindow ? "moving_average_7" : "moving_average_5",
          sessionsConsidered: windowedSessions.length,
          consecutiveThreshold: CONSECUTIVE_SESSIONS_THRESHOLD,
        },
      },
      { merge: true },
    );

    for (const area of ADAPTER_AREAS) {
      const previousZone = prevState[area] ?? DEFAULT_ZONE;
      const newZone = nextState[area];
      const adjustment = computeAdjustment(previousZone, newZone);
      const difficultyBefore = previousDifficulty[area];
      const difficultyAfter = nextDifficulty[area];

      batch.set(db.collection(`users/${uid}/adaptations`).doc(), {
        triggerSessionId: sessionId,
        area,
        previousZone,
        newZone,
        recentAccuracy: areaAverages[area],
        adjustment,
        reason: useErraticWindow
          ? `session_${afterData.type}_completed_ma7`
          : `session_${afterData.type}_completed_ma5`,
        zoneStreak: consecutiveCount(zoneSequence[area]),
        difficultyBefore,
        difficultyAfter,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Story 4.2 requires history with timestamp, reason and zone transition.
      batch.set(
        userRef,
        {
          adapterHistory: FieldValue.arrayUnion({
            date: new Date().toISOString(),
            area,
            zone: newZone,
            previousZone,
            adjustment,
            reason: useErraticWindow
              ? "session_completed_erratic_ma7"
              : "session_completed_ma5",
            difficultyBefore,
            difficultyAfter,
          }),
        },
        { merge: true },
      );

      if (areaAverages[area] < 70) {
        queueHomework({
          db,
          batch,
          uid,
          homeworkId: `${sessionId}_${area}`,
          sourceSessionId: sessionId,
          sourceType: area,
          contentRef: `reinforcement:${area}:${sessionId}`,
        });
      }
    }

    await batch.commit();
  },
);

export const resetAdapterOnDiagnosticCompleted = onDocumentUpdated(
  {
    document: "users/{uid}/diagnostics/{diagnosticId}",
    region: "us-east1",
  },
  async (event) => {
    const beforeData = event.data?.before.data() as Diagnostic | undefined;
    const afterData = event.data?.after.data() as Diagnostic | undefined;
    const uid = event.params.uid;
    const diagnosticId = event.params.diagnosticId;

    if (!beforeData || !afterData) return;
    if (beforeData.status === "completed") return;
    if (afterData.status !== "completed") return;

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return;

    const profile = userSnap.data() as UserProfile;
    const newLevel = afterData.levelAssigned ?? profile.level ?? "A1";
    const prevDifficultyMap = ((profile as unknown) as Record<string, unknown>).currentDifficulty as
      | Record<string, unknown>
      | undefined;
    const currentDifficulty = normalizeDifficulty(prevDifficultyMap?.grammar, profile.level);
    const levelPrefix = currentDifficulty.split("-")[0] as SpanishLevel;

    if (levelPrefix === newLevel) return;

    const resetDifficulty = levelToMidDifficulty(newLevel);
    const resetState = baseStateFromLevel(newLevel);

    await userRef.set(
      {
        adapterState: resetState,
        currentDifficulty: {
          grammar: resetDifficulty,
          pronunciation: resetDifficulty,
          vocabulary: resetDifficulty,
        },
        adapterHistory: FieldValue.arrayUnion({
          date: new Date().toISOString(),
          area: "all",
          zone: "ideal",
          previousZone: "ideal",
          adjustment: "maintained",
          reason: "diagnostic_level_reset",
          previousDifficulty: currentDifficulty,
          newDifficulty: resetDifficulty,
          diagnosticId,
        }),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  },
);
