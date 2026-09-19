import { useEffect } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import gsap from "gsap";

import { AlbumGallery } from "~/components/album/album-gallery";
import { AlbumHero } from "~/components/album/album-hero";
import { SiteHeader } from "~/components/site-header";
import { SkipLink } from "~/components/skip-link";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { readMotion } from "~/lib/motion";
import { getAlbum } from "~/data/albums";
import { copy } from "~/data/copy";

export const Route = createFileRoute("/_site/albums/$slug")({
  // Resolved in the loader so a deep link to a missing album 404s on the
  // server rather than flashing an empty page on the client.
  loader: ({ params }) => {
    const album = getAlbum(params.slug);
    if (!album) throw notFound();
    return { album };
  },
  // An album URL is the shareable unit of this site — a couple sends it to
  // family in a chat app — so it has to unfurl as a photograph and a name
  // rather than a bare link on a photography portfolio.
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { album } = loaderData;
    const title = `${album.couple} — ${copy.meta.title}`;
    const url = `${copy.meta.siteUrl}/albums/${album.slug}`;
    // Absolute, and the 1280 derivative: it already exists, and it is the
    // widest that stays under the 5MB most unfurlers will fetch.
    const image = `${copy.meta.siteUrl}/albums/hero-hero-1280.webp`;

    return {
      meta: [
        { title },
        { name: "description", content: album.story },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: album.story },
        { property: "og:image", content: image },
        { property: "og:url", content: url },
        { property: "og:site_name", content: copy.footer.wordmark },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: album.story },
        { name: "twitter:image", content: image },
      ],
      // `getAlbum` is an exact-match lookup, so there is one URL per album
      // and nothing for a crawler to have to choose between.
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: AlbumNotFound,
  component: AlbumPage,
});

function AlbumPage() {
  const { album } = Route.useLoaderData();
  const reducedMotion = useReducedMotion();

  // Page entry (DESIGN.md §12.7): the hero fades up and the metadata bar
  // arrives a beat later.
  useEffect(() => {
    const motion = readMotion();
    const context = gsap.context(() => {
      gsap.fromTo(
        ".vows-album-hero-img",
        { opacity: 0 },
        {
          opacity: 1,
          duration: reducedMotion ? motion["motion-base"] : motion["album-hero-enter"],
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        "[data-album-bar]",
        reducedMotion ? { opacity: 0 } : { opacity: 0, y: motion["chrome-reveal-y"] },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? motion["motion-base"] : motion["album-hero-enter"],
          delay: motion["album-bar-delay"],
          ease: "power3.out",
        },
      );
    });
    return () => context.revert();
  }, [album.slug, reducedMotion]);

  return (
    <>
      <SkipLink />
      <SiteHeader revealed />
      <main className="vows-album bg-canvas">
        <AlbumHero album={album} />
        <section aria-label={copy.a11y.albumGallery(album.couple)}>
          <AlbumGallery album={album} />
        </section>
      </main>
    </>
  );
}

function AlbumNotFound() {
  return (
    <>
      <SiteHeader revealed />
      <main className="flex h-[100svh] flex-col items-center justify-center gap-lg bg-canvas text-center">
        <p className="text-display font-serif text-ink">
          {copy.a11y.albumNotFound}
        </p>
        <Link
          className="text-body font-serif text-ink-muted underline"
          to="/"
        >
          {copy.a11y.backToGallery}
        </Link>
      </main>
    </>
  );
}
