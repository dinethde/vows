import { Inject, Injectable } from '@nestjs/common';
import { COVER_POSITION } from '@vows/contracts';
import type {
  CreateUploadUrl,
  Photo,
  ReorderPhotos,
  UpdatePhoto,
  UploadTicket,
} from '@vows/contracts';
import type { Db, Tx } from '@vows/db';

import { DomainError, NotFoundError } from '../../common/errors/domain-error';
import { DB } from '../../database/database.module';
import { QueueService } from '../../queue/queue.service';
import { PRESIGN_SECONDS, StorageService } from '../../storage/storage.service';
import { toPhoto } from '../album/album.mapper';
import { AlbumRepository } from '../album/album.repository';
import type { Caller } from '../album/album.service';
import { AuditService } from '../audit/audit.service';

import { PhotoRepository } from './photo.repository';
import type { PhotoRow } from './photo.repository';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tif',
};

@Injectable()
export class PhotoService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly repo: PhotoRepository,
    private readonly albums: AlbumRepository,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
    private readonly audit: AuditService,
  ) {}

  async list(albumId: string): Promise<{ data: Photo[]; nextCursor: null }> {
    await this.loadAlbum(albumId);
    const rows = await this.albums.photosOf([albumId]);
    return {
      data: rows.map((row) => toPhoto(row, (key) => this.storage.publicUrl(key))),
      nextCursor: null,
    };
  }

  /**
   * A row and somewhere to put the file. The bytes never come here. A slot
   * that already holds a photograph is a replacement: a new row with a new id,
   * so no cached file ever changes under its address.
   */
  async createUploadUrl(
    albumId: string,
    body: CreateUploadUrl,
    idempotencyKey: string | undefined,
    caller: Caller,
  ): Promise<UploadTicket> {
    await this.loadAlbum(albumId);
    const repeat = idempotencyKey
      ? await this.repo.findByIdempotencyKey(idempotencyKey)
      : undefined;
    const row =
      (repeat ? await this.reopen(repeat) : undefined) ??
      (await this.db.transaction(async (tx) => {
        const old = await this.repo.findInSlot(tx, albumId, body.position);
        if (old) await this.repo.update(tx, old.id, { supersededAt: new Date() });
        const created = await this.repo.insert(tx, {
          albumId,
          position: body.position,
          mime: body.contentType,
          idempotencyKey: idempotencyKey ?? null,
          alt: old?.alt ?? null,
          replacesPhotoId: old?.id ?? null,
          extension: EXTENSIONS[body.contentType] ?? 'bin',
        });
        // The cover follows its replacement in the same transaction, so an
        // album never points at a photograph on its way out.
        if (body.position === COVER_POSITION) await this.repo.setCover(tx, albumId, created.id);
        await this.audit.record(tx, caller.actor, {
          action: old ? 'photo.replace' : 'photo.add',
          entity: 'photo',
          entityId: created.id,
          diff: { albumId, position: body.position, replaces: old?.id ?? null },
        });
        return created;
      }));

    return {
      photo: this.present(row),
      uploadUrl: await this.storage.presignUpload(row.originalKey, row.mime ?? body.contentType),
      expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
    };
  }

  /** The browser says the transfer finished. We check, then hand over to the worker. */
  async markUploaded(id: string, caller: Caller): Promise<Photo> {
    const row = await this.load(id);
    if (row.status !== 'pending') return this.present(row);

    const bytes = await this.storage.originalSize(row.originalKey);
    if (bytes === null) {
      throw new DomainError('photo_not_uploaded', 'The file did not arrive. Try the upload again.');
    }
    const next = await this.db.transaction(async (tx) => {
      const updated = await this.repo.update(tx, id, {
        status: 'processing',
        bytes,
        errorCode: null,
      });
      await this.queue.send(tx, 'photo.derive', { photoId: id, requestId: caller.requestId });
      return updated;
    });
    return this.present(next);
  }

  async update(id: string, body: UpdatePhoto, caller: Caller): Promise<Photo> {
    const row = await this.load(id);
    const album = await this.loadAlbum(row.albumId);
    if (album.status === 'published' && body.alt === null) {
      throw new DomainError(
        'album_not_publishable',
        'This album is on the website, and every photograph there needs a description.',
        { alt: 'Describe this photograph.' },
      );
    }
    const next = await this.db.transaction(async (tx) => {
      const updated = await this.repo.update(
        tx,
        id,
        body.alt === undefined ? {} : { alt: body.alt },
      );
      await this.audit.record(tx, caller.actor, {
        action: 'photo.update',
        entity: 'photo',
        entityId: id,
        diff: body,
      });
      if (album.status === 'published') await this.revalidate(tx, album, caller);
      return updated;
    });
    return this.present(next);
  }

  /** Out of the album, with every file left where it is for thirty days. */
  async remove(id: string, caller: Caller): Promise<void> {
    const row = await this.load(id);
    if (row.removedAt) return;
    const album = await this.loadAlbum(row.albumId);
    if (album.status === 'published') {
      throw new DomainError(
        'album_not_publishable',
        'This album is on the website and needs every photograph. Replace this one, or move the album back to draft first.',
      );
    }
    await this.db.transaction(async (tx) => {
      await this.repo.update(tx, id, { removedAt: new Date() });
      if (album.coverPhotoId === id) await this.repo.setCover(tx, album.id, null);
      await this.audit.record(tx, caller.actor, {
        action: 'photo.remove',
        entity: 'photo',
        entityId: id,
      });
      await this.queue.send(tx, 'photo.cleanup', {
        albumId: album.id,
        requestId: caller.requestId,
      });
    });
  }

  async reorder(
    albumId: string,
    body: ReorderPhotos,
    caller: Caller,
  ): Promise<{ data: Photo[]; nextCursor: null }> {
    const album = await this.loadAlbum(albumId);
    const gallery = (await this.albums.photosOf([albumId])).filter(
      (row) => row.position !== COVER_POSITION,
    );
    const sent = body.slots.filter((id): id is string => id !== null);
    const same = sent.length === gallery.length && new Set(sent).size === sent.length;
    if (!same || !gallery.every((row) => sent.includes(row.id))) {
      throw new DomainError(
        'bad_request',
        'The new order must list every photograph in this album once.',
        {
          slots: 'List each photograph once.',
        },
      );
    }
    await this.db.transaction(async (tx) => {
      await this.repo.reorder(tx, albumId, body.slots);
      await this.audit.record(tx, caller.actor, {
        action: 'photo.reorder',
        entity: 'album',
        entityId: albumId,
      });
      if (album.status === 'published') await this.revalidate(tx, album, caller);
    });
    return this.list(albumId);
  }

  /**
   * The same key asking again gets the same row. A row the worker gave up on
   * goes back to waiting for its file, or the retry would change nothing.
   */
  private async reopen(row: PhotoRow): Promise<PhotoRow> {
    if (row.status !== 'failed') return row;
    return this.repo.update(this.db, row.id, { status: 'pending', errorCode: null });
  }

  private present(row: PhotoRow): Photo {
    return toPhoto({ ...row, derivatives: [] }, (key) => this.storage.publicUrl(key));
  }

  private async load(id: string): Promise<PhotoRow> {
    const row = await this.repo.findById(id);
    if (!row || row.supersededAt)
      throw new NotFoundError('photo_not_found', 'We could not find that photograph.');
    return row;
  }

  private async loadAlbum(
    id: string,
  ): Promise<NonNullable<Awaited<ReturnType<AlbumRepository['findById']>>>> {
    const row = await this.albums.findById(id);
    if (!row) throw new NotFoundError('album_not_found', 'We could not find that album.');
    return row;
  }

  private revalidate(tx: Tx, album: { id: string; slug: string }, caller: Caller): Promise<void> {
    return this.queue.send(tx, 'album.revalidate', {
      albumId: album.id,
      slug: album.slug,
      requestId: caller.requestId,
    });
  }
}
