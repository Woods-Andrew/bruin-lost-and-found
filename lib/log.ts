import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

const logDir = path.join(process.cwd(), ".data");
const logFile = path.join(logDir, "error.log");

export async function logError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  const line = `${new Date().toISOString()} [${scope}] ${message}\n`;
  console.error(line);
  try {
    await mkdir(logDir, { recursive: true });
    await appendFile(logFile, line);
  } catch (writeError) {
    console.error("Failed to persist error log", writeError);
  }
}

export function logInfo(scope: string, message: string) {
  console.info(`${new Date().toISOString()} [${scope}] ${message}`);
}
