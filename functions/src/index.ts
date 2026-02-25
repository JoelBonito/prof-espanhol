import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { initializeApp } from "firebase-admin/app";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

// Initialize Firebase Admin
initializeApp();

// Global options for all 2nd gen functions
setGlobalOptions({
  region: "us-east1",
  maxInstances: 10,
});

// Pronunciation analysis (Story 1.4)
export { analyzePronunciation } from "./analyzePronunciation.js";

// Diagnostic result calculation (Story 1.5)
export { calculateDiagnosticResult } from "./calculateDiagnosticResult.js";

// Lessons (Epic 3)
export { generateLesson } from "./generateLesson.js";
export { completeLessonModule } from "./completeLessonModule.js";

// Chat (Epic 2 & 7)
export { createChatSession } from "./createChatSession.js";
export { completeChatSession } from "./completeChatSession.js";
export { evaluateAdaptiveSession } from "./evaluateAdaptiveSession.js";

// Homework & Discipline (Epic 5)
export {
  generateHomeworkOnLessonCompleted,
  checkHomeworkDeadlines,
  completeHomework,
  processSpacedRepetitionOnHomeworkCompleted
} from "./homeworkLifecycle.js";

// Adaptation & Scheduling (Epic 4 & 5)
export {
  runScheduleAdapterOnSessionCompleted,
  resetAdapterOnDiagnosticCompleted
} from "./runScheduleAdapter.js";

export { dispatchSchedulePushReminders } from "./sendSchedulePushReminders.js";

// Health check
const HealthCheckSchema = z.object({
  echo: z.string().min(1).max(100).optional(),
});

export const healthCheck = onCall(
  { enforceAppCheck: false },
  async (request) => {
    requireAppCheck(request);
    if (!request.auth) throw new HttpsError("unauthenticated", "Authentication required.");
    const data = validateInput(HealthCheckSchema, request.data);
    return {
      status: "ok",
      uid: request.auth.uid,
      echo: data.echo ?? "pong",
      timestamp: new Date().toISOString(),
    };
  }
);
