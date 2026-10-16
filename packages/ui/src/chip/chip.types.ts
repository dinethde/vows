import type { ComponentProps } from 'react';

export interface ChipProps extends ComponentProps<'button'> {
  /** Figma `State=Selected`. Leave it out for a chip that is not a choice,
   * such as a link to Instagram; then no pressed state is announced. */
  selected?: boolean;
  /** Render the one child instead of a `button`, so the app can pass a link. */
  asChild?: boolean;
}
