"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.dispatchSchedulePushReminders = exports.resetAdapterOnDiagnosticCompleted = exports.runScheduleAdapterOnSessionCompleted = exports.processSpacedRepetitionOnHomeworkCompleted = exports.completeHomework = exports.checkHomeworkDeadlines = exports.generateHomeworkOnLessonCompleted = exports.evaluateAdaptiveSession = exports.completeChatSession = exports.createChatSession = exports.completeLessonModule = exports.generateLesson = exports.calculateDiagnosticResult = exports.analyzePronunciation = void 0;
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
const app_1 = require("firebase-admin/app");
const zod_1 = require("zod");
const validate_js_1 = require("./middleware/validate.js");
const appcheck_js_1 = require("./middleware/appcheck.js");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
// Global options for all 2nd gen functions
(0, options_1.setGlobalOptions)({
    region: "us-east1",
    maxInstances: 10,
});
// Pronunciation analysis (Story 1.4)
var analyzePronunciation_js_1 = require("./analyzePronunciation.js");
Object.defineProperty(exports, "analyzePronunciation", { enumerable: true, get: function () { return analyzePronunciation_js_1.analyzePronunciation; } });
// Diagnostic result calculation (Story 1.5)
var calculateDiagnosticResult_js_1 = require("./calculateDiagnosticResult.js");
Object.defineProperty(exports, "calculateDiagnosticResult", { enumerable: true, get: function () { return calculateDiagnosticResult_js_1.calculateDiagnosticResult; } });
// Lessons (Epic 3)
var generateLesson_js_1 = require("./generateLesson.js");
Object.defineProperty(exports, "generateLesson", { enumerable: true, get: function () { return generateLesson_js_1.generateLesson; } });
var completeLessonModule_js_1 = require("./completeLessonModule.js");
Object.defineProperty(exports, "completeLessonModule", { enumerable: true, get: function () { return completeLessonModule_js_1.completeLessonModule; } });
// Chat (Epic 2 & 7)
var createChatSession_js_1 = require("./createChatSession.js");
Object.defineProperty(exports, "createChatSession", { enumerable: true, get: function () { return createChatSession_js_1.createChatSession; } });
var completeChatSession_js_1 = require("./completeChatSession.js");
Object.defineProperty(exports, "completeChatSession", { enumerable: true, get: function () { return completeChatSession_js_1.completeChatSession; } });
var evaluateAdaptiveSession_js_1 = require("./evaluateAdaptiveSession.js");
Object.defineProperty(exports, "evaluateAdaptiveSession", { enumerable: true, get: function () { return evaluateAdaptiveSession_js_1.evaluateAdaptiveSession; } });
// Homework & Discipline (Epic 5)
var homeworkLifecycle_js_1 = require("./homeworkLifecycle.js");
Object.defineProperty(exports, "generateHomeworkOnLessonCompleted", { enumerable: true, get: function () { return homeworkLifecycle_js_1.generateHomeworkOnLessonCompleted; } });
Object.defineProperty(exports, "checkHomeworkDeadlines", { enumerable: true, get: function () { return homeworkLifecycle_js_1.checkHomeworkDeadlines; } });
Object.defineProperty(exports, "completeHomework", { enumerable: true, get: function () { return homeworkLifecycle_js_1.completeHomework; } });
Object.defineProperty(exports, "processSpacedRepetitionOnHomeworkCompleted", { enumerable: true, get: function () { return homeworkLifecycle_js_1.processSpacedRepetitionOnHomeworkCompleted; } });
// Adaptation & Scheduling (Epic 4 & 5)
var runScheduleAdapter_js_1 = require("./runScheduleAdapter.js");
Object.defineProperty(exports, "runScheduleAdapterOnSessionCompleted", { enumerable: true, get: function () { return runScheduleAdapter_js_1.runScheduleAdapterOnSessionCompleted; } });
Object.defineProperty(exports, "resetAdapterOnDiagnosticCompleted", { enumerable: true, get: function () { return runScheduleAdapter_js_1.resetAdapterOnDiagnosticCompleted; } });
var sendSchedulePushReminders_js_1 = require("./sendSchedulePushReminders.js");
Object.defineProperty(exports, "dispatchSchedulePushReminders", { enumerable: true, get: function () { return sendSchedulePushReminders_js_1.dispatchSchedulePushReminders; } });
// Health check
const HealthCheckSchema = zod_1.z.object({
    echo: zod_1.z.string().min(1).max(100).optional(),
});
exports.healthCheck = (0, https_1.onCall)({ enforceAppCheck: false }, async (request) => {
    (0, appcheck_js_1.requireAppCheck)(request);
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    const data = (0, validate_js_1.validateInput)(HealthCheckSchema, request.data);
    return {
        status: "ok",
        uid: request.auth.uid,
        echo: data.echo ?? "pong",
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=index.js.map