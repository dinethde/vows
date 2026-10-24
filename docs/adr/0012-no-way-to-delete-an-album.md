# 0012 — No way to delete an album, anywhere in the product

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 07, 08, 30

## The problem

The Studio needs a way to take a wedding off the site. The first design gave it
a delete button with a confirmation modal, which read as the obvious answer and
is not.

## What we decided

Nothing in the product deletes an album. The strongest action the Studio has is
unpublish. There is no `DELETE` on an album in the API, no button in the Studio,
and no delete-album variant in the confirmation modal. Removing a wedding for
good is a developer at the database, through the runbook in chapter 30.

## Why

The asymmetry. Unpublishing is instant and reversible and covers every real
reason an album comes off the site — the couple changed their mind, the writing
is wrong, it went out early. Deleting handles none of those better, and it is
the only action in the system that cannot be taken back. A button that is wanted
once a year and catastrophic once is a bad trade; a documented manual procedure
costs an hour on the rare day it is needed and nothing on every other day.

## What we did not do

- **A delete button with a confirmation** — the original design. A confirmation
  dialog is a speed bump, not a safeguard; people click through them.
- **A soft delete with an archive and a thirty-day sweep** — better, and still
  more machinery than a once-a-year operation deserves. Unpublish already is the
  reversible state.

## What this costs us

Album rows stay once they exist, so the database grows with the studio's whole
history rather than with the current site. An album that has to be erased for a
legal reason is a careful manual operation rather than a click. And the Sunday
orphan sweep, not the application, is what eventually reclaims the files.

## How we would undo it

Adding the endpoint later is small. The important part is that if it is ever
added it enqueues `photo.cleanup` per photograph rather than relying on the
cascade, which removes the rows and leaves the objects in R2.
