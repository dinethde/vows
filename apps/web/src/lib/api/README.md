# The API client

Everything the browser or a server component sends to the NestJS API goes
through this folder. Nothing else in `apps/web` may call `fetch` at an API URL.

Three files, and no more:

| File | What it holds |
|---|---|
| `transport.ts` | the one `fetch` wrapper: base URL, headers, timeout, error shape |
| `client.ts` | `serverApi()` and `browserApi()` — same methods, different token source |
| `methods.ts` | one typed function per endpoint, arguments and returns from `@vows/contracts` |

`serverApi()` reads the Clerk token from the request on the server.
`browserApi()` reads it from the Clerk hook in the browser. That is the only
difference between them.

TanStack Query sits *above* this folder, in the Studio only, and calls these
methods from its `queryFn`. It is a cache, not a transport — it cannot run in a
Server Component, so it never replaces the client.

See chapter 14 of `architecture.md`.
