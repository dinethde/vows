import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';

import { ENV } from '../config/env';
import type { Env } from '../config/env';

export const PRESIGN_SECONDS = 300;
const TIMEOUT_MS = 5000;
const DELETE_BATCH = 500;

/**
 * R2 through its S3 API. Two buckets: originals, private and never served; and
 * media, public, which only the worker writes to.
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
    });
  }

  /** A URL the browser can PUT one file to, for five minutes. */
  presignUpload(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.env.R2_BUCKET_ORIGINALS,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: PRESIGN_SECONDS });
  }

  /** The size of an original, or null when the upload never arrived. */
  async originalSize(key: string): Promise<number | null> {
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.env.R2_BUCKET_ORIGINALS, Key: key }),
        { abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      return head.ContentLength ?? 0;
    } catch (error) {
      if ((error as { name?: string }).name === 'NotFound') return null;
      throw error;
    }
  }

  async readOriginal(key: string): Promise<Buffer> {
    const object = await this.client.send(
      new GetObjectCommand({ Bucket: this.env.R2_BUCKET_ORIGINALS, Key: key }),
    );
    if (!object.Body) throw new Error(`Original ${key} has no body.`);
    return Buffer.from(await object.Body.transformToByteArray());
  }

  /** Overwrites the same key, so a retried job leaves no second copy. */
  async writePublic(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.env.R2_BUCKET_PUBLIC,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  /** Deleting is the one step with no undo. Callers check before they call. */
  async deletePublic(keys: string[]): Promise<void> {
    await this.deleteFrom(this.env.R2_BUCKET_PUBLIC, keys);
  }

  async deleteOriginals(keys: string[]): Promise<void> {
    await this.deleteFrom(this.env.R2_BUCKET_ORIGINALS, keys);
  }

  /** Every key under a prefix in the public bucket, a page at a time. */
  async listPublic(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.env.R2_BUCKET_PUBLIC,
          Prefix: prefix,
          ContinuationToken: token,
        }),
      );
      for (const object of page.Contents ?? []) if (object.Key) keys.push(object.Key);
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return keys;
  }

  private async deleteFrom(bucket: string, keys: string[]): Promise<void> {
    for (let start = 0; start < keys.length; start += DELETE_BATCH) {
      const batch = keys.slice(start, start + DELETE_BATCH).map((Key) => ({ Key }));
      await this.client.send(
        new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: batch } }),
      );
    }
  }

  /** The backups bucket is a third, private bucket. Nothing but db.backup uses it. */
  async writeBackup(bucket: string, key: string, body: Buffer): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'application/octet-stream',
      }),
    );
  }

  async listBackups(bucket: string): Promise<string[]> {
    const page = await this.client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: 'backups/' }),
    );
    return (page.Contents ?? []).flatMap((object) => (object.Key ? [object.Key] : [])).sort();
  }

  async deleteBackups(bucket: string, keys: string[]): Promise<void> {
    await this.deleteFrom(bucket, keys);
  }

  publicUrl(key: string): string {
    return `${this.env.MEDIA_URL.replace(/\/$/, '')}/${key}`;
  }

  async ping(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.env.R2_BUCKET_PUBLIC }), {
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
  }
}
