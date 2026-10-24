import type { CreateUploadUrl, UploadTicket } from '@vows/contracts';

import type { ProgressListener } from './put-file';
import { isUploadMime, refusal } from './validate';

/** Three files travel at once. The rest wait their turn. */
export const MAX_PARALLEL = 3;

export type UploadStatus = 'queued' | 'uploading' | 'error';

export interface UploadItem {
  /** The idempotency key: made once for this file and sent again on every retry. */
  key: string;
  albumId: string;
  position: number;
  file: File;
  status: UploadStatus;
  /** 0 to 100, from the browser's own upload progress event. */
  progress: number;
  /** Why it failed, in words for the photographer. */
  message: string | null;
}

/** A file that never started: the wrong type, too large, or nowhere to put it. */
export interface Rejection {
  id: string;
  albumId: string;
  message: string;
}

export interface UploadState {
  items: readonly UploadItem[];
  rejections: readonly Rejection[];
}

export interface UploadDeps {
  uploadUrl: (albumId: string, body: CreateUploadUrl, key: string) => Promise<UploadTicket>;
  markUploaded: (photoId: string) => Promise<unknown>;
  put: (url: string, file: File, onProgress: ProgressListener) => Promise<void>;
  /** Called once the API knows about the file, so the album's list is read again. */
  settled: (albumId: string) => Promise<unknown>;
  newKey: () => string;
}

export interface Placement {
  file: File;
  position: number;
}

const FALLBACK = 'The upload did not finish. Check the connection and try again.';

function reason(error: unknown): string {
  return error instanceof Error && error.name === 'ApiError' ? error.message : FALLBACK;
}

/**
 * Every upload in the Studio, whichever album it belongs to. It lives above the
 * pages, so opening the dashboard does not stop a file that is on its way.
 * React reads it through `subscribe` and `getState`; nothing here knows React.
 */
export class UploadQueue {
  private state: UploadState = { items: [], rejections: [] };
  private readonly listeners = new Set<() => void>();

  constructor(private readonly deps: UploadDeps) {}

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getState = (): UploadState => this.state;

  /** Files the browser check turns away are reported and never take a slot. */
  add(albumId: string, placements: Placement[]): void {
    const fresh = placements.filter(({ file }) => refusal(file) === null);
    const positions = new Set(fresh.map((placement) => placement.position));
    const kept = this.state.items.filter(
      (item) =>
        item.albumId !== albumId || item.status !== 'error' || !positions.has(item.position),
    );
    const items = fresh.map(
      ({ file, position }): UploadItem => ({
        key: this.deps.newKey(),
        albumId,
        position,
        file,
        status: 'queued',
        progress: 0,
        message: null,
      }),
    );
    this.set({ items: [...kept, ...items], rejections: this.state.rejections });
    this.pump();
  }

  reject(albumId: string, messages: string[]): void {
    const rejections = messages.map((message) => ({ id: this.deps.newKey(), albumId, message }));
    this.set({ items: this.state.items, rejections: [...this.state.rejections, ...rejections] });
  }

  /** The same file, the same key, so the API answers with the same row. */
  retry(key: string): void {
    this.patch(key, { status: 'queued', progress: 0, message: null });
    this.pump();
  }

  clearRejections(albumId: string): void {
    const rejections = this.state.rejections.filter((entry) => entry.albumId !== albumId);
    if (rejections.length !== this.state.rejections.length) {
      this.set({ items: this.state.items, rejections });
    }
  }

  private pump(): void {
    const running = this.state.items.filter((item) => item.status === 'uploading').length;
    const waiting = this.state.items.filter((item) => item.status === 'queued');
    for (const item of waiting.slice(0, Math.max(0, MAX_PARALLEL - running))) {
      this.patch(item.key, { status: 'uploading' });
      void this.run(item);
    }
  }

  private async run(item: UploadItem): Promise<void> {
    try {
      const contentType = item.file.type;
      if (!isUploadMime(contentType)) throw new Error('unsupported');
      const ticket = await this.deps.uploadUrl(
        item.albumId,
        { position: item.position, contentType, bytes: item.file.size },
        item.key,
      );
      await this.deps.put(ticket.uploadUrl, item.file, (progress) => {
        this.patch(item.key, { progress });
      });
      await this.deps.markUploaded(ticket.photo.id);
      // The list is read before the item goes, so the slot never blinks empty.
      await this.deps.settled(item.albumId).catch(() => undefined);
      this.set({
        items: this.state.items.filter((entry) => entry.key !== item.key),
        rejections: this.state.rejections,
      });
    } catch (error) {
      this.patch(item.key, { status: 'error', message: reason(error) });
    } finally {
      this.pump();
    }
  }

  private patch(key: string, change: Partial<UploadItem>): void {
    this.set({
      items: this.state.items.map((item) => (item.key === key ? { ...item, ...change } : item)),
      rejections: this.state.rejections,
    });
  }

  private set(next: UploadState): void {
    this.state = next;
    for (const listener of this.listeners) listener();
  }
}
