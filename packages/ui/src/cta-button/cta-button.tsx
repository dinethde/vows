import { Slot, Slottable } from "@radix-ui/react-slot";

import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/focus";
import { guardedClick } from "../lib/guarded-click";
import type { CtaButtonProps } from "./cta-button.types";

const base = cn(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
  "rounded-pill bg-action-primary text-action-primary",
  "transition-colors motion-reduce:transition-none",
  "hover:bg-action-primary-hover active:bg-action-primary-pressed",
  "disabled:cursor-not-allowed disabled:opacity-65",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-65",
  focusRing,
);

/* `cta_button`: 50 tall on a phone, 56 from the tablet up. */
const withArrow = cn(
  "gap-[14px] py-space-3 pr-space-6 pl-[22px] type-heading-6",
  "tablet:py-[15px] tablet:pr-space-7 tablet:pl-[28px] tablet:type-heading-5",
);

/* `send_button`: 54 tall at every width. */
const withoutArrow = "gap-space-3 px-[36px] py-[14px] type-heading-5";

function Arrow(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 overflow-visible fill-none stroke-current"
      width="34"
      height="14"
      viewBox="0 0 34 14"
      strokeWidth="1.6"
    >
      <path d="M0 7H34M34 7L27 0M34 7L27 14" />
    </svg>
  );
}

function Spinner(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="rounded-pill size-[18px] shrink-0 animate-spin border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

function leading(arrow: boolean, pending: boolean): ReactElement | null {
  if (pending) return <Spinner />;
  return arrow ? <Arrow /> : null;
}

export function CtaButton({
  arrow = true,
  pending = false,
  asChild = false,
  className,
  children,
  disabled,
  onClick,
  type = "button",
  ...rest
}: CtaButtonProps): ReactElement {
  const blocked = pending || disabled === true;
  const shared = {
    className: cn(base, arrow ? withArrow : withoutArrow, className),
    "aria-busy": pending || undefined,
  };

  if (asChild) {
    return (
      <Slot
        {...rest}
        {...shared}
        aria-disabled={blocked || undefined}
        onClick={guardedClick(blocked, onClick)}
      >
        {leading(arrow, pending)}
        <Slottable>{children}</Slottable>
      </Slot>
    );
  }

  return (
    <button
      {...rest}
      {...shared}
      type={type}
      disabled={disabled}
      aria-disabled={pending || undefined}
      onClick={guardedClick(pending, onClick)}
    >
      {leading(arrow, pending)}
      {children}
    </button>
  );
}
