# 0013 — Weekly database backup; the photographs are not backed up

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 11, 30

## The problem

There was no backup plan at all. The review found the real risk is not a careless
person but an ordinary Tuesday: a migration with one wrong line, a script that
updates too many rows, a provider account that goes away.

## What we decided

`db.backup` runs every Sunday at 02:00 Asia/Colombo, writes a compressed
`pg_dump` of every table to a separate R2 bucket under the date, and keeps the
last eight. The photographs are not backed up.

## Why

The database is small, irreplaceable and the thing a bad migration destroys —
the enquiry history exists nowhere else in the world. Eight weeks of dumps cost
a few cents a month. Neon's own restore already covers the last few days; a dump
outside Neon covers the one case Neon cannot, which is Neon itself.

The photographs are the opposite: the largest thing here and the least exposed.
R2 is durable storage rather than a scratch disk, and every original also sits
on the photographer's own drives, because that is where it came from. A second
copy of fifty gigabytes would cost more each month than the database backup
costs in a year, to guard a failure that already has two copies.

## What we did not do

- **Back up everything** — correct and disproportionate. The cost is in the
  photographs and the risk is in the database.
- **Back up nothing** — the status quo, which works until it does not.
- **A copy at a second storage provider** — the honest answer if the
  photographer's drives ever stop being a real second copy. Chapter 32 has what
  it would cost.

## What this costs us

Losing R2 and the photographer's drives in the same event loses the
photographs. Up to a week of database writes can be lost in the worst case,
which for this product means some enquiries and some album edits.

## How we would undo it

Add an `rclone` step to the same weekly job. Nothing else changes.
