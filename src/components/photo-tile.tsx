import { Link } from "@tanstack/react-router";

import { copy } from "~/data/copy";
import { photos } from "~/data/photos";
import { CAPTION_HEIGHT, tileSlug, type Tile } from "~/data/tiles";

type PhotoTileProps = {
  tile: Tile;
  /** Only the primary lattice copy is in the tab order (DESIGN.md §6). */
  primary: boolean;
  /** Tiles inside the first viewport load eagerly; the rest are lazy. */
  eager: boolean;
};

/**
 * One photograph in the scatter (DESIGN.md §3.2). The outer element is the
 * ticker's target — only it is written to on a frame. The frame inside carries
 * the entrance and hover transforms, so the two never fight.
 */
export function PhotoTile({ tile, primary, eager }: PhotoTileProps) {
    const photo = photos[tile.photo as keyof typeof photos];
    const base = `/photos/${tile.photo}`;

    return (
      <div
        className="vows-tile absolute"
        data-tile={tile.index}
        style={{
          left: `${tile.x}px`,
          top: `${tile.y}px`,
          width: `${tile.w}px`,
        }}
      >
        {/* A router Link rather than a bare anchor: opening an album is a
            client-side navigation, so browser back returns to a canvas that is
            still mounted and still where the visitor left it. */}
        <Link
          className="vows-tile-link group block"
          to="/albums/$slug"
          params={{ slug: tileSlug(tile) }}
          draggable={false}
          aria-label={copy.a11y.photoAlt(tile.couple)}
          tabIndex={primary ? undefined : -1}
        >
          <span
            className="vows-tile-frame block overflow-hidden bg-tile-ground"
            style={{ width: `${tile.w}px`, height: `${tile.h}px` }}
          >
            <picture>
              <source
                type="image/avif"
                srcSet={`${base}@1x.avif 1x, ${base}@2x.avif 2x`}
              />
              <source
                type="image/webp"
                srcSet={`${base}@1x.webp 1x, ${base}@2x.webp 2x`}
              />
              <img
                className="vows-tile-img size-full object-cover"
                src={`${base}@1x.webp`}
                alt={photo.alt}
                width={tile.w}
                height={tile.h}
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
                decoding="async"
                draggable={false}
              />
            </picture>
          </span>
          <span
            className="vows-tile-caption text-caption block truncate px-3xs font-sans font-medium text-caption-ink"
            style={{
              marginTop: `${tile.gap}px`,
              height: `${CAPTION_HEIGHT}px`,
              maxWidth: `max(var(--caption-min-w), ${tile.w}px)`,
            }}
          >
            {tile.couple}
          </span>
        </Link>
      </div>
    );
}
