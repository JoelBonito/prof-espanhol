import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const EVALUATION_MODEL = "gemini-3-flash-preview";

const ChatMessageSchema = z.object({
  role: z.enum(["tutor", "user"]),
  text: z.string().min(1).max(4000),
  timestamp: z.number().int().nonnegative(),
});

const CorrectionSchema = z.object({
  phoneme: z.string().min(1).max(40),
  expected: z.string().min(1).max(120),
  heard: z.string().min(1).max(120),
  score: z.number().int().min(0).max(100),
  attempt: z.number().int().min(1).max(10),
  accepted: z.boolean(),
});

const InputSchema = z.object({
  sessionId: z.string().min(1).max(128),
  durationMs: z.number().int().min(0).max(30 * 60 * 1000),
  overallScore: z.number().int().min(0).max(100),
  messages: z.array(ChatMessageSchema).max(120),
  corrections: z.array(CorrectionSchema).max(600),
});

const DimensionSchema = z.object({
  pronunciation: z.number().int().min(0).max(100),
  fluency: z.number().int().min(0).max(100),
  comprehension: z.number().int().min(0).max(100),
  grammar: z.number().int().min(0).max(100),
  vocabulary: z.number().int().min(0).max(100),
});

const EvaluationSchema = z.object({
  estimatedLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
  confidence: z.number().min(0).max(1),
  dimensions: DimensionSchema,
  strengths: z.array(z.string().min(1).max(200)).min(1).max(5),
  priorityFocus: z.array(z.string().min(1).max(200)).min(1).max(5),
  nextLesson: z.object({
    phase: z.enum(["listening", "reading", "pronunciation", "translation", "conversation"]),
    instructionPtBr: z.string().min(1).max(400),
    promptEsPy: z.string().min(1).max(400),
  }),
  languageContract: z.object({
    tutorSpeech: z.literal("es-PY"),
    metaInstructions: z.literal("pt-BR"),
  }),
});

function extractGeminiText(json: unknown): string {
  const root = json as Record<string, unknown>;
  const candidates = root.candidates as Array<Record<string, unknown>> | undefined;
  const firstCandidate = Array.isArray(candidates) ? candidates[0] : undefined;
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;
  const firstPart = Array.isArray(parts) ? parts[0] : undefined;
  const text = firstPart?.text;
  return typeof text === "string" ? text : "";
}

function parseJsonResponse(raw: string): unknown {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export const evaluateAdaptiveSession = onCall(
  {
    cors: true,
    enforceAppCheck: false,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const input = validateInput(InputSchema, request.data ?? {});
    const uid = request.auth.uid;
    const db = getFirestore();

    const sessionRef = db.doc(`users/${uid}/sessions/${input.sessionId}`);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      throw new HttpsError("not-found", "Session not found.");
    }
    const sessionData = sessionSnap.data() as
      | {
          status?: string;
          durationMs?: number;
          overallScore?: number;
          messageCount?: number;
          totalCorrections?: number;
        }
      | undefined;
    if (sessionData?.status !== "completed") {
      throw new HttpsError("failed-precondition", "Session must be completed before evaluation.");
    }
    if (
      typeof sessionData.durationMs === "number" &&
      typeof sessionData.overallScore === "number" &&
      (sessionData.durationMs !== input.durationMs || sessionData.overallScore !== input.overallScore)
    ) {
      throw new HttpsError("invalid-argument", "Session metrics mismatch.");
    }
    if (
      typeof sessionData.messageCount === "number" &&
      sessionData.messageCount !== input.messages.filter((item) => item.role === "user").length
    ) {
      throw new HttpsError("invalid-argument", "Message count mismatch.");
    }
    if (
      typeof sessionData.totalCorrections === "number" &&
      sessionData.totalCorrections !== input.corrections.length
    ) {
      throw new HttpsError("invalid-argument", "Corrections count mismatch.");
    }

    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const userLevel = userSnap.exists ? (userSnap.data()?.level as string | undefined) ?? "A1" : "A1";

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key not configured.");
    }

    const prompt = `Você é um avaliador pedagógico especializado em Espanhol Paraguaio (voseo) para brasileiros.
 
 Analise a sessão e retorne APENAS JSON válido.
 
 Regras:
 1) Considere o nível atual informado, mas ajuste se evidências indicarem um nível diferente de proficiência.
 2) A aula prática é conduzida em espanhol paraguaio (es-PY); metacomandos de tradução e instruções curtas são em pt-BR.
 3) Avalie 5 dimensões (0-100): pronúncia, fluência, compreensão, gramática, vocabulário.
 4) Sugira uma atividade concreta para a próxima aula baseada nos maiores gaps identificados.
 
 Entrada:
 ${JSON.stringify({
      currentLevel: userLevel,
      durationMs: input.durationMs,
      overallScore: input.overallScore,
      messages: input.messages,
      corrections: input.corrections,
    })}
 
 Saída JSON esperado:
 {
   "estimatedLevel": "A1|A2|B1|B2|C1",
   "confidence": 0.0,
   "dimensions": {
     "pronunciation": 0,
     "fluency": 0,
     "comprehension": 0,
     "grammar": 0,
     "vocabulary": 0
   },
   "strengths": ["string"],
   "priorityFocus": ["string"],
   "nextLesson": {
     "phase": "listening|reading|pronunciation|translation|conversation",
     "instructionPtBr": "string",
     "promptEsPy": "string"
   },
   "languageContract": {
     "tutorSpeech": "es-PY",
     "metaInstructions": "pt-BR"
   }
 }`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${EVALUATION_MODEL}:generateContent?key=${apiKey}`;

    let evaluation: z.infer<typeof EvaluationSchema>;
    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Gemini evaluation API error:", res.status, errorBody);
        throw new HttpsError("internal", `Gemini API returned ${res.status}`);
      }

      const geminiJson = await res.json();
      const rawText = extractGeminiText(geminiJson);
      evaluation = EvaluationSchema.parse(parseJsonResponse(rawText));
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error("Adaptive session evaluation failed:", err);
      throw new HttpsError("internal", "Failed to evaluate session.");
    }

    await sessionRef.set(
      {
        adaptiveEvaluation: evaluation,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return evaluation;
  },
);
