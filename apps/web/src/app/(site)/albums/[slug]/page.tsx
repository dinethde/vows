import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import type { ReactElement } from "react";

import type { Album } from "@vows/contracts";
import { AlbumGallery } from "@/components/site/album/album-gallery";
import { AlbumHero } from "@/components/site/album/album-hero";
import { SiteFooter } from "@/components/site/footer/site-footer";
import { env } from "@/config/env";
import { ApiError, publicApi } from "@/lib/api";

export interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

/** Built ahead of time for every published album, and rebuilt when one is published. */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const albums = await publicApi().albums.list();
  return albums.map((album) => ({ slug: album.slug }));
}

/** An unknown slug is a real 404. An old one is a redirect to where the album lives now. */
async function load(slug: string): Promise<Album> {
  try {
    const album = await publicApi().albums.get(slug);
    if (album.slug !== slug) permanentRedirect(`/albums/${album.slug}`);
    return album;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

function firstSentence(text: string | null): string {
  const sentence = (text ?? "").split(/(?<=[.!?])\s/)[0] ?? "";
  return sentence.slice(0, 160);
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const album = await load((await params).slug);
  const title = album.seoTitle ?? album.coupleNames ?? album.title;
  const description = album.seoDescription ?? firstSentence(album.story);
  return {
    title,
    description,
    alternates: { canonical: `/albums/${album.slug}` },
    openGraph: {
      type: "article",
      title: `${title} · Vows`,
      description,
      url: `${env.SITE_URL}/albums/${album.slug}`,
    },
    twitter: { card: "summary_large_image" },
  };
}

function structuredData(album: Album): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.coupleNames ?? album.title,
    url: `${env.SITE_URL}/albums/${album.slug}`,
    ...(album.shotOn ? { datePublished: album.shotOn } : {}),
    ...(album.story ? { description: album.story } : {}),
    image: album.photos.flatMap((photo) => {
      const file = photo.derivatives.find((item) => item.format === "webp" && item.width === 1600);
      return file
        ? [{ "@type": "ImageObject", contentUrl: file.url, description: photo.alt ?? "" }]
        : [];
    }),
  };
  // A story is plain text, but `<` is escaped anyway so it can never close the tag.
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export default async function AlbumPage({ params }: AlbumPageProps): Promise<ReactElement> {
  const album = await load((await params).slug);
  return (
    <>
      <main id="main" className="relative z-10">
        <AlbumHero album={album} />
        <AlbumGallery photos={album.photos} />
        {/* Structured data has to be a script tag. Its text is escaped above. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData(album) }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
