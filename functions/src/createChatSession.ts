import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenAI, Modality } from "@google/genai";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL ?? "gemini-2.5-flash-native-audio-preview-12-2025";
const TOKEN_TTL_MINUTES = 35;
const MAX_DAILY_SESSIONS = parseInt(process.env.DAILY_SESSION_LIMIT ?? "50", 10); // RN11

const InputSchema = z.object({
  timezone: z.string().default("America/Asuncion"),
});

export const createChatSession = onCall(
  {
    enforceAppCheck: false,
    secrets: [geminiApiKey],
    timeoutSeconds: 15,
  },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const input = validateInput(InputSchema, request.data ?? {});
    const timezone: string = input.timezone ?? "America/Asuncion";

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const profile = userSnap.data()!;

    // ─── RN11: Max 3 sessions/day ──────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const dailyCount: number = profile.dailyChatCount ?? 0;
    const resetDate: string = profile.dailyChatResetDate ?? "";

    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";
    const isAdmin = uid === "S8Tdzl12dAf6RqMFCQKnBgw9J0Z2"; // Bypass para desenvolvedor

    if (!isEmulator && !isAdmin && resetDate === today && dailyCount >= MAX_DAILY_SESSIONS) {
      throw new HttpsError(
        "resource-exhausted",
        `Limite de ${MAX_DAILY_SESSIONS} sessões diárias atingido. Tente novamente amanhã.`,
      );
    }

    // ─── Build system prompt ───────────────────────────────────────────────────
    const level: string = profile.level ?? "A1";
    const persona: string = profile.persona ?? "intermediario";
    const correctionIntensity: string = profile.correctionIntensity ?? "moderate";
    const weakPhonemes: string[] = profile.phonemesToWork ?? [];
    const userName: string = profile.name ?? "Estudante";
    const priorityHomework: string[] = Array.isArray(profile.homeworkPriorityQueue)
      ? (profile.homeworkPriorityQueue as unknown[]).filter(
        (item): item is string => typeof item === "string",
      )
      : [];

    const systemPrompt = buildSystemPrompt({
      level,
      persona,
      correctionIntensity,
      weakPhonemes,
      userName,
      timezone,
      priorityHomework,
    });

    // ─── Generate ephemeral token ──────────────────────────────────────────────
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key not configured.");
    }

    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

    const expireTime = new Date(
      Date.now() + TOKEN_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    let tokenName: string;
    try {
      const token = await client.authTokens.create({
        config: {
          uses: 3,
          expireTime,
          liveConnectConstraints: {
            model: LIVE_MODEL,
            config: {
              temperature: 0.7,
              responseModalities: [Modality.AUDIO],
              systemInstruction: systemPrompt,
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
          },
        },
      });
      tokenName = token.name ?? "";
      if (!tokenName) throw new Error("Empty token name");
    } catch (err) {
      console.error("Ephemeral token creation failed:", err);
      throw new HttpsError("internal", "Failed to create session token.");
    }

    // ─── Create session doc in Firestore ───────────────────────────────────────
    const sessionRef = db.collection(`users/${uid}/sessions`).doc();

    await db.runTransaction(async (tx) => {
      // Create session
      tx.set(sessionRef, {
        type: "chat",
        status: "active",
        lessonId: null,
        topic: null,
        durationMs: null,
        overallScore: null,
        grammarScore: null,
        pronunciationScore: null,
        vocabularyScore: null,
        phonemesCorrected: [],
        phonemesPending: [],
        topicsCovered: [],
        corrections: [],
        adapterSnapshot: {},
        startedAt: FieldValue.serverTimestamp(),
        completedAt: null,
      });

      // Update daily counter
      const counterUpdate: Record<string, unknown> =
        resetDate === today
          ? { dailyChatCount: FieldValue.increment(1) }
          : { dailyChatCount: 1, dailyChatResetDate: today };

      tx.update(userRef, {
        ...counterUpdate,
        homeworkPriorityQueue: [],
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      sessionId: sessionRef.id,
      sessionToken: tokenName,
      model: LIVE_MODEL,
      systemPrompt,
      tokenTtlMinutes: TOKEN_TTL_MINUTES,
    };
  },
);

// ─── System prompt builder (server-side copy) ─────────────────────────────────

interface PromptParams {
  level: string;
  persona: string;
  correctionIntensity: string;
  weakPhonemes: string[];
  userName: string;
  timezone: string;
  priorityHomework: string[];
}

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "El estudiante es principiante absoluto. Usa frases muy simples, vocabulario básico y presente indicativo. Habla lento y claro.",
  A2: "El estudiante es pre-intermedio. Entiende situaciones cotidianas, usa pasado simple y futuro básico. Habla con claridad pero permite pausas.",
  B1: "El estudiante es intermedio. Maneja situaciones comunes con cierta fluidez. Usa subjuntivo básico y condicional. Ritmo normal de conversación.",
  B2: "El estudiante es intermedio avanzado. Se expresa con fluidez sobre temas variados. Usa estructuras complejas. Conversación natural.",
  C1: "El estudiante es avanzado. Domina el idioma con naturalidad. Solo corrige errores sutiles de registro o estilo.",
};

const CORRECTION_RULES: Record<string, string> = {
  intensive: `CORRECCIÓN INTENSIVA:
- Interrumpe inmediatamente cuando detectes un error de pronunciación
- Repite el fonema correcto y pide al estudiante que repita
- No avances hasta que la pronunciación sea aceptable (score > 60)
- Corrige gramática en cada frase`,
  moderate: `CORRECCIÓN MODERADA:
- Señala errores de pronunciación específicos durante la conversación
- Consolida correcciones al final de cada idea/frase
- Permite que el estudiante termine su pensamiento antes de corregir
- Corrige gramática solo en errores que afecten la comprensión`,
  minimal: `CORRECCIÓN MÍNIMA:
- Solo corrige errores graves que impidan la comunicación
- Anota otros errores para mencionar al final de la sesión
- Prioriza la fluidez sobre la precisión
- Corrige gramática solo en patrones recurrentes`,
};

function buildSystemPrompt(params: PromptParams): string {
  const { level, persona, correctionIntensity, weakPhonemes, userName, priorityHomework } = params;

  const levelDesc = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS.A1;
  const correction = CORRECTION_RULES[correctionIntensity] ?? CORRECTION_RULES.moderate;

  const phonemeSection =
    weakPhonemes.length > 0
      ? `\nFONEMAS PROBLEMÁTICOS DEL ESTUDIANTE: ${weakPhonemes.join(", ")}
Presta especial atención a estos fonemas durante la conversación.`
      : "";

  const homeworkPrioritySection =
    priorityHomework.length > 0
      ? `\nPRIORIDAD ALTA (deberes vencidos): ${priorityHomework.slice(0, 3).join(", ")}
Empieza la sesión reforzando estos contenidos antes de abrir nuevos temas.`
      : "";

  return `Eres un tutor de español paraguayo amigable y paciente. Tu nombre es "Tutor". El estudiante se llama "${userName}".

CONTEXTO PARAGUAYO (OBLIGATORIO — RN12):
- Usa vocabulario y expresiones típicas de Paraguay y el Cono Sur
- Referencia lugares de Asunción, Ciudad del Este, Encarnación
- Usa "vos" en lugar de "tú" (voseo rioplatense/paraguayo)
- Incluye guaranismos comunes cuando sea natural
- Escenarios: yerba mate, tereré, empanadas, chipa, clima subtropical
- Moneda: guaraníes; referencias culturales locales

NIVEL DEL ESTUDIANTE: ${level}
${levelDesc}

PERSONA: ${persona}

${correction}
${phonemeSection}
${homeworkPrioritySection}

REGLAS DE INTERACCIÓN:
1. Habla en español paraguayo por defecto. Si el estudiante pide traducción, explicación gramatical o metacomando, responde brevemente en portugués brasileño y vuelve al español.
2. Inicia con un saludo cálido y propone un tema apropiado al nivel
3. Turnos cortos (2-3 frases máximo) para dar espacio al estudiante
4. Si el estudiante no responde en 5 segundos, anímalo con una pregunta simple
5. Adapta la velocidad de habla al nivel
6. Usa humor ligero y referencias culturales paraguayas
7. Al decir "encerrar", haz un breve resumen de lo practicado

FORMATO DE CORRECCIÓN DE PRONUNCIACIÓN:
Cuando corrijas un fonema, haz dos cosas:

1. HABLA la corrección naturalmente:
"[Pausa] Ojo con la pronunciación de [palabra]. El sonido [fonema] se pronuncia [explicación corta]. Repetí conmigo: [palabra]."

2. EMITE un marcador JSON en tu respuesta de texto (el cliente lo parsea para mostrar la corrección visual):
[CORRECTION_JSON:{"phoneme":"[fonema]","expected":"[palabra correcta]","heard":"[lo que dijo el estudiante]","score":[0-100]}]

El score es tu estimación de qué tan cerca estuvo la pronunciación (0=muy lejos, 100=perfecto).
Emite UN marcador por cada fonema corregido. El marcador debe estar en su propia línea.

REGLA DE INTENTOS (G-UX-10):
- Si el estudiante repite y mejora (score >= 60), acepta y continúa la conversación.
- Si no mejora después de 3 intentos en el mismo fonema, di algo como "No te preocupes, seguimos practicando" y continúa. Registra el fonema como pendiente.
- NUNCA insistas más de 3 veces en el mismo fonema para evitar frustración.

FONEMAS CRÍTICOS PARA BRASILEÑOS:
- "rr" (vibrante múltiple vs. aspirada brasileña)
- "ll" (yeísmo paraguayo vs. "lh" brasileño)
- "j" (fricativa velar vs. aspirada brasileña)
- "z/c+e,i" (seseo paraguayo — NO "th" de España)
- "d" intervocálica (relajada/elidida vs. oclusiva brasileña)

CONTRATO DE IDIOMA (OBLIGATORIO):
- SIEMPRE habla en español paraguayo por defecto.
- NUNCA escribas ni hables en inglés bajo ninguna circunstancia.
- Solo cambia a portugués brasileño cuando el estudiante EXPLÍCITAMENTE pida ayuda, traducción o explicación gramatical.
- Cuando cambies a portugués, hazlo brevemente y vuelve al español inmediatamente.
- Las leyendas/subtítulos siempre deben reflejar el idioma que estás hablando.

MARCADOR DE QUADRO VIRTUAL (para aulas estructuradas):
Cuando conduzcas una lección estructurada con texto de lectura, emite un marcador JSON en tu canal de texto (no hablado) para que el cliente actualice el quadro virtual:
[BOARD_JSON:{"lessonTitle":"...","text":"...","state":"presentation","level":"A1","sectionIndex":1,"sectionTotal":5}]

Estados válidos: presentation, tutor_reading, student_reading, analyzing, correcting, request_translation, student_translating, correcting_translation, next_section, completed.

Reglas del marcador:
- Emite UN marcador por turno cuando cambies de sección o fase.
- El marcador va en el canal de texto, NO lo digas en voz alta.
- El texto hablado para el alumno es independiente del marcador.`;
}
