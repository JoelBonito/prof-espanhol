"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAppCheck = requireAppCheck;
const https_1 = require("firebase-functions/v2/https");
/**
 * Verifies App Check token is present on the request.
 * Cloud Functions v2 with `enforceAppCheck: true` handles this automatically,
 * but this guard provides an explicit 403 for logging/debugging.
 */
function requireAppCheck(request) {
    if (!request.app) {
        throw new https_1.HttpsError("permission-denied", "Missing or invalid App Check token.");
    }
}
//# sourceMappingURL=appcheck.js.map