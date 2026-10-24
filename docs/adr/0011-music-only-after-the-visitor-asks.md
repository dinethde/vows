# 0011 — Music, but only after the visitor asks for it

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 12

## The problem

The studio wants the site to feel like a film. Music does that. Music that
starts on its own does the opposite, loudly, on someone's commute.

## What we decided

On a first visit the home page shows a small pill over a blurred page: play
music, or skip. Nothing loads until that choice is made, and the choice is
remembered. The track is "Romantic Saxophone" under the Pixabay Content Licence
— commercial use allowed, no attribution required.

## Why

Browsers block autoplay with sound anyway, so autoplay is not a choice we have;
the only question is whether the visitor is asked well. Deferring the audio
request also keeps it out of the first load entirely, so the page's performance
budget in chapter 18 is unaffected for everyone who skips.

## What we did not do

- **Autoplay** — blocked, and hostile where it is not.
- **No music at all** — loses the thing the studio actually asked for.

## What this costs us

A deliberate interruption on the first screen, which has to be beautiful enough
to earn its place, plus a first-visit state to design, build and test at both
widths.

## How we would undo it

The pill and the player are one component and one stored preference. Removing it
removes the feature.
