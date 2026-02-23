import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { z } from "zod";
import { validateInput } from "./middleware/validate.js";
import { requireAppCheck } from "./middleware/appcheck.js";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const InputSchema = z.object({
  audioBase64: z.string().min(100, "Audio data too short"),
  phraseId: z.string().min(1),
  expectedText: z.string().min(1),
});

const GeminiResponseSchema = z.object({
  score: z.number().min(0).max(100),
  problematicPhonemes: z.array(z.string()),
  feedback: z.string(),
});

export const analyzePronunciation = onCall(
  {
    enforceAppCheck: true,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (request) => {
    requireAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const { audioBase64, phraseId, expectedText } = validateInput(
      InputSchema,
      request.data,
    );

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key not configured.");
    }

    const systemPrompt = `You are an expert Spanish pronunciation evaluator specialized in analyzing Brazilian Portuguese speakers learning Spanish.

Evaluate the audio pronunciation of the following Spanish phrase:
"${expectedText}"

Key phonemes to evaluate for Brazilian speakers:
- "rr" (vibrant multiple trill vs Brazilian single tap)
- "j" (velar fricative /x/ vs Brazilian /ʒ/)
- "ll" (varies by dialect: /ʎ/, /ʝ/, /ʃ/)
- "z" (Latin American /s/ vs Brazilian tendency to voice it)
- "ñ" (palatal nasal /ɲ/)

Return ONLY a JSON object (no markdown, no code fences) with:
{
  "score": <0-100 integer>,
  "problematicPhonemes": [<list of phoneme strings that need work, e.g. "rr", "j">],
  "feedback": "<one sentence in Portuguese-BR with specific, encouraging feedback>"
}

Scoring guide:
- 90-100: Near-native pronunciation
- 70-89: Good with minor accent issues
- 50-69: Understandable but clear L1 interference
- 30-49: Significant pronunciation issues
- 0-29: Very difficult to understand`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: "audio/webm;codecs=opus",
                data: audioBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
      },
    };

    let geminiText: string;
    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini API error:", res.status, errBody);
        throw new HttpsError(
          "internal",
          `Gemini API returned ${res.status}`,
        );
      }

      const json = await res.json();
      geminiText =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error("Gemini fetch error:", err);
      throw new HttpsError("internal", "Failed to call Gemini API.");
    }

    // Parse and validate Gemini response
    let parsed: z.infer<typeof GeminiResponseSchema>;
    try {
      const cleaned = geminiText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = GeminiResponseSchema.parse(JSON.parse(cleaned));
    } catch (err) {
      console.error("Gemini response parse error:", geminiText, err);
      throw new HttpsError(
        "internal",
        "Invalid response from pronunciation analysis.",
      );
    }

    return {
      phraseId,
      score: parsed.score,
      problematicPhonemes: parsed.problematicPhonemes,
      feedback: parsed.feedback,
    };
  },
);
