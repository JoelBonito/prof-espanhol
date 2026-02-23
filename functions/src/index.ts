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

// Example: health check callable (demonstrates Zod + App Check)
const HealthCheckSchema = z.object({
  echo: z.string().min(1).max(100).optional(),
});

export const healthCheck = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const data = validateInput(HealthCheckSchema, request.data);

    return {
      status: "ok",
      uid: request.auth.uid,
      echo: data.echo ?? "pong",
      timestamp: new Date().toISOString(),
    };
  }
);
