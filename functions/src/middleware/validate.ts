import { ZodSchema } from "zod";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Validates input against a Zod schema.
 * Throws HttpsError with INVALID_ARGUMENT if validation fails.
 */
export function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpsError("invalid-argument", `Validation failed: ${messages}`);
  }
  return result.data;
}
