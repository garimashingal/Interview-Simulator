import { genAI } from "./gemini";
import { geminiQueue } from "./queue";

const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// ── Retry helper (reused from gemini.ts pattern) ─────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4, baseDelayMs = 2000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isRateLimit =
        (err instanceof Error && err.message.includes("429")) ||
        (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 429);

      if (isRateLimit && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`[Embedding] Rate limited. Retrying in ${Math.round(delay / 1000)}s`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Generate a semantic embedding vector for a given text.
 * Uses Google's text-embedding-004 model (768 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await geminiQueue.add(() =>
    withRetry(() => embeddingModel.embedContent(text))
  );
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts — sequential to avoid bursting the RPM limit.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await generateEmbedding(text));
    // Small delay between requests to stay under 30 RPM
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

/**
 * Cosine similarity between two vectors — used for client-side fallback comparisons.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  const dot = a.reduce((acc, ai, i) => acc + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, ai) => acc + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((acc, bi) => acc + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}
