import type { StudioAlbumSummary } from '@vows/contracts';
import { describe, expect, it } from 'vitest';

import { dashboardHref, parseView, visibleAlbums } from './dashboard/view';
import { toChanges, toFormValues } from './editor/album-form.schema';
import { blockedNote, findProblems, problemSummary, slotProblems } from './editor/publish-problems';
import { movePhoto } from './editor/reorder';
import { needsPolling, slotView } from './editor/slot-view';
import { chooseBanner } from './editor/use-album-editor';
import { albumWith, fullGallery, photoAt } from './fixtures';
import { isLive, pillFor } from './stage';

import type { UploadItem } from '@/lib/upload/queue';

describe('the stage an album is shown in', () => {
  it('spells the API’s stage the way the status pill does', () => {
    expect(pillFor('untouched')).toBe('Untouched');
    expect(pillFor('draft')).toBe('Draft');
    expect(pillFor('published')).toBe('Published');
  });

  it('shows an archived album as a draft, because it is off the website', () => {
    expect(pillFor('archived')).toBe('Draft');
    expect(isLive('archived')).toBe(false);
    expect(isLive('published')).toBe(true);
  });
});

describe('the dashboard’s view', () => {
  const { photos: _photos, ...summary } = albumWith([]);
  const albums: StudioAlbumSummary[] = [
    { ...summary, id: 'alb_000001', stage: 'published', coupleNames: 'Benali & Yasiru' },
    { ...summary, id: 'alb_000002', stage: 'draft', coupleNames: 'Amaya & Ruwan' },
    { ...summary, id: 'alb_000003', stage: 'archived', location: 'Galle Fort' },
    { ...summary, id: 'alb_000004', stage: 'untouched' },
  ];

  it('reads the filter and the search from the address', () => {
    expect(parseView({ stage: 'draft', q: '  amaya ' })).toEqual({
      filter: 'draft',
      query: 'amaya',
    });
    expect(parseView({ stage: 'nonsense' })).toEqual({ filter: 'all', query: '' });
  });

  it('writes a plain address for the plain dashboard', () => {
    expect(dashboardHref({ filter: 'all', query: '' })).toBe('/studio');
    expect(dashboardHref({ filter: 'published', query: 'galle fort' })).toBe(
      '/studio?q=galle+fort&stage=published',
    );
  });

  it('filters by stage, listing archived albums with the drafts', () => {
    const drafts = visibleAlbums(albums, { filter: 'draft', query: '' });
    expect(drafts.map((album) => album.id)).toEqual(['alb_000002', 'alb_000003']);
  });

  it('searches names and places without caring about case', () => {
    expect(visibleAlbums(albums, { filter: 'all', query: 'YASIRU' })).toHaveLength(1);
    expect(visibleAlbums(albums, { filter: 'all', query: 'galle' })).toHaveLength(1);
    expect(visibleAlbums(albums, { filter: 'published', query: 'amaya' })).toHaveLength(0);
  });
});

describe('what stops an album being published', () => {
  const ready = { coupleNames: 'Benali & Yasiru', shotOn: '2 January 2022' };

  it('finds nothing wrong with a complete album', () => {
    const problems = findProblems({ ...ready, photos: fullGallery(), uploading: new Set() });
    expect(problems).toEqual({});
  });

  it('uses the API’s keys, so both lists mark the same things', () => {
    const photos = fullGallery()
      .filter((photo) => photo.position !== 7)
      .map((photo) => (photo.position === 3 ? { ...photo, alt: null } : photo));
    const problems = findProblems({ coupleNames: ' ', shotOn: '', photos, uploading: new Set() });

    expect(Object.keys(problems)).toEqual(['coupleNames', 'shotOn', 'photos.3.alt', 'photos.7']);
    expect(problems['photos.7']).toBe('Slot 7 is empty. Add a photograph.');
    expect(problems['photos.3.alt']).toBe('Describe the photograph in slot 3.');
  });

  it('names a missing cover, and a cover still on its way, differently', () => {
    const noCover = fullGallery().filter((photo) => photo.position !== 0);
    expect(findProblems({ ...ready, photos: noCover, uploading: new Set() })).toEqual({
      cover: 'Add a cover photograph.',
    });
    expect(findProblems({ ...ready, photos: noCover, uploading: new Set([0]) })).toEqual({
      'photos.0': 'The cover photograph has not finished uploading.',
    });
  });

  it('does not count a photograph the worker has not finished', () => {
    const photos = fullGallery().map((photo) =>
      photo.position === 5 ? { ...photo, status: 'processing' as const } : photo,
    );
    expect(findProblems({ ...ready, photos, uploading: new Set() })).toEqual({
      'photos.5': 'The photograph in slot 5 has not finished uploading.',
    });
  });

  it('gives each slot its own problem and its description’s', () => {
    const problems = { cover: 'Add a cover photograph.', 'photos.3.alt': 'Describe it.' };
    expect(slotProblems(problems, 0).slot).toBe('Add a cover photograph.');
    expect(slotProblems(problems, 3)).toEqual({ slot: undefined, alt: 'Describe it.' });
  });

  it('counts in plain words', () => {
    expect(problemSummary(1)).toBe('1 thing needs fixing before this album can go live.');
    expect(problemSummary(2)).toBe('2 things need fixing before this album can go live.');
    expect(blockedNote(2)).toBe('Publishing is blocked until both things are fixed.');
  });
});

