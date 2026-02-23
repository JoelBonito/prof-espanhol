"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = validateInput;
const https_1 = require("firebase-functions/v2/https");
/**
 * Validates input against a Zod schema.
 * Throws HttpsError with INVALID_ARGUMENT if validation fails.
 */
function validateInput(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const messages = result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        throw new https_1.HttpsError("invalid-argument", `Validation failed: ${messages}`);
    }
    return result.data;
}
//# sourceMappingURL=validate.js.map