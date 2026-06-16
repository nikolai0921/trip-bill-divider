import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const webDir = join(root, "www");
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "service-worker.js",
  "privacy.html",
  ".nojekyll",
  "icons",
];

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(webDir, file), { recursive: true });
}

console.log(`Prepared Capacitor web assets in ${webDir}`);
