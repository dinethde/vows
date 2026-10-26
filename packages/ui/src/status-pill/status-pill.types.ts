import type { ComponentProps } from "react";

/** The Figma `State` values, spelled as Figma spells them. The Studio derives
 * the state from the album; nobody picks it by hand. */
export type StatusPillState = "Published" | "Draft" | "Untouched";

export interface StatusPillProps extends Omit<ComponentProps<"span">, "children"> {
  state: StatusPillState;
}
