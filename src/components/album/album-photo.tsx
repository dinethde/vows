import { useEffect, useRef, useState } from "react";

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
  fullBleed,
  className,
  style,
}: {
  id: AlbumPhotoId;
  family: SizeFamily;
  width: number;
  height: number;
  index: number;
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
  const imgRef = useRef<HTMLImageElement>(null);

  // An image the browser had already decoded before hydration fires no `load`
  // event, and `load` is the only thing that lifts the fade — so on a warm
  // cache the photograph sat at `opacity: 0` over its 20px placeholder for
  // good. Checked once after mount, which covers exactly that case and leaves
  // the cold path to the handler.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

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
            ref={imgRef}
            className="vows-album-img size-full object-cover"
            src={`/albums/${id}-${bucketName}-${bucket.widths[1]}.webp`}
            alt={photo.alt}
            width={width}
            height={height}
            // Always lazy: the gallery starts below a full-viewport hero, so
            // no photograph in it is ever on the first screen, and the hero
            // is the LCP element — nothing here should compete with it for
            // priority. The reveal observer brings each one in on approach.
            loading="lazy"
            fetchPriority="auto"
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
