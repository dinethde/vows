import { Inject, Injectable } from '@nestjs/common';
import type {
  Album,
  AlbumSummary,
  StudioAlbum,
  StudioAlbumList,
  UpdateAlbum,
} from '@vows/contracts';
import type { Db, Tx } from '@vows/db';

import { DomainError, NotFoundError } from '../../common/errors/domain-error';
import type { Actor } from '../../common/request';
import { DB } from '../../database/database.module';
import { QueueService } from '../../queue/queue.service';
import { StorageService } from '../../storage/storage.service';
import { AuditService } from '../audit/audit.service';

import { toAlbum, toStudioSummary, toSummary } from './album.mapper';
import { AlbumRepository } from './album.repository';
import type { AlbumChanges, AlbumRow } from './album.repository';
import { problemFields, publishProblems } from './publish-checks';

export interface Caller {
  actor: Actor;
  requestId: string;
}

const SUFFIX_TRIES = 20;

function toChanges(body: UpdateAlbum): AlbumChanges {
  const { coverFocalPoint, coupleNames, ...rest } = body;
  // Only what was sent. A key left out must not overwrite a column.
  const sent = Object.entries(rest).filter(([, value]) => value !== undefined);
  const changes = Object.fromEntries(sent) as AlbumChanges;
  if (coupleNames !== undefined) {
    changes.coupleNames = coupleNames;
    // The form has one field for both. The title follows the couple's names.
    if (coupleNames) changes.title = coupleNames;
  }
  if (coverFocalPoint !== undefined) {
    changes.coverFocalX = coverFocalPoint?.x ?? null;
    changes.coverFocalY = coverFocalPoint?.y ?? null;
  }
  return changes;
}

