# 0006 — Derivatives built at upload

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 10

## The problem

A photograph needs several sizes, a modern format and a ThumbHash placeholder.
That work can happen once when it arrives, or every time someone asks for it.

## What we decided

The worker builds the full set of derivatives when a photograph is uploaded, and
stores them in R2. A request never resizes anything.

## Why

Guests open albums in bursts — a hundred people in an hour, then nothing for a
month. Resizing on request means that burst is a hundred cold image
transformations; building at upload means it is a hundred reads of a file that
already exists, with free egress. Upload is also the one moment the studio
expects to wait.

## What we did not do

- **Resizing on request through a CDN worker** — less storage, more moving
  parts, and the first visitor to each size pays the cost. Cloudflare's image
  resizing is also a paid product.

## What this costs us

Storage for sizes nobody opens, and a re-process job whenever we change the
derivative set. `sharp` in the worker image is why that machine has 1GB.

## How we would undo it

The derivative URLs are built in one place. Pointing them at a resizing service
is a change in `packages/db`'s photograph helpers and nothing else.
