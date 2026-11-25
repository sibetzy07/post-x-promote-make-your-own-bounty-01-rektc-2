// SPDX-License-Identifier: MIT
// Copies POST.json (the X post this entry names) into the grader output dir,
// after validating that it names a real X post URL. A broken or mistyped
// POST.json used to be copied silently; now it fails loudly instead.
// Paths resolve from this script's location, not the working directory:
// the grader may run it from anywhere. The output dir defaults to /output
// when MAKEFUN_OUTPUT_DIR is not set.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const X_POST_URL =
  /^https:\/\/(?:www\.|mobile\.)?x\.com\/[A-Za-z0-9_]{1,15}\/status\/[0-9]+$/;

const here = dirname(fileURLToPath(import.meta.url));
const postPath = join(here, "POST.json");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

let raw: string;
try {
  raw = readFileSync(postPath, "utf8");
} catch {
  throw new Error("POST.json is missing from the repository");
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  throw new Error("POST.json is not valid JSON");
}

if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
  throw new Error(
    'POST.json must be a JSON object like {"url": "https://x.com/<handle>/status/<id>"}',
  );
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  throw new Error('POST.json must carry a non-empty string field "url"');
}
if (!X_POST_URL.test(url)) {
  throw new Error(
    `POST.json url is not an X post address (expected https://x.com/<handle>/status/<id>): ${url}`,
  );
}

mkdirSync(outDir, { recursive: true });
copyFileSync(postPath, join(outDir, "POST.json"));
console.log(`POST.json validated and copied: ${url}`);
