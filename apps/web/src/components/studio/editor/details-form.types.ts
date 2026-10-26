import type { ReactNode } from "react";

import type { TextFieldSpec } from "./details-copy";

export interface HelpedProps {
  /** The helper line, or null when the field is not the active one or has an error. */
  help: string | null;
  helpId: string;
  children: ReactNode;
  className?: string;
}

export interface TextFieldProps {
  spec: TextFieldSpec;
}
