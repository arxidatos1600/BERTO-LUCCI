/**
 * Generate modern-format twins (WebP, and AVIF for the hot set) next to every
 * product JPEG.
 *
 * Why: the source JPEGs are the quality ceiling (1200x1800). WebP/AVIF re-encode
 * the SAME pixels with a better codec, so we get equal-or-better perceived
 * quality at roughly half the bytes — which serves both "highest quality" and
 * "fastest load" at once. <picture> in SmartImage picks the best one the browser
 * supports and falls back to the original JPEG everywhere else, so nothing
 * regresses on old browsers.
 *
 * Usage:  node scripts/build-image-formats.mjs [--avif-only-hot] [--force]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "bertolucci_images");
const FORCE = process.argv.includes("--force");

// AVIF must cover BOTH rungs of the ladder. A <picture> picks a <source> purely
// on codec support, so if the AVIF srcset lacked the 640w card, phones would be
// handed the 1200w file (or 404 and fall back) — strictly worse than WebP.
const AVIF_LARGE_ONLY = false;

sharp.cache(false);
sharp.concurrency(1); // we parallelise at the file level instead

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.jpe?g$/i.test(entry.name)) yield full;
  }
}

const isNewer = async (src, out) => {
  try {
    const [a, b] = await Promise.all([fs.stat(src), fs.stat(out)]);
    return b.mtimeMs >= a.mtimeMs && b.size > 0;
  } catch {
    return false;
  }
};

async function convert(file) {
  const isCard = /__card\.jpe?g$/i.test(file);
  const base = file.replace(/\.jpe?g$/i, "");
  let made = 0;

  const webp = `${base}.webp`;
  if (FORCE || !(await isNewer(file, webp))) {
    await sharp(file).webp({ quality: 82, effort: 4 }).toFile(webp);
    made++;
  }

  if (!isCard || !AVIF_LARGE_ONLY) {
    const avif = `${base}.avif`;
    if (FORCE || !(await isNewer(file, avif))) {
      await sharp(file).avif({ quality: 58, effort: 3 }).toFile(avif);
      made++;
    }
  }
  return made;
}

const files = [];
for await (const f of walk(ROOT)) files.push(f);

const WORKERS = Math.max(2, Math.min(os.cpus().length - 1, 8));
console.log(`[img] ${files.length} source JPEGs · ${WORKERS} workers`);

let i = 0;
let done = 0;
let made = 0;
let failed = 0;
const t0 = Date.now();

await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    while (i < files.length) {
      const file = files[i++];
      try {
        made += await convert(file);
      } catch (err) {
        failed++;
        if (failed <= 5) console.error(`[img] FAIL ${path.basename(file)}: ${err.message}`);
      }
      if (++done % 250 === 0) {
        const pct = ((done / files.length) * 100).toFixed(1);
        const secs = ((Date.now() - t0) / 1000).toFixed(0);
        console.log(`[img] ${done}/${files.length} (${pct}%) · ${made} written · ${secs}s`);
      }
    }
  })
);

console.log(
  `[img] DONE ${done} processed · ${made} files written · ${failed} failed · ${((Date.now() - t0) / 1000).toFixed(0)}s`
);
