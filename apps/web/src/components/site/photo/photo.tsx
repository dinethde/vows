import type { CSSProperties, ReactElement } from "react";

import type { Photo as PhotoData } from "@vows/contracts";

import { placeholderFor, sourcesFor } from "./sources";

export interface PhotoProps {
  photo: PhotoData;
  /** How wide it is drawn, so the browser never fetches a file larger than it shows. */
  sizes: string;
  /** Only the album hero. Everything else waits until it is near the screen. */
  priority?: boolean;
  /** Where to crop around, as percentages. For a picture that fills its box. */
  focalPoint?: { x: number; y: number } | null;
  /** Decoration, such as the photographs in the footer: no description is read out. */
  decorative?: boolean;
  className?: string;
}

/**
 * One photograph. It always states its width and height and paints its blur
 * hash as a background, so nothing moves while the file arrives.
 */
export function Photo({
  photo,
  sizes,
  priority,
  focalPoint,
  decorative,
  className,
}: PhotoProps): ReactElement {
  const sources = sourcesFor(photo);
  const placeholder = placeholderFor(photo);
  const style: CSSProperties = {
    ...(placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: "cover" } : {}),
    ...(focalPoint ? { objectPosition: `${String(focalPoint.x)}% ${String(focalPoint.y)}%` } : {}),
  };
  return (
    <picture>
      <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      {/* A plain img: the derivatives are already the right sizes, and Next's
          optimiser would resize them a second time. */}
      <img
        src={sources.fallback}
        alt={decorative ? "" : (photo.alt ?? "")}
        width={photo.width ?? undefined}
        height={photo.height ?? undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        style={style}
        className={className}
      />
    </picture>
  );
}
