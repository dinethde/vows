/**
 * Minimal production runner. `vite build` emits the SSR handler as a
 * `{ fetch }` object and leaves the static assets in dist/client; this wires
 * the two together so the built app can be run and profiled locally.
 *
 * Usage: node scripts/serve.mjs [port]
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);
const clientDir = join(process.cwd(), "dist", "client");
const handler = (await import("../dist/server/server.js")).default;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

async function tryStatic(pathname) {
  if (pathname.includes("..")) return null;
  const file = join(clientDir, normalize(pathname));
  try {
    const info = await stat(file);
    return info.isFile() ? file : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const file = await tryStatic(decodeURIComponent(url.pathname));

  if (file) {
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": url.pathname.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",
    });
    createReadStream(file).pipe(res);
    return;
  }

  const response = await handler.fetch(
    new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method ?? "GET") ? undefined : req,
      duplex: "half",
    }),
  );

  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
