import { clsx } from "clsx";

import { type ReactElement, useId } from "react";

import { cn } from "../lib/cn";
import type { StudioFieldProps } from "./field.types";

/* Focus and Error both thicken the stroke to 1.5, as Figma draws them. The
 * stroke is the focus indicator here: it is `focus/ring`, on the box itself. */
const control = cn(
  "w-full min-w-0 border border-field bg-field px-space-3 type-studio-body text-primary outline-none",
  "placeholder:type-meta-field-label placeholder:text-secondary",
  "focus:border-[1.5px] focus:border-focus-ring focus:bg-surface",
  "aria-invalid:border-[1.5px] aria-invalid:border-status-error aria-invalid:bg-status-error-field",
  "disabled:cursor-not-allowed disabled:opacity-65",
);

const prefixBox = cn(
  "flex h-space-8 shrink-0 items-center border border-r-0 border-hairline bg-field-muted",
  "pr-space-1 pl-space-3 type-studio-caption text-placeholder",
);

export function StudioField(props: StudioFieldProps): ReactElement {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const messageId = `${inputId}-message`;
  const prefixId = `${inputId}-prefix`;
  const invalid = props.error !== undefined && props.error !== "";
  const prefix = props.multiline === true ? undefined : props.prefix;

  const wiring = {
    id: inputId,
    "aria-invalid": invalid || undefined,
    "aria-describedby":
      clsx(props["aria-describedby"], prefix !== undefined && prefixId, invalid && messageId) ||
      undefined,
  };

  return (
    <div className={cn("flex w-full flex-col gap-[7px]", props.className)}>
      <label htmlFor={inputId} className="type-studio-label text-secondary">
        {props.label}
      </label>
      <div className="flex">
        {prefix !== undefined ? (
          <span id={prefixId} className={prefixBox}>
            {prefix}
          </span>
        ) : null}
        <Control props={props} wiring={wiring} />
      </div>
      {invalid ? (
        <p id={messageId} className="type-studio-caption text-status-error">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

interface ControlWiring {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

function Control({
  props,
  wiring,
}: {
  props: StudioFieldProps;
  wiring: ControlWiring;
}): ReactElement {
  if (props.multiline === true) {
    const { surface: _s, label: _l, error: _e, className: _c, multiline: _m, ...rest } = props;
    return (
      <textarea
        {...rest}
        {...wiring}
        className={cn(control, "py-space-3 min-h-[135px] resize-y")}
      />
    );
  }

  const {
    surface: _s,
    label: _l,
    error: _e,
    className: _c,
    multiline: _m,
    prefix: _p,
    ...rest
  } = props;
  return <input {...rest} {...wiring} className={cn(control, "h-space-8")} />;
}
