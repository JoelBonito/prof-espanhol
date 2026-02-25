import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const LESSON_MODEL = "gemini-2.0-flash";
const LESSON_CACHE_TTL_HOURS = 24;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;

const InputSchema = z.object({
  moduleId: z.string().min(1),
  topic: z.string().min(2).max(100),
});

const ExerciseSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["flashcard", "multiple_choice", "fill_blank"]),
  question: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().min(1),
  options: z.array(z.string().min(1)).optional(),
});

const LessonBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  durationMinutes: z.number().int().min(3).max(5),
  contentHtml: z.string().min(1),
  examples: z.array(z.string().min(1)).default([]),
});

const LessonSchema = z.object({
  title: z.string().min(1),
  estimatedMinutes: z.number().int().min(15).max(25),
  blocks: z.array(LessonBlockSchema).min(3).max(5),
  exercises: z.array(ExerciseSchema).min(2).max(3),
});

function extractGeminiText(json: unknown): string {
  const text =
    (json as Record<string, unknown>)?.candidates &&
    Array.isArray((json as Record<string, unknown>).candidates)
      ? ((json as Record<string, unknown>).candidates as Array<Record<string, unknown>>)?.[0]
          ?.content &&
        Array.isArray(
          (((json as Record<string, unknown>).candidates as Array<Record<string, unknown>>)?.[0]
            ?.content as Record<string, unknown>)?.parts,
        )
        ? ((((json as Record<string, unknown>).candidates as Array<Record<string, unknown>>)?.[0]
            ?.content as Record<string, unknown>)?.parts as Array<Record<string, unknown>>)?.[0]
            ?.text as string
        : ""
      : "";

  return typeof text === "string" ? text : "";
}

function parseGeminiJson(raw: string): unknown {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

async function enforceLessonRateLimit(
  uid: string,
): Promise<void> {
  const db = getFirestore();
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const rateRef = db.doc(`users/${uid}/rateLimits/generateLesson`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(rateRef);
    const data = snap.data() as { count?: number; updatedAt?: Timestamp } | undefined;
    const previousCount = typeof data?.count === "number" ? data.count : 0;
    const previousUpdatedAt = data?.updatedAt;
    const inWindow =
      previousUpdatedAt instanceof Timestamp &&
      previousUpdatedAt.toMillis() >= windowStart;

    if (inWindow && previousCount >= RATE_LIMIT_MAX_REQUESTS) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many lesson generation requests. Please try again in a minute.",
      );
    }

    const nextCount = inWindow ? previousCount + 1 : 1;
    tx.set(
      rateRef,
      {
        count: nextCount,
        updatedAt: Timestamp.fromMillis(now),
      },
      { merge: true },
    );
  });
}

export const generateLesson = onCall(
  {
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

    const { moduleId, topic } = validateInput(InputSchema, request.data);
    const uid = request.auth.uid;
    const db = getFirestore();
    const now = Date.now();

    await enforceLessonRateLimit(uid);

    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const level: string = userSnap.data()?.level ?? "A1";
    const cacheRef = db.doc(`lessons/${uid}/cache/${moduleId}`);
    const cacheSnap = await cacheRef.get();

    if (cacheSnap.exists) {
      const cacheData = cacheSnap.data()!;
      const cacheLevel: string | undefined = cacheData.level;
      const expiresAt = cacheData.expiresAt as Timestamp | undefined;
      const lesson = cacheData.lesson;

      if (
        cacheLevel === level &&
        expiresAt instanceof Timestamp &&
        expiresAt.toMillis() > now &&
        lesson
      ) {
        return {
          ...lesson,
          cache: {
            hit: true,
            expiresAt: expiresAt.toDate().toISOString(),
          },
        };
      }
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key not configured.");
    }

    const prompt = `Você é um tutor especialista em espanhol paraguaio.

Gere conteúdo educacional no formato JSON para um módulo de espanhol.

Dados do usuário:
- Nível CEFR: ${level}
- Tópico: ${topic}
- Contexto obrigatório: vocabulário e situações reais do Paraguai (Asunción, Ciudad del Este, Encarnación, voseo, guaranismos quando natural).

Requisitos de formato:
- Duração total entre 15 e 25 minutos.
- 3 a 5 blocos de 3 a 5 minutos.
- 2 a 3 exercícios.
- Campo contentHtml deve conter HTML simples (p, ul, li, strong, em, code, h2/h3), sem scripts.

Retorne APENAS JSON válido com este schema:
{
  "title": "string",
  "estimatedMinutes": 15-25,
  "blocks": [
    {
      "id": "string",
      "title": "string",
      "durationMinutes": 3-5,
      "contentHtml": "string",
      "examples": ["string"]
    }
  ],
  "exercises": [
    {
      "id": "string",
      "type": "flashcard|multiple_choice|fill_blank",
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string"
    }
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${LESSON_MODEL}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4096,
      },
    };

    let lessonData: z.infer<typeof LessonSchema>;
    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini lesson generation error:", res.status, errBody);
        throw new HttpsError("internal", `Gemini API returned ${res.status}`);
      }

      const geminiJson = await res.json();
      const geminiText = extractGeminiText(geminiJson);
      lessonData = LessonSchema.parse(parseGeminiJson(geminiText));
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error("Lesson generation failed:", err);
      throw new HttpsError("internal", "Failed to generate lesson content.");
    }

    const expiresAt = Timestamp.fromMillis(
      now + LESSON_CACHE_TTL_HOURS * 60 * 60 * 1000,
    );
    const generatedAt = Timestamp.now();

    const lesson = {
      moduleId,
      topic,
      level,
      ...lessonData,
    };

    await cacheRef.set(
      {
        moduleId,
        topic,
        level,
        lesson,
        generatedAt,
        expiresAt,
        updatedAt: generatedAt,
      },
      { merge: true },
    );

    return {
      ...lesson,
      cache: {
        hit: false,
        expiresAt: expiresAt.toDate().toISOString(),
      },
    };
  },
);
