import type { INestApplicationContext } from "@nestjs/common";
import { COVER_POSITION } from "@vows/contracts";
import type { JobPayload } from "@vows/contracts";
import { DeriveService, PermanentJobError, StorageService } from "@vows/server";
import type { DerivedFile, JobAttempt } from "@vows/server";

import { deriveImage } from "../../lib/derive-image";

/** `d/pho_9x4q/1024.avif`. An id, never a filename, and never reused for other bytes. */
function keyFor(photoId: string, format: string, width: number): string {
  return format === "jpeg" ? `d/${photoId}/share.jpg` : `d/${photoId}/${String(width)}.${format}`;
}

export function photoDerive(
  app: INestApplicationContext,
): (payload: JobPayload<"photo.derive">, attempt: JobAttempt) => Promise<void> {
  const storage = app.get(StorageService);
  const derive = app.get(DeriveService);

  const run = async ({ photoId, requestId }: JobPayload<"photo.derive">): Promise<void> => {
    const subject = await derive.subject(photoId);
    // Gone, done by an earlier run of this job, or replaced or removed since it
    // was queued: a dead photograph is not worth a derive.
    if (!subject || subject.status === "ready") return;
    if (subject.supersededAt || subject.removedAt) return;

    const original = await storage.readOriginal(subject.originalKey);
    const image = await deriveImage(original, subject.position === COVER_POSITION);
    // Files first, rows after. If this dies halfway, no row points at a missing
    // file, and the retry writes the same keys again.
    const files: DerivedFile[] = [];
    for (const file of image.files) {
      const key = keyFor(photoId, file.format, file.width);
      await storage.writePublic(key, file.body, file.contentType);
      files.push({
        format: file.format,
        width: file.width,
        height: file.height,
        key,
        bytes: file.body.length,
      });
    }
    await derive.complete(
      photoId,
      {
        width: image.width,
        height: image.height,
        mime: image.mime,
        thumbhash: image.thumbhash,
        files,
      },
      requestId,
    );
  };

  // A row must never be left saying "processing" once nothing will process
  // it. A file that is not an image fails at once; anything else fails when
  // the last retry does. Either way the Studio can show it and try again.
  return async (payload, attempt) => {
    try {
      await run(payload);
    } catch (error) {
      if (error instanceof PermanentJobError) await derive.fail(payload.photoId, "wrong_file_type");
      else if (attempt.last) await derive.fail(payload.photoId, "processing_failed");
      throw error;
    }
  };
}
