import type { ReactElement } from "react";

import { cn } from "@vows/ui";

import { FilterLink } from "./filter-link";
import { SearchInput } from "./search-input";
import { FILTERS, FILTER_LABELS, dashboardHref } from "./view";
import type { DashboardView } from "./view";

export interface CollectionToolbarProps {
  view: DashboardView;
  /** How many albums the collection holds, from the API's counts. */
  total: number;
}

export interface ToolbarPartProps {
  view: DashboardView;
}

const ring =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

function SearchGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      width="14.4219"
      height="17"
      viewBox="0 0 14.4219 17"
      fill="none"
      className="text-muted shrink-0"
    >
      <path
        d="M6.61004 12.1055C8.93316 12.1055 10.8164 10.2222 10.8164 7.89909C10.8164 5.57596 8.93316 3.6927 6.61004 3.6927C4.28691 3.6927 2.40365 5.57596 2.40365 7.89909C2.40365 10.2222 4.28691 12.1055 6.61004 12.1055Z"
        stroke="currentColor"
        strokeWidth="0.96146"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.0183 13.3073L9.6146 10.9037"
        stroke="currentColor"
        strokeWidth="0.96146"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A plain GET form: the search is in the address, and it works with no
 * script. With one, the field inside searches as it is typed into.
 */
function Search({ view }: ToolbarPartProps): ReactElement {
  return (
    <form
      role="search"
      action="/studio"
      className="border-card gap-space-2 focus-within:border-focus-ring tablet:w-[190px] desktop:h-[35px] flex h-[44px] w-full items-center border-b px-[10px]"
    >
      <SearchGlyph />
      <SearchInput view={view} />
      {view.filter === "all" ? null : <input type="hidden" name="stage" value={view.filter} />}
    </form>
  );
}

/* 28 tall as drawn. `before` takes the place a finger can land to 44. */
const chip = cn(
  "px-space-3 type-studio-caption relative flex h-[28px] items-center justify-center",
  "before:absolute before:inset-x-0 before:-inset-y-2",
  ring,
);

function Filters({ view }: ToolbarPartProps): ReactElement {
  return (
    <nav
      aria-label="Filter albums by state"
      className="border-hairline bg-slot flex w-fit border p-[3px]"
    >
      {FILTERS.map((filter) => {
        const current = filter === view.filter;
        return (
          <FilterLink
            key={filter}
            href={dashboardHref({ ...view, filter })}
            current={current}
            className={cn(chip, current ? "bg-surface text-primary shadow-card" : "text-muted")}
          >
            {FILTER_LABELS[filter]}
          </FilterLink>
        );
      })}
    </nav>
  );
}

/**
 * The heading over the cards, with the search box and the filter beside it.
 * Once the counts above have scrolled away it stays under the Studio's bar,
 * and the cards pass beneath it.
 */
export function CollectionToolbar({ view, total }: CollectionToolbarProps): ReactElement {
  return (
    <div
      data-held-toolbar
      className="gap-space-3 pt-space-4 pb-space-6 tablet:flex-row tablet:items-end tablet:justify-between bg-page sticky top-[var(--studio-bar)] z-20 flex flex-col"
    >
      <div className="flex items-end gap-[11px]">
        <h2 className="type-studio-heading text-heading">Your collection</h2>
        <p className="type-studio-caption text-placeholder pb-[7px]">
          {total === 1 ? "1 album" : `${String(total)} albums`}
        </p>
      </div>
      <div className="tablet:flex-row tablet:items-center tablet:gap-[14px] flex flex-col gap-[10px]">
        <Search view={view} />
        <Filters view={view} />
      </div>
    </div>
  );
}
