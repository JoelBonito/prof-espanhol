import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";
import { markScheduleLogForSessionStart } from "./lib/scheduleWindow.js";

const MAX_SESSION_MS = 30 * 60 * 1000; // RN08

const CompleteChatSessionSchema = z.object({
  sessionId: z.string().min(1).max(128),
  durationMs: z.number().int().min(0).max(MAX_SESSION_MS),
  phonemesCorrected: z.array(z.string().min(1).max(40)).max(100),
  phonemesPending: z.array(z.string().min(1).max(40)).max(100),
  overallScore: z.number().int().min(0).max(100),
  totalCorrections: z.number().int().min(0).max(1000),
  messageCount: z.number().int().min(0).max(10000),
});

export const completeChatSession = onCall(
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
    const input = validateInput(CompleteChatSessionSchema, request.data ?? {});

    const db = getFirestore();
    const sessionRef = db.doc(`users/${uid}/sessions/${input.sessionId}`);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      throw new HttpsError("not-found", "Session not found.");
    }

    const sessionData = sessionSnap.data();
    if (sessionData?.status !== "active") {
      throw new HttpsError(
        "failed-precondition",
        "Session is not active. Cannot complete.",
      );
    }

    await sessionRef.update({
      status: "completed",
      durationMs: input.durationMs,
      phonemesCorrected: input.phonemesCorrected,
      phonemesPending: input.phonemesPending,
      overallScore: input.overallScore,
      totalCorrections: input.totalCorrections,
      messageCount: input.messageCount,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const startedAt = sessionData?.startedAt?.toDate?.();
    if (startedAt instanceof Date && !Number.isNaN(startedAt.getTime())) {
      await markScheduleLogForSessionStart({
        db,
        uid,
        sessionId: input.sessionId,
        sessionType: "chat",
        startedAt,
        toleranceWindowMinutes: 75,
      });
    }

    return { ok: true };
  },
);
