/**
 * Downloads the 22 Unsplash photographs in scripts/photos.manifest.json and
 * emits the AVIF + WebP derivatives the gallery serves (DESIGN.md §3.5).
 * Also regenerates public/photos/CREDITS.md.
 *
 * Usage: node scripts/prepare-photos.mjs [--force]
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = join(root, "public", "photos");
const force = process.argv.includes("--force");

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "photos.manifest.json"), "utf8"),
);

await mkdir(outDir, { recursive: true });

const FORMATS = [
  { ext: "avif", encode: (p) => p.avif({ quality: 55, effort: 6 }) },
  { ext: "webp", encode: (p) => p.webp({ quality: 78, effort: 5 }) },
];

let downloaded = 0;
for (const photo of manifest.photos) {
  const size = manifest.sizes[photo.orientation];
  const targets = [
    { suffix: "1x", w: size.w, h: size.h },
    { suffix: "2x", w: size.w * 2, h: size.h * 2 },
  ];

  const needed = targets.flatMap((t) =>
    FORMATS.map((f) => join(outDir, `${photo.slot}@${t.suffix}.${f.ext}`)),
  );
  if (!force && needed.every((p) => existsSync(p))) {
    console.log(`skip  ${photo.slot}`);
    continue;
  }

  // Pull one generous master and derive everything locally.
  const url = `${photo.source}?w=${size.w * 4}&q=90&fm=jpg&fit=max`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${photo.slot}: ${response.status} for ${url}`);
  }
  const master = Buffer.from(await response.arrayBuffer());
  downloaded += 1;

  for (const target of targets) {
    for (const format of FORMATS) {
      const pipeline = sharp(master)
        .rotate()
        .resize({
          width: target.w,
          height: target.h,
          fit: "cover",
          position: sharp.strategy.attention,
        });
      const buffer = await format.encode(pipeline).toBuffer();
      await writeFile(
        join(outDir, `${photo.slot}@${target.suffix}.${format.ext}`),
        buffer,
      );
    }
  }
  console.log(`ok    ${photo.slot}  ${photo.orientation}  ${photo.author}`);
}

// ---- credits -------------------------------------------------------------
const credits = [
  "# Photograph credits",
  "",
  "Every photograph on the Vows home page comes from Unsplash and is used under",
  "the [Unsplash License](https://unsplash.com/license). Regenerate the image set",
  "with `node scripts/prepare-photos.mjs`.",
  "",
  "| Slot | Orientation | Treatment | Photographer | Source |",
  "| --- | --- | --- | --- | --- |",
  ...manifest.photos.map(
    (p) =>
      `| \`${p.slot}\` | ${p.orientation} | ${p.treatment} | ${p.author} | [${p.unsplashId}](${p.link}) |`,
  ),
  "",
].join("\n");
await writeFile(join(outDir, "CREDITS.md"), credits);

// ---- size report ---------------------------------------------------------
const files = await readdir(outDir);
let total = 0;
let worst = { name: "", size: 0 };
for (const file of files) {
  if (file.endsWith(".md")) continue;
  const { size } = await stat(join(outDir, file));
  total += size;
  if (size > worst.size) worst = { name: file, size };
}
console.log(
  `\n${files.length - 1} files, ${(total / 1024).toFixed(0)} KB total, ` +
    `largest ${worst.name} at ${(worst.size / 1024).toFixed(1)} KB` +
    `${downloaded ? ` (${downloaded} masters downloaded)` : ""}`,
);
