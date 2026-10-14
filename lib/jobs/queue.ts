import { logError, logInfo } from "@/lib/log";

export async function runWithRetry<T>(
  name: string,
  fn: () => Promise<T>,
  retries = 3,
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const result = await fn();
      if (attempt > 1) logInfo("jobs", `${name} succeeded on retry ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      await logError("jobs", `${name} attempt ${attempt} failed: ${error}`);
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError;
}
