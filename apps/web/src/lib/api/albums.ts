import { album, albumSummary, page, studioAlbum, studioAlbumList } from '@vows/contracts';
import type {
  Album,
  AlbumSummary,
  StudioAlbum,
  StudioAlbumList,
  UpdateAlbum,
} from '@vows/contracts';

import type { Transport } from './transport';

const albumList = page(albumSummary);

export interface AlbumsApi {
  list: () => Promise<AlbumSummary[]>;
  get: (slug: string) => Promise<Album>;
  listForStudio: () => Promise<StudioAlbumList>;
  getForStudio: (id: string) => Promise<StudioAlbum>;
  update: (id: string, body: UpdateAlbum) => Promise<StudioAlbum>;
  publish: (id: string) => Promise<StudioAlbum>;
  unpublish: (id: string) => Promise<StudioAlbum>;
}

export function albumsApi(request: Transport): AlbumsApi {
  return {
    list: async () =>
      (await request('/v1/albums', { schema: albumList, next: { tags: ['albums'] } })).data,
    get: (slug) =>
      request(`/v1/albums/${slug}`, { schema: album, next: { tags: ['albums', `album:${slug}`] } }),
    listForStudio: () => request('/v1/studio/albums', { schema: studioAlbumList }),
    getForStudio: (id) => request(`/v1/studio/albums/${id}`, { schema: studioAlbum }),
    update: (id, body) =>
      request(`/v1/studio/albums/${id}`, { method: 'PATCH', body, schema: studioAlbum }),
    publish: (id) =>
      request(`/v1/studio/albums/${id}/publish`, { method: 'POST', schema: studioAlbum }),
    unpublish: (id) =>
      request(`/v1/studio/albums/${id}/unpublish`, { method: 'POST', schema: studioAlbum }),
  };
}
