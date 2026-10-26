import type { Album } from "@vows/contracts";
import { AlbumBottomBar } from "@vows/ui";

import type { ReactElement } from "react";

import { Photo } from "@/components/site/photo/photo";
import { fullDate } from "@/lib/format/dates";

export interface AlbumHeroProps {
  album: Album;
}

/**
 * The album's title card: one photograph filling the screen, with the bar on
 * top of it and the album's details along the bottom. 100svh, so the browser's
 * own bars never cut the details off.
 */
export function AlbumHero({ album }: AlbumHeroProps): ReactElement {
  return (
    <section className="bg-page relative flex h-svh min-h-[620px] flex-col justify-end overflow-clip">
      {album.cover ? (
        <Photo
          photo={album.cover}
          sizes="100vw"
          priority
          focalPoint={album.coverFocalPoint}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[173px] bg-[linear-gradient(to_top,var(--vows-bg-page),transparent)]"
      />
      <AlbumBottomBar
        className="relative max-h-[40svh]"
        coupleNames={album.coupleNames ?? album.title}
        intro={album.story ?? ""}
        type={album.weddingType ?? ""}
        place={album.location ?? ""}
        timeOfDay={(album.timeOfDay ?? "").toLowerCase()}
        date={album.shotOn ? fullDate(album.shotOn) : ""}
        {...(album.shotOn ? { dateTime: album.shotOn } : {})}
        labels={{ type: "type", place: "location" }}
      />
    </section>
  );
}
