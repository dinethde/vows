import { clsx } from 'clsx';
import { useId, type ReactElement } from 'react';

import { cn } from '../lib/cn';

import type { SiteFieldProps } from './field.types';

/* Figma binds the mark to the primitive color/red/700. There is no semantic
 * token for it yet, so this points at the primitive rather than a near miss. */
function RequiredMark(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="stroke-(--vows-color-red-700) shrink-0 fill-none"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M8 2.67V13.33M12.67 4.67L3.33 11.33M3.33 4.67L12.67 11.33" />
    </svg>
  );
}

/* Default, Typing and Filled are the browser's own states: the placeholder
 * showing, the input focused, the input holding a value. Only Error is a prop. */
export function SiteField({
  surface: _surface,
  label,
  error,
  className,
  id,
  required,
  'aria-describedby': describedBy,
  ...rest
}: SiteFieldProps): ReactElement {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const invalid = error !== undefined && error !== '';

  return (
    <div className={cn('group flex w-full flex-col gap-[10px]', className)}>
      <div className="gap-space-2 flex items-center">
        <input
          {...rest}
          id={inputId}
          required={required}
          placeholder={label}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={clsx(describedBy, invalid && messageId) || undefined}
          className="type-ui-field-l text-primary placeholder:text-placeholder min-w-0 flex-1 bg-transparent caret-current outline-none"
        />
        {required === true ? <RequiredMark /> : null}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'text-primary h-[1.5px] border-t',
          invalid
            ? 'border-status-error border-t-[1.5px]'
            : 'border-hairline group-focus-within:border-t-[1.5px] group-focus-within:border-current',
        )}
      />
      {invalid ? (
        <p id={messageId} className="type-body-xs text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
