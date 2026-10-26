import { eq, sql } from "drizzle-orm";
import request from "supertest";
import type { App } from "supertest/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { album, auditLog, newId, photo, slugRedirect } from "@vows/db";

import { hasDatabase, startApp } from "./harness";
import type { Harness } from "./harness";

/** The last album in the fixed set. The tests fill it in and put it back. */
const ALBUM = "alb_000022";
const SLUG = `it-album-${String(Date.now())}`;

interface ErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

describe.skipIf(!hasDatabase)("the album routes", () => {
  let harness: Harness;
  let http: App;
  let editor: string;

  async function reset(): Promise<void> {
    await harness.db.execute(sql`delete from pgboss.job where data->>'albumId' = ${ALBUM}`);
    await harness.db.delete(slugRedirect).where(eq(slugRedirect.toAlbumId, ALBUM));
    await harness.db.delete(auditLog).where(eq(auditLog.entityId, ALBUM));
    await harness.db.update(album).set({ coverPhotoId: null }).where(eq(album.id, ALBUM));
    await harness.db.delete(photo).where(eq(photo.albumId, ALBUM));
    await harness.db
      .update(album)
      .set({
        slug: "album-22",
        title: "Album 22",
        coupleNames: null,
        shotOn: null,
        status: "draft",
        publishedAt: null,
      })
      .where(eq(album.id, ALBUM));
  }

  /** A cover and eighteen ready photographs, each described, as the pipeline would leave them. */
  async function fill(): Promise<void> {
    const rows = Array.from({ length: 19 }, (_unused, position) => ({
      id: newId("photo"),
      albumId: ALBUM,
      originalKey: `originals/${ALBUM}/${SLUG}-${String(position)}.jpg`,
      position,
      status: "ready" as const,
      width: 2400,
      height: 1600,
      alt: `Photograph ${String(position)} of the day`,
    }));
    await harness.db.insert(photo).values(rows);
    await harness.db
      .update(album)
      .set({ coverPhotoId: rows[0]?.id ?? null })
      .where(eq(album.id, ALBUM));
  }

  beforeAll(async () => {
    harness = await startApp();
    http = harness.app.getHttpServer() as App;
    editor = await harness.token("editor");
    await reset();
  });

  afterAll(async () => {
    await reset();
    await harness.app.close();
  });

  it("answers 401 with no token, and says nothing about why", async () => {
    const response = await request(http).get("/v1/studio/albums");
    expect(response.status).toBe(401);
    expect((response.body as ErrorBody).error.message).toBe("Unauthorized");
  });

  it("answers 401 to a token minted for another app", async () => {
    const token = await harness.token("owner", { azp: "https://someone-else.example" });
    const response = await request(http)
      .get("/v1/studio/albums")
      .set("authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it("answers 403 to a signed-in account with no role", async () => {
    const token = await harness.token(null);
    const response = await request(http)
      .get("/v1/studio/albums")
      .set("authorization", `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it("lists all 22 albums with counts that add up", async () => {
    const response = await request(http)
      .get("/v1/studio/albums")
      .set("authorization", `Bearer ${editor}`);
    const { data, counts } = response.body as { data: unknown[]; counts: Record<string, number> };
    expect(response.status).toBe(200);
    expect(data).toHaveLength(22);
    expect((counts.published ?? 0) + (counts.draft ?? 0) + (counts.untouched ?? 0)).toBe(
      counts.all,
    );
  });

  it("has no route that creates an album and none that deletes one", async () => {
    const create = await request(http)
      .post("/v1/studio/albums")
      .set("authorization", `Bearer ${editor}`)
      .send({});
    const remove = await request(http)
      .delete(`/v1/studio/albums/${ALBUM}`)
      .set("authorization", `Bearer ${editor}`);
    expect(create.status).toBe(404);
    expect(remove.status).toBe(404);
  });

  it("refuses to publish an empty album, and names what is missing", async () => {
    const response = await request(http)
      .post(`/v1/studio/albums/${ALBUM}/publish`)
      .set("authorization", `Bearer ${editor}`);
    const { error } = response.body as ErrorBody;
    expect(response.status).toBe(422);
    expect(error.code).toBe("album_not_publishable");
    expect(error.fields).toMatchObject({
      coupleNames: expect.any(String) as string,
      cover: "Add a cover photograph.",
    });
    expect(error.fields?.["photos.18"]).toBe("Slot 18 is empty. Add a photograph.");
  });

  it("refuses a slug another album already has, and suggests a free one", async () => {
    const response = await request(http)
      .patch(`/v1/studio/albums/${ALBUM}`)
      .set("authorization", `Bearer ${editor}`)
      .send({ slug: "album-21" });
    expect(response.status).toBe(409);
    expect((response.body as ErrorBody).error.message).toContain("album-21-2");
    // The same sentence beside the field, so a form needs no special case.
    expect((response.body as ErrorBody).error.fields?.slug).toContain("album-21-2");
  });

  it("publishes a complete album, shows it publicly, and keeps the old address working", async () => {
    await fill();
    const auth = { authorization: `Bearer ${editor}` };
    const edited = await request(http)
      .patch(`/v1/studio/albums/${ALBUM}`)
      .set(auth)
      .send({ coupleNames: "Test & Couple", shotOn: "2026-01-17", slug: SLUG });
    expect(edited.status).toBe(200);
    expect((edited.body as { stage: string; title: string }).title).toBe("Test & Couple");

    const published = await request(http).post(`/v1/studio/albums/${ALBUM}/publish`).set(auth);
    expect(published.status).toBe(200);
    expect((published.body as { stage: string }).stage).toBe("published");

    const jobs = await harness.db.execute(
      sql`select name from pgboss.job where data->>'albumId' = ${ALBUM} order by name`,
    );
    expect(jobs.rows.map((row) => row.name)).toEqual(["album.revalidate", "photo.cleanup"]);

    const page = await request(http).get(`/v1/albums/${SLUG}`);
    expect(page.status).toBe(200);
    expect((page.body as { photos: unknown[]; cover: object | null }).photos).toHaveLength(18);

    const old = await request(http).get("/v1/albums/album-22");
    expect((old.body as { slug: string }).slug).toBe(SLUG);

    const audit = await harness.db.select().from(auditLog).where(eq(auditLog.entityId, ALBUM));
    expect(audit.map((row) => row.action).sort()).toEqual(["album.publish", "album.update"]);
  });

  it("takes an album off the site without touching its photographs", async () => {
    const response = await request(http)
      .post(`/v1/studio/albums/${ALBUM}/unpublish`)
      .set("authorization", `Bearer ${editor}`);
    expect(response.status).toBe(200);
    expect((await request(http).get(`/v1/albums/${SLUG}`)).status).toBe(404);
    expect(await harness.db.$count(photo, eq(photo.albumId, ALBUM))).toBe(19);
  });
});
