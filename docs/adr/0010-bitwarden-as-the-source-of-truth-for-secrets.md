# 0010 — Bitwarden as the source of truth for secrets

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 19

## The problem

Fly secrets are write-only by design: once set, nothing can read the value back.
Vercel and GitHub are the same. So the only readable copy of a production
credential was whatever happened to be in a terminal history or a notes app.

## What we decided

A Bitwarden vault is the source of truth. Fly, Vercel and GitHub Actions are
deployment targets that receive copies. Every push reads the value from the vault
inline:

```sh
fly secrets set DATABASE_URL="$(bw get password vows/neon/prod-url)" -a vows-api
```

## Why

Something has to hold the readable copy, and it should be a thing built for it.
Doing it this way also means a secret is never typed, never pasted into a chat
window, and never sits in shell history — the value only ever travels from the
vault to the provider.

## What we did not do

- **1Password** — excellent CLI, better team story, but a paid plan for a vault
  with one holder.
- **Doppler** — a sync service that would become another dependency in the
  deploy path, and another place a secret lives.
- **No readable copy at all** — the status quo, which works right up until a
  machine dies.

## What this costs us

One vault is one point of failure, so it needs its own backup and recovery
story, and the master password is the real crown jewel. Rotation is manual: the
vault and all three targets have to be updated by hand.

## How we would undo it

The vault holds plain name/value pairs. Exporting them and feeding another
manager is an afternoon.
