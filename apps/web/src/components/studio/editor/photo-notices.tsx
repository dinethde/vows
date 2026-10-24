'use client';

import type { ReactElement } from 'react';

import { useSlots } from './slots-context';

/**
 * What went wrong with photographs outside any one slot: a file that was
 * turned away before it started, a move the API undid, a list that could not
 * be refreshed. Announced as it appears. Nothing is drawn when all is well.
 */
export function PhotoNotices(): ReactElement {
  const { photos, mutations } = useSlots();
  const lines = [
    ...photos.rejections.map((entry) => ({ id: entry.id, text: entry.message })),
    ...(mutations.moveError ? [{ id: 'move', text: mutations.moveError }] : []),
    ...(photos.stale
      ? [
          {
            id: 'stale',
            text: 'The photographs could not be refreshed. What you see may be out of date. Reload the page to try again.',
          },
        ]
      : []),
  ];

  return (
    <div role="alert" className="empty:hidden">
      {lines.length > 0 ? (
        <ul className="gap-space-1 flex flex-col">
          {lines.map((line) => (
            <li key={line.id} className="type-studio-caption text-status-error">
              {line.text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
