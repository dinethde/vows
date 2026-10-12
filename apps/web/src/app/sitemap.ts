import type { MetadataRoute } from 'next';

import { env } from '@/config/env';
import { publicApi } from '@/lib/api';

/** Published albums only, plus the three pages that are always there. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const albums = await publicApi().albums.list();
  const base = env.SITE_URL.replace(/\/$/, '');
  return [
    { url: `${base}/` },
    { url: `${base}/contact` },
    { url: `${base}/privacy` },
    ...albums.map((album) => ({
      url: `${base}/albums/${album.slug}`,
      ...(album.publishedAt ? { lastModified: new Date(album.publishedAt) } : {}),
    })),
  ];
}