describe('what a slot shows', () => {
  const upload = (changes: Partial<UploadItem>): UploadItem => ({
    key: 'key-1',
    albumId: 'alb_000019',
    position: 4,
    file: new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
    status: 'uploading',
    progress: 37,
    message: null,
    ...changes,
  });

  it('is empty with nothing in it, and shows the photograph once it is ready', () => {
    expect(slotView(undefined, undefined).state).toBe('Empty');
    expect(slotView(photoAt(4), undefined).state).toBe('Uploaded');
  });

  it('shows the browser’s progress while a file is on its way, even over an old photograph', () => {
    const view = slotView(photoAt(4), upload({}));
    expect(view).toMatchObject({ state: 'Uploading', progress: 37 });
  });

  it('stays busy at 100 until the worker reports ready', () => {
    const view = slotView(photoAt(4, { status: 'processing' }), undefined);
    expect(view).toMatchObject({ state: 'Uploading', progress: 100 });
  });

  it('never falls back to empty on a failure', () => {
    const dropped = slotView(undefined, upload({ status: 'error', message: 'It dropped.' }));
    expect(dropped).toMatchObject({ state: 'Error', retry: 'upload', uploadKey: 'key-1' });

    const unreadable = slotView(
      photoAt(4, { status: 'failed', errorCode: 'processing_failed' }),
      undefined,
    );
    expect(unreadable).toMatchObject({ state: 'Error', retry: 'pick' });
    expect(unreadable.message).toMatch(/could not read this file/);

    expect(slotView(photoAt(4, { status: 'pending' }), undefined).state).toBe('Error');
  });

  it('asks again only while the worker is busy', () => {
    expect(needsPolling(fullGallery())).toBe(false);
    expect(needsPolling([photoAt(1, { status: 'processing' })])).toBe(true);
    expect(needsPolling([photoAt(1, { status: 'pending' })])).toBe(true);
    expect(needsPolling(undefined)).toBe(false);
  });
});

describe('moving a photograph', () => {
  it('exchanges two slots and lists all eighteen for the API', () => {
    const moved = movePhoto([photoAt(0), photoAt(1), photoAt(2)], 1, 2);
    expect(moved?.photos.map((photo) => [photo.id, photo.position])).toEqual([
      ['pho_slot0000', 0],
      ['pho_slot0002', 1],
      ['pho_slot0001', 2],
    ]);
    expect(moved?.slots.slice(0, 3)).toEqual(['pho_slot0002', 'pho_slot0001', null]);
    expect(moved?.slots).toHaveLength(18);
  });

  it('leaves an empty slot behind when it moves into one', () => {
    const moved = movePhoto([photoAt(1)], 1, 2);
    expect(moved?.slots.slice(0, 2)).toEqual([null, 'pho_slot0001']);
  });

  it('will not move the cover, or past either end', () => {
    expect(movePhoto([photoAt(0), photoAt(1)], 1, 0)).toBeNull();
    expect(movePhoto([photoAt(18)], 18, 19)).toBeNull();
    expect(movePhoto([photoAt(1)], 5, 6)).toBeNull();
  });
});

describe('the form', () => {
  it('sends only what was edited, an emptied field as null and the date as a plain day', () => {
    const values = {
      ...toFormValues(albumWith([])),
      coupleNames: ' Benali & Yasiru ',
      shotOn: '17 January 2025',
      story: '',
    };
    expect(toChanges(values, { coupleNames: true, shotOn: true, story: true })).toEqual({
      coupleNames: 'Benali & Yasiru',
      shotOn: '2025-01-17',
      story: null,
    });
    expect(toChanges(values, {})).toBeNull();
  });

  it('shows one strip at a time, the most urgent first', () => {
    const quiet = { wrong: 0, failure: null, dirty: false, saved: false };
    expect(chooseBanner(quiet)).toBeNull();
    expect(chooseBanner({ ...quiet, saved: true })?.state).toBe('Saved');
    expect(chooseBanner({ ...quiet, saved: true, dirty: true })?.state).toBe('Unsaved');
    expect(chooseBanner({ ...quiet, dirty: true, wrong: 2 })).toEqual({
      state: 'Error',
      text: '2 things need fixing before this album can go live.',
    });
  });
});
