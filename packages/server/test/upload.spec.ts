import type { Photo, UploadTicket } from "@vows/contracts";
import { album, auditLog, photo } from "@vows/db";
import { eq, sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import type { App } from "supertest/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hasDatabase, startApp } from "./harness";
import type { Harness } from "./harness";

/**
 * The upload path against real R2, with a worker running beside it. It needs
 * live storage keys and a worker process, so it only runs when asked:
 * PIPELINE_LIVE=1, with the R2 variables set and `apps/worker` started.
 */
const live = hasDatabase && process.env.PIPELINE_LIVE === "1";
const ALBUM = "alb_000021";
const WAIT_MS = 60_000;

describe.skipIf(!live)("a photograph, from an upload URL to ready", () => {
  let harness: Harness;
  let http: App;
  let auth: { authorization: string };

  async function reset(): Promise<void> {
    await harness.db.execute(sql`delete from pgboss.job where data->>'albumId' = ${ALBUM}`);
    await harness.db.update(album).set({ coverPhotoId: null }).where(eq(album.id, ALBUM));
    const rows = await harness.db
      .select({ id: photo.id })
      .from(photo)
      .where(eq(photo.albumId, ALBUM));
    for (const row of rows) await harness.db.delete(auditLog).where(eq(auditLog.entityId, row.id));
    await harness.db.delete(photo).where(eq(photo.albumId, ALBUM));
  }

  async function upload(position: number, file: string, key: string): Promise<UploadTicket> {
    const body = readFileSync(join(__dirname, "fixtures", file));
    const ticket = await request(http)
      .post(`/v1/studio/albums/${ALBUM}/photos/upload-url`)
      .set(auth)
      .set("idempotency-key", key)
      .send({ position, contentType: "image/jpeg", bytes: body.length });
    expect(ticket.status).toBe(201);
    const { uploadUrl } = ticket.body as UploadTicket;
    // Straight to R2, the way the browser does it. The API never sees the bytes.
    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg" },
      body,
    });
    expect(put.status).toBe(200);
    return ticket.body as UploadTicket;
  }

  async function waitFor(id: string, status: string): Promise<Photo> {
    const deadline = Date.now() + WAIT_MS;
    for (;;) {
      const list = await request(http).get(`/v1/studio/albums/${ALBUM}/photos`).set(auth);
      const found = (list.body as { data: Photo[] }).data.find((item) => item.id === id);
      if (found?.status === status) return found;
      if (Date.now() > deadline)
        throw new Error(`Photo ${id} is ${found?.status ?? "missing"}, not ${status}.`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  beforeAll(async () => {
    harness = await startApp();
    http = harness.app.getHttpServer() as App;
    auth = { authorization: `Bearer ${await harness.token("editor")}` };
    await reset();
  });

  afterAll(async () => {
    await reset();
    await harness.app.close();
  });

  it("refuses to start processing a file that never arrived", async () => {
    const ticket = await request(http)
      .post(`/v1/studio/albums/${ALBUM}/photos/upload-url`)
      .set(auth)
      .send({ position: 5, contentType: "image/jpeg", bytes: 1000 });
    const { photo: created } = ticket.body as UploadTicket;
    const response = await request(http).post(`/v1/studio/photos/${created.id}/uploaded`).set(auth);
    expect(response.status).toBe(422);
    expect((response.body as { error: { code: string } }).error.code).toBe("photo_not_uploaded");
  });

  it("reuses the row when the same Idempotency-Key asks twice", async () => {
    const send = () =>
      request(http)
        .post(`/v1/studio/albums/${ALBUM}/photos/upload-url`)
        .set(auth)
        .set("idempotency-key", "it-same-key")
        .send({ position: 6, contentType: "image/jpeg", bytes: 1000 });
    const first = (await send()).body as UploadTicket;
    const second = (await send()).body as UploadTicket;
    expect(second.photo.id).toBe(first.photo.id);
  });

  it("turns an uploaded JPEG into ten files, a share card and a blur hash", async () => {
    const { photo: cover } = await upload(0, "photo.jpg", "it-cover");
    const accepted = await request(http).post(`/v1/studio/photos/${cover.id}/uploaded`).set(auth);
    expect(accepted.status).toBe(202);
    expect((accepted.body as Photo).status).toBe("processing");

    const ready = await waitFor(cover.id, "ready");
    expect(ready.derivatives).toHaveLength(10);
    expect(ready.width).toBe(3000);
    expect(ready.thumbhash).toBeTruthy();

    const smallest = ready.derivatives.find((file) => file.format === "avif" && file.width === 320);
    const served = await fetch(smallest?.url ?? "");
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("image/avif");
    expect(served.headers.get("cache-control")).toContain("immutable");

    const rows = await harness.db.execute(
      sql`select count(*)::int as n from photo_derivative where photo_id = ${cover.id}`,
    );
    expect(rows.rows[0]?.n).toBe(11);

    // An edit answers with the photograph as the list shows it, files and all.
    const described = await request(http)
      .patch(`/v1/studio/photos/${cover.id}`)
      .set(auth)
      .send({ alt: "The couple on the steps" });
    expect(described.status).toBe(200);
    expect((described.body as Photo).alt).toBe("The couple on the steps");
    expect((described.body as Photo).derivatives).toHaveLength(10);
  });

  it("keeps the album pointing at a cover when the cover is replaced", async () => {
    const before = await harness.db.query.album.findFirst({ where: eq(album.id, ALBUM) });
    const { photo: replacement } = await upload(0, "photo.jpg", "it-cover-2");
    const after = await harness.db.query.album.findFirst({ where: eq(album.id, ALBUM) });

    expect(after?.coverPhotoId).toBe(replacement.id);
    expect(after?.coverPhotoId).not.toBe(before?.coverPhotoId);
    const old = await harness.db.query.photo.findFirst({
      where: eq(photo.id, before?.coverPhotoId ?? ""),
    });
    expect(old?.supersededAt).toBeInstanceOf(Date);
  });

  it("marks a file that is not an image as failed, and does not retry it", async () => {
    const ticket = await request(http)
      .post(`/v1/studio/albums/${ALBUM}/photos/upload-url`)
      .set(auth)
      .send({ position: 7, contentType: "image/jpeg", bytes: 20 });
    const { photo: created, uploadUrl } = ticket.body as UploadTicket;
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg" },
      body: "this is not a photograph",
    });
    await request(http).post(`/v1/studio/photos/${created.id}/uploaded`).set(auth);

    const failed = await waitFor(created.id, "failed");
    expect(failed.errorCode).toBe("wrong_file_type");
    const jobs = await harness.db.execute(
      sql`select state, retry_count from pgboss.job where name = 'photo.derive' and data->>'photoId' = ${created.id}`,
    );
    expect(jobs.rows[0]).toMatchObject({ state: "failed", retry_count: 0 });
  });

  it("takes a failed photograph back when the same key tries again", async () => {
    const key = "it-retry-after-failure";
    const body = { position: 8, contentType: "image/jpeg", bytes: 20 };
    const ask = () =>
      request(http)
        .post(`/v1/studio/albums/${ALBUM}/photos/upload-url`)
        .set(auth)
        .set("idempotency-key", key)
        .send(body);
    const { photo: created, uploadUrl } = (await ask()).body as UploadTicket;
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg" },
      body: "this is not a photograph",
    });
    await request(http).post(`/v1/studio/photos/${created.id}/uploaded`).set(auth);
    await waitFor(created.id, "failed");

    const again = (await ask()).body as UploadTicket;
    expect(again.photo.id).toBe(created.id);
    expect(again.photo.status).toBe("pending");
    expect(again.photo.errorCode).toBeNull();

    const file = readFileSync(join(__dirname, "fixtures", "photo.jpg"));
    await fetch(again.uploadUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg" },
      body: file,
    });
    await request(http).post(`/v1/studio/photos/${created.id}/uploaded`).set(auth);
    const ready = await waitFor(created.id, "ready");
    expect(ready.errorCode).toBeNull();
  });
});
