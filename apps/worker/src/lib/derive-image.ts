import sharp from "sharp";
import type { Sharp } from "sharp";
import { rgbaToThumbHash } from "thumbhash";

import { DERIVATIVE_WIDTHS } from "@vows/contracts";
import { PermanentJobError } from "@vows/server";

/** Chapter 10's table: smaller files get a little less quality, larger a little more. */
const QUALITY: Record<number, { avif: number; webp: number }> = {
  320: { avif: 50, webp: 68 },
  640: { avif: 52, webp: 72 },
  1024: { avif: 55, webp: 75 },
  1600: { avif: 58, webp: 78 },
  2400: { avif: 60, webp: 80 },
};
const IMAGE_FORMATS = ["jpeg", "png", "webp", "tiff"];
const THUMBHASH_SIDE = 100;
export const SHARE_CARD = { width: 1200, height: 630 } as const;
const WIDEST = Math.max(...DERIVATIVE_WIDTHS);

export interface ImageFile {
  format: "avif" | "webp" | "jpeg";
  width: number;
  height: number;
  body: Buffer;
  contentType: string;
}

export interface DerivedImage {
  width: number;
  height: number;
  mime: string;
  thumbhash: string;
  files: ImageFile[];
}

async function describe(
  original: Buffer,
): Promise<{ width: number; height: number; mime: string }> {
  // The type comes from the bytes. The upload header and the extension are a claim.
  const meta = await sharp(original)
    .metadata()
    .catch(() => undefined);
  if (!meta?.format || !IMAGE_FORMATS.includes(meta.format) || !meta.width || !meta.height) {
    throw new PermanentJobError("The file is not an image we can read.");
  }
  // Orientations 5 to 8 are a quarter turn, so the stored sides are swapped.
  const turned = (meta.orientation ?? 1) >= 5;
  return {
    width: turned ? meta.height : meta.width,
    height: turned ? meta.width : meta.height,
    mime: `image/${meta.format}`,
  };
}

/** The decoded, upright picture every file is made from, as raw pixels. */
interface Working {
  data: Buffer;
  raw: { width: number; height: number; channels: 3 | 4 };
}

const from = (working: Working): Sharp => sharp(working.data, { raw: working.raw });

/**
 * The original is decoded once, turned upright and brought down to the widest
 * file we make. Every output is cut from that. Decoding the full original for
 * each of eleven files is what took a 24 MP photograph past 600 MB.
 */
async function workingCopy(original: Buffer): Promise<Working> {
  const { data, info } = await sharp(original, { sequentialRead: true })
    .rotate()
    .resize({ width: WIDEST })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, raw: { width: info.width, height: info.height, channels: 3 } };
}

async function thumbhash(working: Working): Promise<string> {
  const { data, info } = await from(working)
    .resize(THUMBHASH_SIDE, THUMBHASH_SIDE, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString("base64");
}

async function resized(working: Working, width: number): Promise<ImageFile[]> {
  const quality = QUALITY[width] ?? { avif: 55, webp: 75 };
  const base = from(working).resize({ width });
  const [avif, webp] = await Promise.all([
    base.clone().avif({ quality: quality.avif }).toBuffer({ resolveWithObject: true }),
    base.clone().webp({ quality: quality.webp }).toBuffer({ resolveWithObject: true }),
  ]);
  return [
    { format: "avif", width, height: avif.info.height, body: avif.data, contentType: "image/avif" },
    { format: "webp", width, height: webp.info.height, body: webp.data, contentType: "image/webp" },
  ];
}

async function shareCard(working: Working): Promise<ImageFile> {
  const body = await from(working)
    .resize({ ...SHARE_CARD, fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { format: "jpeg", ...SHARE_CARD, body, contentType: "image/jpeg" };
}

/**
 * One original in, every file a browser may see out: five widths in AVIF and
 * WebP, a blur hash, and for a cover the 1200 × 630 picture a chat app shows.
 * The orientation is applied and then every other piece of EXIF is dropped.
 */
export async function deriveImage(original: Buffer, withShareCard: boolean): Promise<DerivedImage> {
  const about = await describe(original);
  const working = await workingCopy(original);

  const files: ImageFile[] = [];
  // One width at a time: five at once is how a small machine runs out.
  for (const width of DERIVATIVE_WIDTHS) files.push(...(await resized(working, width)));
  if (withShareCard) files.push(await shareCard(working));

  return { ...about, thumbhash: await thumbhash(working), files };
}
