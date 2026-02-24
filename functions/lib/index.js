"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.resetAdapterOnDiagnosticCompleted = exports.completeLessonModule = exports.generateLesson = exports.calculateDiagnosticResult = exports.analyzePronunciation = void 0;
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
var generateLesson_js_1 = require("./generateLesson.js");
Object.defineProperty(exports, "generateLesson", { enumerable: true, get: function () { return generateLesson_js_1.generateLesson; } });
var completeLessonModule_js_1 = require("./completeLessonModule.js");
Object.defineProperty(exports, "completeLessonModule", { enumerable: true, get: function () { return completeLessonModule_js_1.completeLessonModule; } });
var runScheduleAdapter_js_1 = require("./runScheduleAdapter.js");
Object.defineProperty(exports, "resetAdapterOnDiagnosticCompleted", { enumerable: true, get: function () { return runScheduleAdapter_js_1.resetAdapterOnDiagnosticCompleted; } });
// Example: health check callable (demonstrates Zod + App Check)
const HealthCheckSchema = zod_1.z.object({
    echo: zod_1.z.string().min(1).max(100).optional(),
});
exports.healthCheck = (0, https_1.onCall)({ enforceAppCheck: true }, async (request) => {
    (0, appcheck_js_1.requireAppCheck)(request);
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const data = (0, validate_js_1.validateInput)(HealthCheckSchema, request.data);
    return {
        status: "ok",
        uid: request.auth.uid,
        echo: data.echo ?? "pong",
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=index.js.map