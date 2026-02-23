"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
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