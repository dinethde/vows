import { describe, expect, it, vi } from "vitest";

import { placeFiles } from "./place";
import { MAX_PARALLEL, UploadQueue } from "./queue";
import type { UploadDeps } from "./queue";
import { planSlots } from "./slots";
import { refusal } from "./validate";

function jpeg(name: string, bytes = 1000): File {
  const file = new File(["x"], name, { type: "image/jpeg" });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
}

interface Gate {
  resolve: () => void;
  reject: (error: Error) => void;
}

/** A queue whose PUTs wait until the test lets each one through. */
function harness(): { queue: UploadQueue; deps: UploadDeps; gates: Gate[] } {
  const gates: Gate[] = [];
  let made = 0;
  const deps: UploadDeps = {
    uploadUrl: vi.fn((albumId: string, body: { position: number }) =>
      Promise.resolve({
        photo: {
          id: `pho_slot${String(body.position).padStart(4, "0")}`,
          albumId,
          position: body.position,
          status: "pending" as const,
          errorCode: null,
          width: null,
          height: null,
          thumbhash: null,
          alt: null,
          derivatives: [],
        },
        uploadUrl: "https://storage.test/put",
        expiresAt: "2026-10-12T10:00:00.000Z",
      }),
    ),
    markUploaded: vi.fn(() => Promise.resolve(null)),
    put: vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          gates.push({ resolve, reject });
        }),
    ),
    settled: vi.fn(() => Promise.resolve()),
    newKey: () => {
      made += 1;
      return `key-${String(made)}`;
    },
  };
  return { queue: new UploadQueue(deps), deps, gates };
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const statuses = (queue: UploadQueue): string[] => queue.getState().items.map((i) => i.status);

describe("the upload queue", () => {
  it("sends three files at once and starts the next as each finishes", async () => {
    const { queue, deps, gates } = harness();
    queue.add(
      "alb_000019",
      [1, 2, 3, 4, 5].map((position) => ({ file: jpeg(`${String(position)}.jpg`), position })),
    );
    await tick();

    expect(MAX_PARALLEL).toBe(3);
    expect(deps.put).toHaveBeenCalledTimes(3);
    expect(statuses(queue)).toEqual(["uploading", "uploading", "uploading", "queued", "queued"]);

    gates[0]?.resolve();
    await tick();
    await tick();
    expect(deps.put).toHaveBeenCalledTimes(4);
    expect(queue.getState().items.map((item) => item.position)).toEqual([2, 3, 4, 5]);
  });

  it("reports the browser’s own progress", async () => {
    const { queue, deps } = harness();
    queue.add("alb_000019", [{ file: jpeg("a.jpg"), position: 1 }]);
    await tick();
    const onProgress = vi.mocked(deps.put).mock.calls[0]?.[2];
    onProgress?.(42);
    expect(queue.getState().items[0]?.progress).toBe(42);
  });

  it("keeps a failed file in its slot and retries it with the same key", async () => {
    const { queue, deps, gates } = harness();
    queue.add("alb_000019", [{ file: jpeg("a.jpg"), position: 7 }]);
    await tick();
    gates[0]?.reject(new Error("The connection dropped during the upload."));
    await tick();

    const failed = queue.getState().items[0];
    expect(failed?.status).toBe("error");
    expect(failed?.message).toMatch(/did not finish/);

    queue.retry(failed?.key ?? "");
    await tick();
    const keys = vi.mocked(deps.uploadUrl).mock.calls.map((call) => call[2]);
    expect(keys).toEqual(["key-1", "key-1"]);
    expect(statuses(queue)).toEqual(["uploading"]);
  });

  it("tells the API the file arrived, reads the album again, then lets the slot go", async () => {
    const { queue, deps, gates } = harness();
    queue.add("alb_000019", [{ file: jpeg("a.jpg"), position: 1 }]);
    await tick();
    gates[0]?.resolve();
    await tick();
    await tick();

    expect(deps.markUploaded).toHaveBeenCalledWith("pho_slot0001");
    expect(deps.settled).toHaveBeenCalledWith("alb_000019");
    expect(queue.getState().items).toEqual([]);
  });

  it("notifies whoever is listening on every change", () => {
    const { queue } = harness();
    const listener = vi.fn();
    const stop = queue.subscribe(listener);
    queue.add("alb_000019", [{ file: jpeg("a.jpg"), position: 1 }]);
    expect(listener).toHaveBeenCalled();
    stop();
  });
});

describe("where dropped files land", () => {
  it("puts the first on the slot it was dropped on and the rest in the next empty slots", () => {
    expect(planSlots(3, 4, new Set([4, 5, 7]))).toEqual({ positions: [3, 6, 8, 9], overflow: 0 });
  });

  it("goes round to slot 1 after slot 18, and never fills the cover by itself", () => {
    expect(planSlots(17, 3, new Set([18]))).toEqual({ positions: [17, 1, 2], overflow: 0 });
    expect(planSlots(0, 2, new Set())).toEqual({ positions: [0, 1], overflow: 0 });
  });

  it("counts the files that have nowhere to go", () => {
    const full = new Set(Array.from({ length: 18 }, (_, index) => index + 1));
    expect(planSlots(2, 3, full)).toEqual({ positions: [2], overflow: 2 });
  });

  it("names a refused file and does not let it take a slot", () => {
    const { queue } = harness();
    const text = new File(["x"], "notes.txt", { type: "text/plain" });
    placeFiles(queue, {
      albumId: "alb_000019",
      target: 1,
      files: [text, jpeg("a.jpg"), jpeg("b.jpg")],
      taken: new Set([2]),
    });

    expect(queue.getState().items.map((item) => item.position)).toEqual([1, 3]);
    expect(queue.getState().rejections.map((entry) => entry.message)).toEqual([
      "notes.txt is not a photograph we can use. Choose a JPEG, PNG, WebP or TIFF.",
    ]);
  });
});

describe("the browser check", () => {
  it("lets the four image types through and stops at 60 MB", () => {
    expect(refusal(jpeg("a.jpg"))).toBeNull();
    expect(refusal(jpeg("big.jpg", 60 * 1024 * 1024 + 1))).toMatch(/larger than 60 MB/);
    expect(refusal({ name: "a.heic", type: "image/heic", size: 10 })).toMatch(/not a photograph/);
    expect(refusal({ name: "a.jpg", type: "image/jpeg", size: 0 })).toMatch(/empty/);
  });
});
