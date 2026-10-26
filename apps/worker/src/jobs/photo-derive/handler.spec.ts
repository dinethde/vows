import type { INestApplicationContext } from "@nestjs/common";
import { DeriveService, PermanentJobError, StorageService } from "@vows/server";
import { describe, expect, it, vi } from "vitest";

import { photoDerive } from "./handler";

const PAYLOAD = { photoId: "pho_test", requestId: "req_test" };

/** A worker whose storage fails the way the test says, and a record of what was marked. */
function worker(
  readOriginal: () => Promise<Buffer>,
  state: { supersededAt?: Date | null; removedAt?: Date | null } = {},
): {
  run: ReturnType<typeof photoDerive>;
  fail: ReturnType<typeof vi.fn>;
} {
  const fail = vi.fn().mockResolvedValue(undefined);
  const services = new Map<unknown, unknown>([
    [StorageService, { readOriginal }],
    [
      DeriveService,
      {
        subject: () =>
          Promise.resolve({
            id: PAYLOAD.photoId,
            albumId: "alb_000001",
            originalKey: "originals/alb_000001/pho_test.jpg",
            position: 1,
            status: "processing",
            supersededAt: state.supersededAt ?? null,
            removedAt: state.removedAt ?? null,
          }),
        fail,
      },
    ],
  ]);
  const app = { get: (token: unknown) => services.get(token) } as INestApplicationContext;
  return { run: photoDerive(app), fail };
}

describe("photo.derive, when it cannot finish", () => {
  it("leaves the row alone while a retry is still to come", async () => {
    const { run, fail } = worker(() => Promise.reject(new Error("storage is down")));
    await expect(run(PAYLOAD, { jobId: "job_1", last: false })).rejects.toThrow("storage is down");
    expect(fail).not.toHaveBeenCalled();
  });

  it("marks the photograph failed when the last retry fails", async () => {
    const { run, fail } = worker(() => Promise.reject(new Error("storage is down")));
    await expect(run(PAYLOAD, { jobId: "job_1", last: true })).rejects.toThrow("storage is down");
    expect(fail).toHaveBeenCalledWith(PAYLOAD.photoId, "processing_failed");
  });

  it("marks a file that is not an image at once, whatever the attempt", async () => {
    const { run, fail } = worker(() => Promise.resolve(Buffer.from("this is not a photograph")));
    await expect(run(PAYLOAD, { jobId: "job_1", last: false })).rejects.toBeInstanceOf(
      PermanentJobError,
    );
    expect(fail).toHaveBeenCalledWith(PAYLOAD.photoId, "wrong_file_type");
  });
});

describe("photo.derive, for a photograph that is no longer wanted", () => {
  it("does nothing for one replaced or removed since the job was queued", async () => {
    const read = vi.fn(() => Promise.resolve(Buffer.from("")));
    for (const state of [{ supersededAt: new Date() }, { removedAt: new Date() }]) {
      const { run, fail } = worker(read, state);
      await run(PAYLOAD, { jobId: "job_1", last: false });
      expect(fail).not.toHaveBeenCalled();
    }
    expect(read).not.toHaveBeenCalled();
  });
});
