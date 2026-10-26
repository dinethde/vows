import * as Sentry from "@sentry/node";
import { createServer } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { gunzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseEnv } from "../src/config/env";
import {
  monitored,
  reportFailure,
  startErrorReporting,
} from "../src/observability/error-reporting";

/** What a stand-in for Sentry's ingest endpoint received: one entry per envelope item. */
interface Item {
  type: string;
  body: Record<string, unknown>;
}

function itemsOf(raw: Buffer): Item[] {
  const lines = raw.toString("utf8").split("\n").filter(Boolean).slice(1);
  const items: Item[] = [];
  for (let index = 0; index + 1 < lines.length; index += 2) {
    const header = JSON.parse(lines[index] ?? "{}") as { type: string };
    items.push({
      type: header.type,
      body: JSON.parse(lines[index + 1] ?? "{}") as Record<string, unknown>,
    });
  }
  return items;
}

describe("error reporting, against a stand-in for Sentry", () => {
  const received: Item[] = [];
  let server: Server;

  beforeAll(async () => {
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        const body = Buffer.concat(chunks);
        const gzipped = request.headers["content-encoding"] === "gzip";
        received.push(...itemsOf(gzipped ? gunzipSync(body) : body));
        response.writeHead(200).end("{}");
      });
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    // Placeholders: nothing here connects to a database or a bucket.
    const env = parseEnv({
      ...process.env,
      DATABASE_URL: "postgres://user:pw@db.example.com/vows",
      APP_ENV: "staging",
      VOWS_SERVICE: "api",
      SENTRY_DSN: `http://public@127.0.0.1:${String(port)}/1`,
      SENTRY_RELEASE: "test-release",
    });
    expect(startErrorReporting(env)).toBe(true);
  });

  afterAll(async () => {
    await Sentry.close(2000);
    await new Promise((resolve) => server.close(resolve));
  });

  it("sends a failure with its tags, the environment and the release", async () => {
    reportFailure(new Error("the rebuild endpoint answered 500"), { job: "album.revalidate" });
    await Sentry.flush(2000);
    const event = received.find((item) => item.type === "event");
    expect(event?.body.environment).toBe("staging");
    expect(event?.body.release).toBe("test-release");
    expect((event?.body.tags as Record<string, string>).job).toBe("album.revalidate");
  });

  it("checks a scheduled job in, and out as ok or error", async () => {
    const schedule = { cron: "0 3 * * *", maxSeconds: 60 };
    await monitored("album.sitemap", schedule, () => Promise.resolve());
    await expect(
      monitored("db.backup", schedule, () => Promise.reject(new Error("pg_dump failed"))),
    ).rejects.toThrow("pg_dump failed");
    await Sentry.flush(2000);

    const checkIns = received.filter((item) => item.type === "check_in").map((item) => item.body);
    const statuses = (slug: string): unknown[] =>
      checkIns.filter((body) => body.monitor_slug === slug).map((body) => body.status);
    expect(statuses("album.sitemap")).toEqual(["in_progress", "ok"]);
    expect(statuses("db.backup")).toEqual(["in_progress", "error"]);
    const config = checkIns.find((body) => body.monitor_slug === "album.sitemap")
      ?.monitor_config as Record<string, unknown>;
    expect(config.timezone).toBe("Asia/Colombo");
    expect(config.schedule).toEqual({ type: "crontab", value: "0 3 * * *" });
  });
});
