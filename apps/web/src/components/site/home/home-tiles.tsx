import type { Album, Photo as PhotoData } from "@vows/contracts";

import { Photo } from "@/components/site/photo/photo";
import { publicApi } from "@/lib/api";

import type { HomeTile } from "./home-canvas";
import { MAX_TILES } from "./home-layout";

function tile(album: Album, photo: PhotoData): HomeTile {
  return {
    key: `${album.id}-${photo.id}`,
    href: `/albums/${album.slug}`,
    label: album.coupleNames ?? album.title,
    // The largest tile is 230 wide, so the smallest file is always enough.
    picture: <Photo photo={photo} sizes="230px" className="w-full object-cover" />,
  };
}

/**
 * One tile for each published album, showing its cover. While fewer than a
 * canvas-full are published, the gaps are filled with other photographs from
 * the same albums, so the canvas is never a handful of tiles on an empty page.
 */
export async function homeTiles(): Promise<HomeTile[]> {
  const api = publicApi();
  const summaries = await api.albums.list();
  const albums = await Promise.all(
    summaries.slice(0, MAX_TILES).map((summary) => api.albums.get(summary.slug)),
  );

  const covers = albums.flatMap((album) => (album.cover ? [tile(album, album.cover)] : []));
  const rest: HomeTile[] = [];
  const deepest = Math.max(0, ...albums.map((album) => album.photos.length));
  // One photograph from each album in turn, so no album crowds out the others.
  for (let depth = 0; depth < deepest; depth += 1) {
    for (const album of albums) {
      const photo = album.photos[depth];
      if (photo) rest.push(tile(album, photo));
    }
  }
  return [...covers, ...rest].slice(0, MAX_TILES);
}
