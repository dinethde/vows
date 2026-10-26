'use client';

import { useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { useDashboardNavigation } from './dashboard-navigation';
import type { SearchInputProps } from './search-input.types';
import { useDebounce } from './use-debounce';
import { cleanQuery, dashboardHref, typedQuery } from './view';

/** How long typing has to pause before the grid is searched. */
const TYPING_PAUSE_MS = 300;

/**
 * The search box. With no script it is a plain field in a GET form. With one,
 * the grid is searched as the photographer types: from the third character,
 * once typing pauses. A search adds one entry to the history, on its first
 * change, and every keystroke after that replaces it, so Back returns to the
 * previous search rather than the previous keystroke. Focusing the box again,
 * or pressing Enter, starts a new search.
 */
export function SearchInput({ view }: SearchInputProps): ReactElement {
  const { show } = useDashboardNavigation();
  const debounce = useDebounce(TYPING_PAUSE_MS);
  const [text, setText] = useState(view.query);
  const [followed, setFollowed] = useState(view.query);
  const entered = useRef(false);

  // The address moved some other way (back, a filter, "Show every album"),
  // so the box takes its search. Typing that moved it is left alone.
  if (view.query !== followed) {
    setFollowed(view.query);
    if (view.query !== typedQuery(text)) setText(view.query);
  }

  const search = (query: string): void => {
    debounce.cancel();
    if (query === view.query) return;
    show(dashboardHref({ ...view, query }), entered.current ? 'replace' : 'push');
    entered.current = true;
  };

  return (
    <input
      type="search"
      name="q"
      value={text}
      aria-label="Search albums"
      placeholder="Search albums"
      enterKeyHint="search"
      className="type-studio-body-s text-primary placeholder:text-primary h-full min-w-0 flex-1 bg-transparent px-[11px] outline-none"
      onFocus={() => {
        entered.current = false;
      }}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        const query = typedQuery(next);
        if (query === view.query) debounce.cancel();
        else
          debounce.schedule(() => {
            search(query);
          });
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
        event.preventDefault();
        search(cleanQuery(text));
        entered.current = false;
      }}
    />
  );
}
