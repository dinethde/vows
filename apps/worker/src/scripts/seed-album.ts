import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { AlbumService, AppModule, PhotoService, QueueService } from '@vows/server';

/**
 * Fills the first album with the nineteen photographs from the Figma album
 * page, through the same services the Studio uses: an upload URL, a PUT
 * straight to R2, and the worker making the derivatives. Run a worker beside
 * it. Safe to run twice: each file has a fixed idempotency key.
 *
 *   node dist/scripts/seed-album.js <folder of 00.jpg … 18.jpg> [--publish]
 */
const ALBUM = 'alb_000001';
const caller = { actor: { clerkId: 'seed-script', role: 'owner' as const }, requestId: 'req_seed' };
const WAIT_MS = 5 * 60_000;

/** Slot 0 is the cover; 1 to 18 are the gallery, in the order the page shows them. */
const DESCRIPTIONS = [
  'The couple holding each other against a pale evening sky, her arms around his neck',
  'Guests raising champagne glasses outside the church doors as the couple comes out',
  'The bride walking across a field with her veil lifted by the wind',
  'Guests seen from behind in the pews of a candlelit chapel during the ceremony',
  'Two instant photographs side by side, one of the groom and one of the bride',
  'The bride kneeling in bridal lace and a long veil before the ceremony',
  'The bride from behind, looking down an outdoor aisle lined with guests and flowers',
  'The couple kissing on the church steps, blurred by the movement of the crowd',
  'A slice of wedding cake on a plate, held between the couple',
  'Long tables set for the reception outdoors under strings of green bunting',
  'The couple’s hands reaching for each other, their shadows on the grass',
  'The couple seen from above, both holding up two fingers and laughing',
  'The couple drinking espresso martinis side by side against a dark background',
  'The groom lifting the bride in a field at dusk',
  'The couple walking hand in hand, seen from behind, in black and white',
  'The bride’s face behind a lace veil, eyes closed',
  'A second view of the champagne toast outside the church doors',
  'Guests seated at long candlelit tables in a garden at night, turning to watch',
  'The couple leaving the church through a blur of guests',
];

/** Figma lists the overlapping pair large then small. The page reads small then large. */
const FILES: Record<number, number> = { 10: 11, 11: 10 };
/** Where the couple is in the cover, so a phone crops around them and not the sky. */
const COVER_FOCAL_POINT = { x: 62, y: 45 };

async function putFile(url: string, body: Buffer): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': 'image/jpeg' },
    body,
  });
  if (!response.ok) throw new Error(`R2 answered ${String(response.status)} to an upload.`);
}

async function main(): Promise<void> {
  const [folder, flag] = process.argv.slice(2);
  if (!folder) throw new Error('Give the folder that holds 00.jpg to 18.jpg.');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  await app.get(QueueService).start();
  const photos = app.get(PhotoService);
  const albums = app.get(AlbumService);

  const existing = (await photos.list(ALBUM)).data;
  for (const [position, alt] of DESCRIPTIONS.entries()) {
    if (existing.some((photo) => photo.position === position && photo.status === 'ready')) continue;
    const body = readFileSync(
      join(folder, `${String(FILES[position] ?? position).padStart(2, '0')}.jpg`),
    );
    const ticket = await photos.createUploadUrl(
      ALBUM,
      { position, contentType: 'image/jpeg', bytes: body.length },
      `seed-${ALBUM}-${String(position)}`,
      caller,
    );
    await putFile(ticket.uploadUrl, body);
    await photos.markUploaded(ticket.photo.id, caller);
    await photos.update(ticket.photo.id, { alt }, caller);
    process.stdout.write(`slot ${String(position)}: uploaded\n`);
  }

  const deadline = Date.now() + WAIT_MS;
  for (;;) {
    const ready = (await photos.list(ALBUM)).data.filter(
      (photo) => photo.status === 'ready',
    ).length;
    process.stdout.write(`ready: ${String(ready)} of ${String(DESCRIPTIONS.length)}\n`);
    if (ready === DESCRIPTIONS.length) break;
    if (Date.now() > deadline)
      throw new Error('The worker did not finish in five minutes. Is it running?');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  await albums.update(ALBUM, { coverFocalPoint: COVER_FOCAL_POINT }, caller);

  if (flag === '--publish') {
    const published = await albums.publish(ALBUM, caller);
    process.stdout.write(`published as /albums/${published.slug}\n`);
  }
  await app.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
