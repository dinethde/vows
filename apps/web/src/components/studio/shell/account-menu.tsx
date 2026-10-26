"use client";

import { useClerk } from "@clerk/nextjs";
import { cn } from "@vows/ui";

import { useId, useRef } from "react";
import type { ReactElement } from "react";

import { focusRing } from "@/components/shared/focus";
import { useDismiss } from "@/components/shared/use-dismiss";
import { SIGN_IN_PATH } from "@/lib/auth/constants";

export interface AccountMenuProps {
  /** The signed-in person's own name. Empty while Clerk is still loading. */
  name: string;
  /** Their own email, not the studio's public address. */
  email: string;
}

export interface AccountPanelProps extends AccountMenuProps {
  id: string;
}

function initialOf(name: string, email: string): string {
  return (name.trim()[0] ?? email.trim()[0] ?? "").toUpperCase();
}

/** What the chip opens: whose account this is, on a narrow screen, and the way out. */
function AccountPanel({ id, name, email }: AccountPanelProps): ReactElement {
  const { signOut } = useClerk();
  return (
    <div
      id={id}
      role="menu"
      aria-label="Account"
      className="border-hairline bg-surface gap-space-2 p-space-2 shadow-card absolute right-0 top-full z-40 flex min-w-[220px] flex-col rounded-md border"
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    >
      <div className="gap-space-1 px-space-2 py-space-1 flex flex-col min-[768px]:hidden">
        <span className="type-ui-caption text-action-neutral">{name}</span>
        <span className="type-ui-caption-s text-muted break-all">{email}</span>
      </div>
      <button
        type="button"
        role="menuitem"
        autoFocus
        className={cn(
          "px-space-2 type-ui-caption text-action-neutral hover:bg-field-muted flex min-h-[44px] cursor-pointer items-center rounded-sm text-left",
          focusRing,
        )}
        onClick={() => {
          void signOut({ redirectUrl: SIGN_IN_PATH });
        }}
      >
        Sign out
      </button>
    </div>
  );
}

/**
 * The account chip in the top bar. A real menu button at every width: below
 * 768 the name and email leave the bar and are shown inside the menu instead,
 * so the photographer can still see whose account this is.
 */
export function AccountMenu({ name, email }: AccountMenuProps): ReactElement {
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useDismiss(() => trigger.current?.focus());
  const menuId = useId();

  return (
    <div className="relative flex" {...menu.rootProps}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menuId : undefined}
        aria-label={`Account: ${name || email || "loading"}`}
        className={cn(
          "gap-space-2 px-space-2 py-space-1 flex min-h-[46px] cursor-pointer items-center rounded-[12px] text-left",
          focusRing,
        )}
        onClick={menu.toggle}
      >
        <span
          aria-hidden="true"
          className="rounded-pill bg-slot type-studio-avatar text-action-neutral flex size-[38px] shrink-0 items-center justify-center"
        >
          {initialOf(name, email)}
        </span>
        <span aria-hidden="true" className="gap-space-1 hidden flex-col min-[768px]:flex">
          <span className="type-ui-caption text-action-neutral">{name || " "}</span>
          <span className="type-ui-caption-s text-muted">{email || " "}</span>
        </span>
      </button>
      {menu.open ? <AccountPanel id={menuId} name={name} email={email} /> : null}
    </div>
  );
}
