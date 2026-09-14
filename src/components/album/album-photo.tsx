import { useState } from "react";

import {
  albumBuckets,
  albumPhotos,
  type AlbumPhoto as AlbumPhotoData,
  type AlbumPhotoId,
} from "~/data/album-photos";
import { familyBucket, type SizeFamily } from "~/data/album-layout";
import { cn } from "~/lib/utils";

/**
 * One photograph in the album gallery (DESIGN.md §12.6).
 *
 * Three nested elements, one per motion, so nothing fights over `transform`:
 *   outer — idle float, written every tick
 *   inner — scroll reveal, tweened once on entry
 *   img   — its own load fade over the placeholder
 *
 * The wrapper carries the slot's exact width and height, so the box is reserved
 * before the image arrives and nothing shifts.
 */
export function AlbumPhoto({
  id,
  family,
  width,
  height,
  index,
  eager,
  fullBleed,
  className,
  style,
}: {
  id: AlbumPhotoId;
  family: SizeFamily;
  width: number;
  height: number;
  index: number;
  eager: boolean;
  fullBleed: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Typed through the declared shape: the generated module is `as const`, which
  // narrows each photograph's crop map to the buckets it actually has.
  const photo: AlbumPhotoData = albumPhotos[id];
  // The slot's crop, not the photograph's "natural" one. Albums rotate through
  // a shared pool, so any photograph can land in any slot — every one is
  // therefore generated in every gallery crop, and the slot picks the aspect
  // and the width set that actually fit it.
  const bucketName = familyBucket[family];
  const bucket = albumBuckets[bucketName];
  const lqip = photo.lqip[bucketName];
  const [loaded, setLoaded] = useState(false);

  const srcSet = (ext: string) =>
    bucket.widths
      .map((w) => `/albums/${id}-${bucketName}-${w}.${ext} ${w}w`)
      .join(", ");

  return (
    <div
      className={cn("vows-album-photo absolute", className)}
      data-album-photo={index}
      data-album-family={family}
      {...(fullBleed ? { "data-album-fullbleed": "" } : {})}
      style={{ width: `${width}px`, height: `${height}px`, ...style }}
    >
      <div
        className="vows-album-reveal size-full"
        data-album-reveal=""
        style={{
          // The placeholder is the element's own background, so it is painted
          // with the box rather than as a second image request.
          backgroundImage: `url("${lqip}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <picture>
          <source type="image/avif" srcSet={srcSet("avif")} sizes={`${width}px`} />
          <source type="image/webp" srcSet={srcSet("webp")} sizes={`${width}px`} />
          <img
            className="vows-album-img size-full object-cover"
            src={`/albums/${id}-${bucketName}-${bucket.widths[1]}.webp`}
            alt={photo.alt}
            width={width}
            height={height}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            decoding="async"
            draggable={false}
            data-loaded={loaded}
            onLoad={() => setLoaded(true)}
          />
        </picture>
      </div>
    </div>
  );
}
