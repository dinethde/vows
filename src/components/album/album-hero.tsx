import { albumBuckets, albumPhotos } from "~/data/album-photos";
import { formatAlbumDate, type Album } from "~/data/albums";
import { copy } from "~/data/copy";

/**
 * The event's full-viewport title card (DESIGN.md §12.3).
 *
 * One photograph at 100vw × 100svh with the navbar over it, and an 88px bar
 * along the bottom carrying the four metadata zones. The hero scrolls away
 * with the page — it does not pin, parallax or fade; only the navbar stays.
 *
 * `100svh` rather than `100vh`: on a phone the dynamic browser chrome would
 * otherwise crop the bar off the bottom of the first screen.
 */
export function AlbumHero({ album }: { album: Album }) {
  const photo = albumPhotos.hero;
  const bucket = albumBuckets.hero;
  const srcSet = (ext: string) =>
    bucket.widths.map((w) => `/albums/hero-hero-${w}.${ext} ${w}w`).join(", ");

  return (
    <header className="vows-album-hero relative h-[100svh] w-full overflow-hidden">
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes="100vw" />
        <source type="image/webp" srcSet={srcSet("webp")} sizes="100vw" />
        <img
          className="vows-album-hero-img size-full object-cover"
          src={`/albums/hero-hero-${bucket.widths[2]}.webp`}
          alt={photo.alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          style={{ backgroundImage: `url("${photo.lqip.hero}")`, backgroundSize: "cover" }}
        />
      </picture>

      <AlbumMetaBar album={album} />
    </header>
  );
}

/**
 * The four zones. One row at 1440 and 834; three stacked rows at 390, where
 * four across does not survive — the bar grows rather than the type shrinking
 * below the home page's minimum.
 */
function AlbumMetaBar({ album }: { album: Album }) {
  return (
    <div
      data-album-bar=""
      className="vows-album-bar absolute inset-x-0 bottom-0 flex min-h-[var(--album-bar-h)] flex-col justify-center gap-sm bg-chrome px-[var(--album-gutter)] py-md backdrop-blur-[var(--blur-chrome-bottom)] md:flex-row md:items-center md:justify-between md:gap-0"
    >
      <p className="text-couple shrink-0 font-serif text-ink">{album.couple}</p>

      <p className="text-bar order-last shrink-0 font-serif text-ink compact:hidden md:order-none md:w-[var(--bar-blurb-w)] md:px-lg">
        {album.story}
      </p>

      <div className="flex items-end justify-between gap-md md:contents">
        <div className="flex shrink-0 flex-col gap-[var(--album-meta-gap)]">
          <MetaRow label={copy.album.typeLabel} value={album.type} />
          <MetaRow label={copy.album.locationLabel} value={album.location} />
        </div>

        <p className="text-bar shrink-0 text-right font-serif text-ink md:px-lg md:text-center">
          <span className="italic lowercase">({album.timeOfDay})</span>
          <br />
          {formatAlbumDate(album.date)}
        </p>
      </div>
    </div>
  );
}

/**
 * The parenthetical-italic label pattern — quiet, lowercase, never competing
 * with the value beside it. Kept intact at every breakpoint.
 */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-album-meta flex items-center gap-[var(--album-meta-gap)] font-serif text-ink">
      <span className="shrink-0 italic lowercase md:w-[var(--album-label-w)]">
        ({label})
      </span>
      <span>{value}</span>
    </span>
  );
}
