import { Slot } from "@radix-ui/react-slot";

import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/focus";
import { guardedClick } from "../lib/guarded-click";
import type { ButtonProps, ButtonVariant } from "./button.types";

/* The drawn button is 34 tall (32 for nav). `before` grows the place a finger
 * can land to 44 without moving anything. */
const base = cn(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
  "transition-colors motion-reduce:transition-none",
  "before:absolute before:inset-x-0",
  "disabled:cursor-not-allowed disabled:opacity-65",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-65",
  focusRing,
);

/* Figma draws the Studio stroke inside the box, so the 8 / 20 padding runs to
 * the outer edge. `after` carries the stroke and leaves the padding alone. */
const studio = cn(
  "gap-space-2 rounded-sm px-space-5 py-space-2 type-studio-button before:-inset-y-[5px]",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:border",
  "after:border-transparent after:transition-colors motion-reduce:after:transition-none",
);

const variants: Record<ButtonVariant, string> = {
  primary: cn(
    studio,
    "bg-action-primary text-action-primary",
    "hover:bg-action-primary-hover active:bg-action-primary-pressed",
  ),
  neutral: cn(
    studio,
    "bg-action-neutral text-action-neutral after:border-action-neutral",
    "hover:bg-action-neutral-hover hover:text-inverse hover:after:border-action-neutral-hover",
    "active:bg-action-neutral-pressed active:text-inverse active:after:border-action-neutral-hover",
  ),
  outline: cn(
    studio,
    "text-action-neutral after:border-action-neutral",
    "hover:after:border-action-neutral-hover",
    "active:bg-action-outline-pressed active:after:border-action-outline-pressed",
  ),
  danger: cn(
    studio,
    "bg-action-danger text-action-danger",
    "hover:bg-action-danger-hover active:bg-action-danger-pressed",
  ),
  nav: cn(
    "gap-space-2 rounded-pill border px-space-4 py-[3px] type-nav-link before:-inset-y-[6px]",
    "border-action-neutral bg-action-neutral text-action-neutral",
    "hover:border-transparent hover:bg-action-neutral-hover hover:text-inverse",
    "active:border-transparent active:bg-action-neutral-pressed active:text-inverse",
  ),
};

function Spinner(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="rounded-pill size-[14px] animate-spin border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export function Button({
  variant = "primary",
  pending = false,
  asChild = false,
  className,
  children,
  disabled,
  onClick,
  type = "button",
  ...rest
}: ButtonProps): ReactElement {
  const classes = cn(base, variants[variant], className);
  const blocked = pending || disabled === true;

  if (asChild) {
    return (
      <Slot
        {...rest}
        className={classes}
        aria-disabled={blocked || undefined}
        aria-busy={pending || undefined}
        onClick={guardedClick(blocked, onClick)}
      >
        {children}
      </Slot>
    );
  }

  /* A pending button is not `disabled`: that would drop the focus out of the
   * dialog it sits in. It is announced as busy and swallows the press. */
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={guardedClick(pending, onClick)}
    >
      {pending ? <Spinner /> : null}
      {children}
    </button>
  );
}
