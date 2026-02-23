import { CallableRequest } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Verifies App Check token is present on the request.
 * Cloud Functions v2 with `enforceAppCheck: true` handles this automatically,
 * but this guard provides an explicit 403 for logging/debugging.
 */
export function requireAppCheck(request: CallableRequest): void {
  if (!request.app) {
    throw new HttpsError(
      "permission-denied",
      "Missing or invalid App Check token."
    );
  }
}
