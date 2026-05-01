/**
 * Global Gemini request queue — enforces max 1 request per 2s (≤30 RPM).
 * All Gemini + Embedding calls must go through this queue to avoid 429 bursts.
 */
class RateLimitedQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private isProcessing = false;
  private readonly intervalMs: number;

  constructor(requestsPerMinute = 25) {
    // Stay slightly under the 30 RPM limit for safety margin
    this.intervalMs = Math.ceil(60_000 / requestsPerMinute);
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        await next();
        // Wait between requests to stay under RPM
        if (this.queue.length > 0) {
          await new Promise((r) => setTimeout(r, this.intervalMs));
        }
      }
    }

    this.isProcessing = false;
  }
}

// Singleton queue shared across all API routes
export const geminiQueue = new RateLimitedQueue(25); // 25 RPM → 1 req per 2.4s
