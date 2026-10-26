import { resolved } from "@vows/tokens";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { publicApi } from "@/lib/api";
import { fullDate } from "@/lib/format/dates";

export const alt = "A photograph from the album, with the couple’s names and the date";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export interface ShareCardProps {
  params: Promise<{ slug: string }>;
}

const { textInverse, bgInverse, bgPage, textPrimary } = resolved.site;

/** The soft dark fade under the words, so they read over any photograph. */
const FADE = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 320,
  backgroundImage: `linear-gradient(to top, ${bgInverse}b3, ${bgInverse}00)`,
} as const;

/**
 * What a link to an album looks like in a chat: the cover, cropped by the
 * worker to 1200 × 630, with the wordmark top left and the names and date
 * bottom left over a soft dark fade. Made when the page is built, so the words
 * are right even if the names changed after the upload. An album with no
 * cover gets the plain card.
 */
export default async function ShareCard({ params }: ShareCardProps): Promise<ImageResponse> {
  const album = await publicApi().albums.get((await params).slug);
  const mate = await readFile(join(process.cwd(), "src/assets/fonts/Mate-Regular.ttf"));
  const names = album.coupleNames ?? album.title;
  const details = [album.shotOn ? fullDate(album.shotOn) : null, album.location]
    .filter(Boolean)
    .join(" · ");
  const onPhoto = Boolean(album.shareCardUrl);
  const ink = onPhoto ? textInverse : textPrimary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: bgPage,
          fontFamily: "Mate",
          color: ink,
        }}
      >
        {album.shareCardUrl ? (
          <img
            src={album.shareCardUrl}
            width={1200}
            height={630}
            style={{ position: "absolute", objectFit: "cover" }}
          />
        ) : null}
        {onPhoto ? <div style={FADE} /> : null}
        <div style={{ position: "absolute", top: 48, left: 56, fontSize: 28 }}>VOWS</div>
        <div
          style={{
            position: "absolute",
            left: 56,
            bottom: 52,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 64, lineHeight: 1.1 }}>{names}</div>
          <div style={{ fontSize: 26 }}>{details}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Mate", data: mate, style: "normal", weight: 400 }] },
  );
}
