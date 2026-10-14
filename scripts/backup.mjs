import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";

const source = path.join(process.cwd(), ".data", "store.json");
const destDir = path.join(process.cwd(), ".data", "backups");
const dest = path.join(destDir, `store-${new Date().toISOString().replaceAll(":", "-")}.json`);

try {
  await access(source);
  await mkdir(destDir, { recursive: true });
  await copyFile(source, dest);
  console.log(`Backup written to ${dest}`);
} catch {
  console.log("No local demo store to back up. For Supabase, use the dashboard PITR / scheduled backups.");
}