@Injectable()
export class AlbumService {
  private readonly urlFor: (key: string) => string;

  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly repo: AlbumRepository,
    private readonly queue: QueueService,
    private readonly audit: AuditService,
    storage: StorageService,
  ) {
    this.urlFor = (key) => storage.publicUrl(key);
  }

  async listPublished(): Promise<{ data: AlbumSummary[]; nextCursor: null }> {
    const rows = await this.repo.listPublished();
    const photos = await this.repo.photosOf(rows.map((row) => row.id));
    return { data: rows.map((row) => toSummary(row, photos, this.urlFor)), nextCursor: null };
  }

  /** An old slug answers with the album at its new one; the page redirects. */
  async getPublished(slug: string): Promise<Album> {
    const row = (await this.repo.findBySlug(slug)) ?? (await this.repo.findByOldSlug(slug));
    if (row?.status !== 'published')
      throw new NotFoundError('album_not_found', 'This album is not here.');
    return toAlbum(row, await this.repo.photosOf([row.id]), this.urlFor);
  }

  async listForStudio(): Promise<StudioAlbumList> {
    const rows = await this.repo.listAll();
    const photos = await this.repo.photosOf(rows.map((row) => row.id));
    const data = rows.map((row) => toStudioSummary(row, photos, this.urlFor));
    const count = (stage: string): number => data.filter((item) => item.stage === stage).length;
    return {
      data,
      nextCursor: null,
      counts: {
        all: data.length,
        published: count('published'),
        draft: count('draft'),
        untouched: count('untouched'),
      },
    };
  }

  async getForStudio(id: string): Promise<StudioAlbum> {
    return this.present(await this.load(id));
  }

  async update(id: string, body: UpdateAlbum, caller: Caller): Promise<StudioAlbum> {
    const before = await this.load(id);
    const after = await this.db.transaction(async (tx) => {
      const slugChanged = body.slug !== undefined && body.slug !== before.slug;
      if (slugChanged) await this.claimSlug(tx, before, body.slug ?? before.slug);

      const row = await this.repo.update(tx, id, toChanges(body));
      // A live album stays complete: an edit that would break it is refused.
      if (row.status === 'published') await this.assertPublishable(tx, row);
      await this.audit.record(tx, caller.actor, {
        action: 'album.update',
        entity: 'album',
        entityId: id,
        diff: body,
      });
      if (row.status === 'published') {
        await this.revalidate(tx, row, caller, slugChanged ? before.slug : undefined);
      }
      return row;
    });
    return this.present(after);
  }

  async publish(id: string, caller: Caller): Promise<StudioAlbum> {
    await this.load(id);
    const row = await this.db.transaction(async (tx) => {
      const album = await this.repo.lock(tx, id);
      if (!album) throw new NotFoundError('album_not_found', 'We could not find that album.');
      await this.assertPublishable(tx, album);
      const next = await this.repo.update(tx, id, {
        status: 'published',
        publishedAt: album.publishedAt ?? new Date(),
      });
      await this.audit.record(tx, caller.actor, {
        action: 'album.publish',
        entity: 'album',
        entityId: id,
      });
      await this.revalidate(tx, next, caller);
      await this.queue.send(tx, 'photo.cleanup', { albumId: id, requestId: caller.requestId });
      return next;
    });
    return this.present(row);
  }

  /** Off the site, with every row and file left where it is. */
  async unpublish(id: string, caller: Caller): Promise<StudioAlbum> {
    const album = await this.load(id);
    if (album.status !== 'published') {
      throw new DomainError(
        'album_not_published',
        'This album is not on the website, so there is nothing to take down.',
      );
    }
    const row = await this.db.transaction(async (tx) => {
      const next = await this.repo.update(tx, id, { status: 'draft' });
      await this.audit.record(tx, caller.actor, {
        action: 'album.unpublish',
        entity: 'album',
        entityId: id,
      });
      await this.revalidate(tx, next, caller);
      return next;
    });
    return this.present(row);
  }

  private async load(id: string): Promise<AlbumRow> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError('album_not_found', 'We could not find that album.');
    return row;
  }

  private async present(row: AlbumRow): Promise<StudioAlbum> {
    const photos = await this.repo.photosOf([row.id]);
    const summary = toStudioSummary(row, photos, this.urlFor);
    return { ...summary, photos: toAlbum(row, photos, this.urlFor).photos };
  }

  private async assertPublishable(tx: Tx, album: AlbumRow): Promise<void> {
    const problems = publishProblems(album, await this.repo.photosOf([album.id], tx));
    if (problems.length === 0) return;
    const fields = problemFields(problems);
    const first = Object.values(fields)[0] ?? '';
    const more = problems.length > 1 ? ` And ${String(problems.length - 1)} more.` : '';
    throw new DomainError(
      'album_not_publishable',
      `This album cannot go out yet. ${first}${more}`,
      fields,
    );
  }

  private async claimSlug(tx: Tx, album: AlbumRow, slug: string): Promise<void> {
    if (await this.repo.slugTaken(slug, album.id, tx)) {
      throw new DomainError(
        'slug_taken',
        `That address is taken. Try ${await this.freeSlug(tx, album.id, slug)}.`,
        {
          slug: 'Taken',
        },
      );
    }
    await this.repo.redirect(tx, album.slug, slug, album.id);
  }

  private async freeSlug(tx: Tx, albumId: string, slug: string): Promise<string> {
    for (let suffix = 2; suffix < SUFFIX_TRIES; suffix += 1) {
      const candidate = `${slug}-${String(suffix)}`;
      if (!(await this.repo.slugTaken(candidate, albumId, tx))) return candidate;
    }
    return `${slug}-${String(Date.now())}`;
  }

  private revalidate(tx: Tx, album: AlbumRow, caller: Caller, oldSlug?: string): Promise<void> {
    return this.queue.send(tx, 'album.revalidate', {
      albumId: album.id,
      slug: album.slug,
      ...(oldSlug ? { oldSlug } : {}),
      requestId: caller.requestId,
    });
  }
}
