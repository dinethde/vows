/**
 * Downloads the album photography named in scripts/albums/photos.manifest.json,
 * emits the AVIF + WebP derivatives the album pages serve, and writes
 * src/data/album-photos.ts (DESIGN.md §12.6).
 *
 * Each photo also gets an LQIP: a 20px-wide WebP inlined as a data URI. With
 * scroll reveal and idle float running, an unplaceholdered image pops in
 * mid-animation and the whole effect reads as broken.
 *
 * Usage: node scripts/prepare-albums.mjs [--force]
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = join(root, "public", "albums");
// The LQIP placeholders are a build intermediate, not an asset: the script
// writes them, reads them back, and inlines their contents into
// album-photos.ts. Kept out of `public/` so they are not served, and kept in
// the repo so a fresh clone does not re-download every master to rebuild a
// cache it already had.
const cacheDir = join(root, ".album-cache");
const force = process.argv.includes("--force");

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "albums", "photos.manifest.json"), "utf8"),
);

await mkdir(outDir, { recursive: true });
await mkdir(cacheDir, { recursive: true });

const FORMATS = [
  { ext: "avif", encode: (p) => p.avif({ quality: 52, effort: 4 }) },
  { ext: "webp", encode: (p) => p.webp({ quality: 76, effort: 4 }) },
];

/** 20px wide is enough to carry colour and gross shape, and stays tiny. */
const LQIP_WIDTH = 20;

/**
 * Every gallery photograph is emitted in every gallery crop. Albums rotate
 * through the shared pool, so any photograph can land in any slot; generating
 * only its "natural" crop meant a portrait photo dropped into the full-bleed
 * slot had no width above 960 to offer and rendered soft.
 */
const GALLERY_BUCKETS = ["portrait", "square", "wide"];

const entries = [];
let downloaded = 0;

