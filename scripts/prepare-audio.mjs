/**
 * Downloads the ambience track named in scripts/audio.manifest.json and
 * re-encodes it for the web, then writes src/data/audio.ts so the player never
 * hard-codes a filename, title or licence (DESIGN.md §10).
 *
 * Swapping the track is a manifest edit plus one run of this script.
 *
 * Usage: node scripts/prepare-audio.mjs [--force]
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const outDir = join(root, "public", "audio");
const force = process.argv.includes("--force");

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "audio.manifest.json"), "utf8"),
);
const { slot, encode } = manifest;
const outFile = join(outDir, `${slot}.${encode.extension}`);

await mkdir(outDir, { recursive: true });

if (force || !existsSync(outFile)) {
  const response = await fetch(manifest.source);
  if (!response.ok) {
    throw new Error(`${manifest.source}: ${response.status}`);
  }
  const master = join(outDir, `.${slot}.master`);
  await writeFile(master, Buffer.from(await response.arrayBuffer()));

  // afconvert ships with macOS. On other platforms substitute ffmpeg:
  //   ffmpeg -i <master> -ac 1 -b:a 64k -c:a aac <out>
  await run("afconvert", [
    "-f", encode.container,
    "-d", encode.codec,
    "-b", String(encode.bitrate),
    "-c", String(encode.channels),
    master,
    outFile,
  ]);
  await rm(master);
}

const { size } = await stat(outFile);

const credits = [
  "# Audio credit",
  "",
  `The ambience track is a **placeholder** standing in for the studio's licensed`,
  "recording. It is slow, warm and saxophone-led to suit the photography.",
  "",
  `- **Track** — ${manifest.title}`,
  `- **Artist** — ${manifest.artist}`,
  `- **Source** — <${manifest.sourcePage}>`,
  `- **Licence** — [${manifest.licence}](${manifest.licenceUrl})`,
  "",
  "Attribution, as the licence requires:",
  "",
  `> ${manifest.attribution}`,
  "",
  "To swap it, edit `scripts/audio.manifest.json` and run",
  "`node scripts/prepare-audio.mjs --force`. No source file names the track.",
  "",
].join("\n");
await writeFile(join(outDir, "CREDITS.md"), credits);

const data = `/**
 * The ambience track slot (DESIGN.md §10).
 * Generated from scripts/audio.manifest.json — edit that, then run
 * \`node scripts/prepare-audio.mjs --force\`.
 */
export type Track = {
  /** Path under public/. */
  src: string;
  /** MIME type for the <source> element. */
  type: string;
  title: string;
  artist: string;
  licence: string;
  attribution: string;
};

export const track: Track = {
  src: "/audio/${slot}.${encode.extension}",
  type: "audio/mp4",
  title: ${JSON.stringify(manifest.title)},
  artist: ${JSON.stringify(manifest.artist)},
  licence: ${JSON.stringify(manifest.licence)},
  attribution: ${JSON.stringify(manifest.attribution)},
};
`;
await writeFile(join(root, "src", "data", "audio.ts"), data);

console.log(
  `ok  ${slot}.${encode.extension}  ${(size / 1024).toFixed(0)} KB  ` +
    `${manifest.encode.bitrate / 1000}kbps ${manifest.encode.channels}ch`,
);
console.log("wrote public/audio/CREDITS.md and src/data/audio.ts");
