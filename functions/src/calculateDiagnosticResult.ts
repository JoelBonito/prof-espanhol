import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";
import type { SpanishLevel } from "./types/firestore.js";

const InputSchema = z.object({
  diagnosticId: z.string().min(1),
});

// CEFR thresholds per story spec (0-20=A1, 21-40=A2, 41-60=B1, 61-80=B2, 81-100=C1)
// Tie-breaking: lower level wins (boundary belongs to lower level)
function scoreToLevel(score: number): SpanishLevel {
  if (score <= 20) return "A1";
  if (score <= 40) return "A2";
  if (score <= 60) return "B1";
  if (score <= 80) return "B2";
  return "C1";
}

function deriveStrengths(
  grammarScore: number,
  listeningScore: number,
  pronunciationScore: number,
): string[] {
  const strengths: string[] = [];
  if (grammarScore >= 70) strengths.push("Gramática sólida");
  if (listeningScore >= 70) strengths.push("Boa compreensão auditiva");
  if (pronunciationScore >= 70) strengths.push("Boa pronúncia");
  return strengths;
}

function deriveWeaknesses(
  grammarScore: number,
  listeningScore: number,
  pronunciationScore: number,
): string[] {
  const weaknesses: string[] = [];
  if (grammarScore < 50) weaknesses.push("Gramática precisa de atenção");
  if (listeningScore < 50) weaknesses.push("Compreensão auditiva precisa de prática");
  if (pronunciationScore < 50) weaknesses.push("Pronúncia precisa de atenção");
  return weaknesses;
}

export const calculateDiagnosticResult = onCall(
  {
    enforceAppCheck: false,
    timeoutSeconds: 30,
  },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const { diagnosticId } = validateInput(InputSchema, request.data);

    const db = getFirestore();
    const diagnosticRef = db.doc(`users/${uid}/diagnostics/${diagnosticId}`);
    const diagnosticSnap = await diagnosticRef.get();

    if (!diagnosticSnap.exists) {
      throw new HttpsError("not-found", "Diagnostic session not found.");
    }

    const data = diagnosticSnap.data()!;

    // Read scores, fall back to 0 if missing
    const grammarScore: number = data.grammarScore ?? 0;
    const listeningScore: number = data.listeningScore ?? 0;
    const pronunciationScore: number = data.pronunciationScore ?? 0;
    const phonemesToWork: string[] = data.phonemesToWork ?? [];

    // Weighted score: grammar 30% + listening 30% + pronunciation 40%
    const overallScore = Math.round(
      grammarScore * 0.3 + listeningScore * 0.3 + pronunciationScore * 0.4,
    );

    const levelAssigned = scoreToLevel(overallScore);
    const strengths = deriveStrengths(grammarScore, listeningScore, pronunciationScore);
    const weaknesses = deriveWeaknesses(grammarScore, listeningScore, pronunciationScore);
    const completedAt = Timestamp.now();

    // Batch write
    const batch = db.batch();

    // Update diagnostic doc
    batch.set(
      diagnosticRef,
      {
        overallScore,
        levelAssigned,
        strengths,
        weaknesses,
        status: "completed",
        completedAt,
      },
      { merge: true },
    );

    // Update user profile (write-protected — only CF via Admin SDK per G-SEC-11)
    const userRef = db.doc(`users/${uid}`);
    batch.set(
      userRef,
      {
        level: levelAssigned,
        levelScore: overallScore,
        grammarScore,
        listeningScore,
        speakingScore: pronunciationScore,
        weakPhonemes: phonemesToWork,
        diagnosticDate: completedAt,
        diagnosticCompleted: true,
        lastDiagnosticDate: completedAt,
        updatedAt: completedAt,
      },
      { merge: true },
    );

    await batch.commit();

    return {
      overallScore,
      level: levelAssigned,
      grammarScore,
      listeningScore,
      pronunciationScore,
      strengths,
      weaknesses,
      phonemesToWork,
    };
  },
);