for (const photo of manifest.photos) {
  const buckets = photo.bucket === "hero" ? ["hero"] : GALLERY_BUCKETS;
  const widest = Math.max(
    ...buckets.flatMap((name) => manifest.buckets[name].widths),
  );

  const wanted = buckets.flatMap((name) =>
    manifest.buckets[name].widths.flatMap((w) =>
      FORMATS.map((f) => join(outDir, `${photo.slot}-${name}-${w}.${f.ext}`)),
    ),
  );
  const lqipFiles = buckets.map((name) =>
    join(cacheDir, `${photo.slot}-${name}.lqip.txt`),
  );

  const needsWork =
    force || !wanted.every(existsSync) || !lqipFiles.every(existsSync);

  if (needsWork) {
    // One generous master, every crop derived locally.
    const url = `${photo.source}?w=${widest}&q=92&fm=jpg&fit=max`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${photo.slot}: ${response.status} for ${url}`);
    }
    const master = Buffer.from(await response.arrayBuffer());
    downloaded += 1;

    for (const name of buckets) {
      const bucket = manifest.buckets[name];
      const [aw, ah] = bucket.aspect;
      const heightFor = (width) => Math.round((width * ah) / aw);

      for (const width of bucket.widths) {
        for (const format of FORMATS) {
          const pipeline = sharp(master).rotate().resize({
            width,
            height: heightFor(width),
            fit: "cover",
            position: sharp.strategy.attention,
          });
          await writeFile(
            join(outDir, `${photo.slot}-${name}-${width}.${format.ext}`),
            await format.encode(pipeline).toBuffer(),
          );
        }
      }

      const lqip = await sharp(master)
        .rotate()
        .resize({
          width: LQIP_WIDTH,
          height: heightFor(LQIP_WIDTH),
          fit: "cover",
          position: sharp.strategy.attention,
        })
        .webp({ quality: 40 })
        .toBuffer();
      await writeFile(
        join(cacheDir, `${photo.slot}-${name}.lqip.txt`),
        lqip.toString("base64"),
      );
    }
  }

  const lqip = {};
  for (const name of buckets) {
    lqip[name] = await readFile(
      join(cacheDir, `${photo.slot}-${name}.lqip.txt`),
      "utf8",
    );
  }
  entries.push({ ...photo, buckets, lqip });
  console.log(`${needsWork ? "ok  " : "skip"}  ${photo.slot}  ${buckets.join(", ")}`);
}

// ---- generated module ----------------------------------------------------
const bucketLines = Object.entries(manifest.buckets).map(
  ([name, b]) =>
    `  ${name}: { aspect: [${b.aspect.join(", ")}], widths: [${b.widths.join(", ")}] },`,
);

const photoLines = entries.map((p) => {
  const lqip = Object.entries(p.lqip)
    .map(([name, data]) => `      ${name}: ${JSON.stringify(`data:image/webp;base64,${data}`)},`)
    .join("\n");
  return `  ${p.slot}: {
    slot: ${JSON.stringify(p.slot)},
    alt: ${JSON.stringify(p.alt)},
    lqip: {
${lqip}
    },
    credit: { author: ${JSON.stringify(p.author)}, url: ${JSON.stringify(p.link)} },
  },`;
});

const module = `/**
 * The album photography pool (DESIGN.md §12.6).
 * Generated from scripts/albums/photos.manifest.json — edit that, then run
 * \`node scripts/prepare-albums.mjs\`.
 */

export type AlbumBucket = "portrait" | "square" | "wide" | "hero";

export type BucketSpec = {
  /** Intrinsic aspect the derivatives are cropped to, as [w, h]. */
  aspect: [number, number];
  /** Rendered widths available, in CSS pixels. */
  widths: number[];
};

export type AlbumPhoto = {
  slot: string;
  alt: string;
  /**
   * Inline 20px placeholder per crop, so nothing pops in mid-reveal. Keyed by
   * bucket because the same photograph is cropped differently depending on the
   * slot it lands in.
   */
  lqip: Partial<Record<AlbumBucket, string>>;
  credit: { author: string; url: string };
};

export const albumBuckets: Record<AlbumBucket, BucketSpec> = {
${bucketLines.join("\n")}
};

export const albumPhotos = {
${photoLines.join("\n")}
} as const satisfies Record<string, AlbumPhoto>;

export type AlbumPhotoId = keyof typeof albumPhotos;

/** Every gallery slot, in narrative order. The hero is addressed separately. */
export const galleryPhotoIds = [
${entries
  .filter((p) => p.slot !== "hero")
  .map((p) => `  "${p.slot}",`)
  .join("\n")}
] as const satisfies readonly AlbumPhotoId[];
`;

await writeFile(join(root, "src", "data", "album-photos.ts"), module);

// ---- credits + size report ----------------------------------------------
const credits = [
  "# Album photograph credits",
  "",
  "Every photograph on the album pages comes from Unsplash and is used under the",
  "[Unsplash License](https://unsplash.com/license). Regenerate the set with",
  "`node scripts/prepare-albums.mjs`.",
  "",
  "| Slot | Bucket | Photographer | Source |",
  "| --- | --- | --- | --- |",
  ...entries.map(
    (p) =>
      `| \`${p.slot}\` | ${p.buckets.join(", ")} | ${p.author} | [${p.unsplashId}](${p.link}) |`,
  ),
  "",
].join("\n");
await writeFile(join(outDir, "CREDITS.md"), credits);

const files = await readdir(outDir);
let total = 0;
for (const file of files) {
  if (file.endsWith(".md") || file.endsWith(".txt")) continue;
  total += (await stat(join(outDir, file))).size;
}
console.log(
  `\n${entries.length} photos, ${(total / 1024 / 1024).toFixed(2)} MB of derivatives` +
    `${downloaded ? ` (${downloaded} masters downloaded)` : ""}`,
);
console.log("wrote src/data/album-photos.ts and public/albums/CREDITS.md");
