import type { StudioAlbumStage } from '@vows/contracts';
import type { StatusPillState } from '@vows/ui';

const PILL: Record<StudioAlbumStage, StatusPillState> = {
  untouched: 'Untouched',
  draft: 'Draft',
  published: 'Published',
  // Nothing in the Studio archives an album, and Figma has no pill for it. An
  // archived album is off the website, which is what Draft says.
  archived: 'Draft',
};

/** The API's stage, spelled the way the Figma `status_pill` spells its states. */
export function pillFor(stage: StudioAlbumStage): StatusPillState {
  return PILL[stage];
}

export function isLive(stage: StudioAlbumStage): boolean {
  return stage === 'published';
}
