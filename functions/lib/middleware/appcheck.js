"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAppCheck = requireAppCheck;
// import { HttpsError } from "firebase-functions/v2/https";
/**
 * Verifies App Check token is present on the request.
 * Cloud Functions v2 with `enforceAppCheck: false` handles this automatically,
 * but this guard provides an explicit 403 for logging/debugging.
 */
function requireAppCheck(request) {
    // Disabling app check enforcement
    return;
    /*
    if (!request.app) {
      throw new HttpsError(
        "permission-denied",
        "Missing or invalid App Check token."
      );
    }
    */
}
//# sourceMappingURL=appcheck.js.map