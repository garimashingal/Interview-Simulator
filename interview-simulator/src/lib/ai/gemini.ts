import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
import { geminiQueue } from "./queue";

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.warn("GOOGLE_AI_API_KEY is not set. AI features will not work.");
}

export const genAI = new GoogleGenerativeAI(API_KEY ?? "");

// ── Exponential backoff retry wrapper ────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 4,
  baseDelayMs = 2000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isRateLimit =
        (err instanceof Error && err.message.includes("429")) ||
        (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 429);

      if (isRateLimit && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt); // 2s, 4s, 8s, 16s
        const jitter = Math.random() * 1000;              // +0–1s jitter
        console.warn(`[Gemini] Rate limited. Retrying in ${Math.round((delay + jitter) / 1000)}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay + jitter));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// ── Simple in-memory response cache (keyed by prompt hash) ──────────────────
const responseCache = new Map<string, { result: GenerateContentResult; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function hashPrompt(prompt: string): string {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) {
    h = (Math.imul(31, h) + prompt.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ── Proxy model class with retry + caching ───────────────────────────────────
class SmartModel {
  private inner: ReturnType<typeof genAI.getGenerativeModel>;

  constructor(modelName: string, temp: number, topP: number) {
    this.inner = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: temp,
        topP,
        responseMimeType: "application/json",
      },
    });
  }

  async generateContent(prompt: string, useCache = true): Promise<GenerateContentResult> {
    const key = hashPrompt(prompt);

    // Return cached result if fresh
    if (useCache) {
      const cached = responseCache.get(key);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        console.log("[Gemini] Cache hit");
        return cached.result;
      }
    }

    // Enqueue → then retry on 429
    const result = await geminiQueue.add(() =>
      withRetry(() => this.inner.generateContent(prompt))
    );

    if (useCache) {
      responseCache.set(key, { result, ts: Date.now() });
    }

    return result;
  }
}

// ── Exported model instances ─────────────────────────────────────────────────
// Both use gemini-2.0-flash-lite (free tier: 30 RPM, 1,500 RPD)
export const geminiFlash = new SmartModel("gemini-2.0-flash-lite", 0.2, 0.8);
export const geminiPro   = new SmartModel("gemini-2.0-flash-lite", 0.3, 0.85);
