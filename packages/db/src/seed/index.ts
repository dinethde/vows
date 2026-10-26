import { eq } from "drizzle-orm";

import { createDatabase } from "../client";
import type { Db } from "../client";
import { album, setting } from "../schema";

/**
 * Sample words for a development branch. The 22 album rows already exist, put
 * there by a migration; this fills three of them in so the Studio has a draft
 * to open. It only sets values, so running it twice changes nothing.
 * Photographs are not seeded here: they go in through the upload pipeline.
 */
// A setting with no value has no row, so the Instagram handle is left out.
const SETTINGS: Record<string, string> = {
  notifyEmail: "info.vowslk@gmail.com",
  phone: "+94 71 657 0999",
  trackName: "First Light",
};

const ALBUMS = [
  {
    id: "alb_000001",
    slug: "benali-yasiru",
    title: "Benali & Yasiru",
    coupleNames: "Benali & Yasiru",
    shotOn: "2022-01-02",
    timeOfDay: "Morning",
    weddingType: "Modern Classic",
    location: "Hilton Residencies",
    story:
      "An intimate celebration beneath the late-summer sky, filled with quiet glances, joyful tears, and the people they love most.",
  },
  {
    id: "alb_000002",
    slug: "amaya-ruwan",
    title: "Amaya & Ruwan",
    coupleNames: "Amaya & Ruwan",
    shotOn: "2025-01-17",
    timeOfDay: "Evening",
    weddingType: "Beach",
    location: "Mount Lavinia Hotel",
    story: "A sunset ceremony on the sand, and a dance floor that did not empty until two.",
  },
  {
    id: "alb_000003",
    slug: "album-03",
    title: "Dilini & Kasun",
    coupleNames: "Dilini & Kasun",
    shotOn: null,
    timeOfDay: null,
    weddingType: null,
    location: null,
    story: null,
  },
];

async function seed(db: Db): Promise<void> {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await db
      .insert(setting)
      .values({ key, value })
      .onConflictDoUpdate({ target: setting.key, set: { value } });
  }
  for (const { id, ...values } of ALBUMS) {
    await db.update(album).set(values).where(eq(album.id, id));
  }
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const { db, pool } = createDatabase(url, 1);
  try {
    await seed(db);
    const albums = await db.$count(album);
    process.stdout.write(
      `seed: ${String(albums)} albums, ${String(ALBUMS.length)} with sample words\n`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
