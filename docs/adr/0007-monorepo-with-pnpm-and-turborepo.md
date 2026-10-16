# 0007 — Monorepo with pnpm and Turborepo

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 05

## The problem

Three deployables — web, API, worker — share a schema, a set of Zod contracts,
a component library and a token file generated from Figma. Those shared things
change in the same breath as the code that uses them.

## What we decided

One repository, pnpm workspaces, Turborepo for task orchestration and caching.

## Why

A change to a request shape should be one commit that updates the schema, the
API that validates it and the client that sends it — and one pull request where
a reviewer can see all three. With separate repositories that is three pull
requests and a version bump, and the middle state is always broken.

## What we did not do

- **Separate repositories** — independent release cycles we do not want, and
  publishing internal packages to a registry for an audience of one.

## What this costs us

CI has to be filtered so a copy change does not rebuild the worker, and the
Docker builds need the workspace root as their build context. One careless
import can couple two apps that should not know about each other, which is what
the import rules in chapter 05 are for.

## How we would undo it

Each app already has its own `package.json` and build. Extracting one is a `git
filter-repo` and a published package.
