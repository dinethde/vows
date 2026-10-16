import { page, photo, uploadTicket } from '@vows/contracts';
import type {
  CreateUploadUrl,
  Photo,
  ReorderPhotos,
  UpdatePhoto,
  UploadTicket,
} from '@vows/contracts';

import type { Transport } from './transport';

const photoList = page(photo);

export interface PhotosApi {
  list: (albumId: string) => Promise<Photo[]>;
  /** The key is made once per file and repeated on a retry, so one file is one row. */
  uploadUrl: (
    albumId: string,
    body: CreateUploadUrl,
    idempotencyKey: string,
  ) => Promise<UploadTicket>;
  markUploaded: (id: string) => Promise<Photo>;
  update: (id: string, body: UpdatePhoto) => Promise<Photo>;
  remove: (id: string) => Promise<void>;
  reorder: (albumId: string, body: ReorderPhotos) => Promise<Photo[]>;
}

export function photosApi(request: Transport): PhotosApi {
  return {
    list: async (albumId) =>
      (await request(`/v1/studio/albums/${albumId}/photos`, { schema: photoList })).data,
    uploadUrl: (albumId, body, idempotencyKey) =>
      request(`/v1/studio/albums/${albumId}/photos/upload-url`, {
        method: 'POST',
        body,
        idempotencyKey,
        schema: uploadTicket,
      }),
    markUploaded: (id) =>
      request(`/v1/studio/photos/${id}/uploaded`, { method: 'POST', schema: photo }),
    update: (id, body) =>
      request(`/v1/studio/photos/${id}`, { method: 'PATCH', body, schema: photo }),
    remove: (id) => request(`/v1/studio/photos/${id}`, { method: 'DELETE' }),
    reorder: async (albumId, body) =>
      (
        await request(`/v1/studio/albums/${albumId}/order`, {
          method: 'PUT',
          body,
          schema: photoList,
        })
      ).data,
  };
}
