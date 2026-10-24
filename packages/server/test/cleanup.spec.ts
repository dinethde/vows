import { album, enquiry, newId, photo, photoDerivative } from '@vows/db';
import { eq, inArray, like } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { HousekeepingService } from '../src/modules/housekeeping/housekeeping.service';
import { CleanupService } from '../src/modules/photo/cleanup.service';
import { StorageService } from '../src/storage/storage.service';

import { hasDatabase, startApp } from './harness';
import type { Harness } from './harness';

const live = hasDatabase && process.env.PIPELINE_LIVE === '1';
const ALBUM = 'alb_000020';
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY_MS);

describe.skipIf(!live)('cleanup, the only thing that deletes a photograph', () => {
  let harness: Harness;
  let cleanup: CleanupService;
  let storage: StorageService;
  const made: string[] = [];

  /** A photograph with one stored file, taken out of the album some days ago. */
  async function removed(
    position: number,
    days: number,
    status: 'ready' | 'pending' = 'ready',
  ): Promise<string> {
    const id = newId('photo');
    const key = `d/${id}/320.avif`;
    await harness.db.insert(photo).values({
      id,
      albumId: ALBUM,
      originalKey: `originals/${ALBUM}/${id}.jpg`,
      position,
      status,
      removedAt: daysAgo(days),
    });
    await harness.db.insert(photoDerivative).values({
      id: newId('derivative'),
      photoId: id,
      format: 'avif',
      width: 320,
      height: 213,
      key,
      bytes: 4,
    });
    await storage.writePublic(key, Buffer.from('test'), 'image/avif');
    made.push(id);
    return id;
  }

  const exists = async (id: string): Promise<boolean> =>
    (await harness.db.$count(photo, eq(photo.id, id))) === 1;

  beforeAll(async () => {
    harness = await startApp();
    cleanup = harness.app.get(CleanupService);
    storage = harness.app.get(StorageService);
  });

  afterAll(async () => {
    await harness.db.update(album).set({ coverPhotoId: null }).where(eq(album.id, ALBUM));
    if (made.length > 0) await harness.db.delete(photo).where(inArray(photo.id, made));
    await storage.deletePublic(made.map((id) => `d/${id}/320.avif`));
    await harness.app.close();
  });

  it('deletes a photograph removed thirty-one days ago, and its files', async () => {
    const id = await removed(101, 31);
    expect(await cleanup.run(ALBUM)).toBe(1);
    expect(await exists(id)).toBe(false);
    expect(await storage.listPublic(`d/${id}/`)).toEqual([]);
  });

  it('changes nothing when it runs a second time', async () => {
    expect(await cleanup.run(ALBUM)).toBe(0);
  });

  it('leaves a photograph removed five days ago where it is', async () => {
    const id = await removed(102, 5);
    expect(await cleanup.run(ALBUM)).toBe(0);
    expect(await exists(id)).toBe(true);
    expect(await storage.listPublic(`d/${id}/`)).toHaveLength(1);
  });

  it('gives a photograph that never finished only seven days', async () => {
    const id = await removed(103, 8, 'pending');
    expect(await cleanup.run(ALBUM)).toBe(1);
    expect(await exists(id)).toBe(false);
  });

  it('never deletes a photograph that is still an album’s cover', async () => {
    const id = await removed(104, 90);
    await harness.db.update(album).set({ coverPhotoId: id }).where(eq(album.id, ALBUM));
    expect(await cleanup.run(ALBUM)).toBe(0);
    expect(await exists(id)).toBe(true);
  });

  it('reports a stored file that no row points at, and deletes nothing', async () => {
    const key = `d/pho_orphantest${String(Date.now())}/320.avif`;
    await storage.writePublic(key, Buffer.from('test'), 'image/avif');
    const report = await harness.app.get(HousekeepingService).countOrphans();
    expect(report.filesWithNoRow).toBeGreaterThanOrEqual(1);
    expect(await storage.listPublic(key)).toEqual([key]);
    await storage.deletePublic([key]);
  });
});

describe.skipIf(!hasDatabase)('enquiry retention', () => {
  let harness: Harness;
  const email = `retention-${String(Date.now())}`;

  beforeAll(async () => {
    harness = await startApp();
  });

  afterAll(async () => {
    await harness.db.delete(enquiry).where(like(enquiry.email, `${email}%`));
    await harness.app.close();
  });

  it('deletes an enquiry older than twenty-four months and keeps a newer one', async () => {
    const row = (id: string, days: number) => ({
      id,
      name: 'Test',
      email: `${email}-${id}@example.com`,
      createdAt: daysAgo(days),
    });
    const old = newId('enquiry');
    const recent = newId('enquiry');
    await harness.db.insert(enquiry).values([row(old, 800), row(recent, 600)]);

    await harness.app.get(HousekeepingService).deleteOldEnquiries();

    expect(await harness.db.$count(enquiry, eq(enquiry.id, old))).toBe(0);
    expect(await harness.db.$count(enquiry, eq(enquiry.id, recent))).toBe(1);
  });
});
