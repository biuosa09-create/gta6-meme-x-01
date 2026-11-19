// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: this program's only job is to hand the
// post's address to the gate. It reads POST.json from the repository root,
// checks that it is a JSON object with a string `url`, and writes the exact
// same bytes to /output/POST.json. No network, no wall clock, no files
// outside the repository, and the same bytes on every run.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const sourcePath = join(botDir, 'POST.json');
let raw: Buffer;
try {
  raw = readFileSync(sourcePath);
} catch {
  fail(`cannot read ${sourcePath}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch {
  fail('POST.json is not valid JSON');
}

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  fail('POST.json must be a JSON object');
}
const url = (parsed as Record<string, unknown>).url;
if (typeof url !== 'string' || url.length === 0) {
  fail('POST.json must hold a string "url"');
}

// A real post address looks like https://x.com/<handle>/status/<digits>
// (twitter.com, www./mobile. and /i/web/status/<id> forms read the same).
// The placeholder is the only exception: it is replaced with the real post
// address before the entry is submitted, so a mistyped real address fails
// here instead of at the gate.
const PLACEHOLDER = 'https://x.com/<handle>/status/<id>';
const POST_PATTERN =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;
const WEB_PATTERN =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/i\/web\/status\/\d+$/;
if (url !== PLACEHOLDER && !POST_PATTERN.test(url) && !WEB_PATTERN.test(url)) {
  fail(`"url" is not an X post address: ${url}`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'POST.json'), raw);
