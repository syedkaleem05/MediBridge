/**
 * Copies the Vite workspace output to <repo-root>/dist so Vercel can use the
 * default Output Directory setting ("dist") when the deployment root is the repo.
 *
 * Keeps emitting to frontend/my-app/dist inside the workspace build intact.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "frontend", "my-app", "dist");
const dest = path.join(root, "dist");

if (!fs.existsSync(src)) {
  console.error(`[stage-root-dist] Missing build output directory: ${src}`);
  console.error("Run workspace build first: npm --workspace frontend/my-app run build");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
// eslint-disable-next-line no-console
console.log(`[stage-root-dist] Copied ${src} → ${dest}`);
