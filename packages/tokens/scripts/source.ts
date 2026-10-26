import { readFileSync } from "node:fs";

export const MODES = ["site", "studio"] as const;
export type Mode = (typeof MODES)[number];

export interface TextStyle {
  family: string;
  style: string;
  size: number;
  lineHeight: number;
  letterSpacing?: number;
  case?: "upper" | "lower";
}

export type Effect =
  | { type: "shadow"; x: number; y: number; blur: number; spread: number; opacity: number }
  | { type: "blur"; radius: number };

export interface TokenSource {
  primitives: { variables: Record<string, string | number> };
  semantic: { variables: Record<string, Record<Mode, string>> };
  textStyles: Record<string, TextStyle>;
  effectStyles: Record<string, Effect[]>;
}

/**
 * A semantic token that points at a primitive Figma no longer has would render
 * as nothing at all, so the build stops here instead.
 */
export function assertAliasesResolve(source: TokenSource): void {
  const primitives = source.primitives.variables;
  for (const [name, modes] of Object.entries(source.semantic.variables)) {
    for (const mode of MODES) {
      const alias = modes[mode];
      if (!(alias in primitives)) {
        throw new Error(`${name} (${mode}) points at "${alias}", which is not a primitive.`);
      }
    }
  }
}

export function readSource(path: string): TokenSource {
  // tokens.json is our own export, checked by the assertion below.
  const source = JSON.parse(readFileSync(path, "utf8")) as TokenSource;
  assertAliasesResolve(source);
  return source;
}

/** The hex or number a semantic token ends up as in one mode. */
export function resolve(source: TokenSource, name: string, mode: Mode): string | number {
  const alias = source.semantic.variables[name]?.[mode];
  const value = alias === undefined ? undefined : source.primitives.variables[alias];
  if (value === undefined) throw new Error(`${name} has no value in ${mode} mode.`);
  return value;
}
