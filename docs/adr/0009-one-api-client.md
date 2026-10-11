# 0009 — One API client, with TanStack Query in the Studio only

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 14

## The problem

Calls to the API come from Server Components, from Route Handlers and from
browser code in the Studio. Left alone, each grows its own `fetch`, its own way
of attaching a token and its own idea of what an error looks like.

## What we decided

Every call goes through `apps/web/src/lib/api`: one transport, one set of typed
methods, and two thin entry points — `serverApi()` and `browserApi()` — that
differ only in where the token comes from. TanStack Query sits above that client,
in the Studio only, and calls the same methods from its `queryFn`.

## Why

TanStack Query is a cache, not a transport. It cannot run in a Server Component,
so it can never be the single place every call passes through — the client can.
The public site has nothing to cache in the browser: its pages are static and
its data was read at build time. The Studio, where the same list is read, edited
and re-read, is where a cache earns its weight.

## What we did not do

- **A generic `request()` helper** — the same fetch call with the URL as a
  string argument. Nothing is typed, and the endpoint list exists only in
  people's heads.
- **axios with interceptors** — interceptors hide behaviour from the call site,
  and axios does not help in a Server Component either.
- **TanStack Query everywhere** — a cache around static data, plus a client
  component boundary pushed up the tree for no benefit.

## What this costs us

Two ways to read data in one app — direct `await` on the site, hooks in the
Studio — which has to be explained once to everyone who works here. A new
endpoint is two edits: the method, and the caller.

## How we would undo it

The methods are the API surface. Removing TanStack Query means replacing hook
calls with direct awaits; the client does not change.
