import { albumsApi } from "./albums";
import type { AlbumsApi } from "./albums";
import { enquiriesApi } from "./enquiries";
import type { EnquiriesApi } from "./enquiries";
import { photosApi } from "./photos";
import type { PhotosApi } from "./photos";
import { createTransport } from "./transport";
import type { TokenGetter } from "./transport";

export interface ApiClient {
  albums: AlbumsApi;
  photos: PhotosApi;
  enquiries: EnquiriesApi;
}

/** One method per endpoint. A screen that needs a new call adds a method, not a fetch. */
export function createApiClient(getToken?: TokenGetter): ApiClient {
  const request = createTransport(getToken);
  return {
    albums: albumsApi(request),
    photos: photosApi(request),
    enquiries: enquiriesApi(request),
  };
}
