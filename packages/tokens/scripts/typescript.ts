import { toCamel, toCssVar } from "./names";
import { MODES, resolve } from "./source";
import type { Mode, TextStyle, TokenSource } from "./source";

const WEIGHTS: Record<string, number> = { Regular: 400, Italic: 400, Medium: 500 };

function literal(value: string | number): string {
  return typeof value === "number" ? String(value) : `'${value}'`;
}

function object(name: string, entries: [string, string][], indent = ""): string {
  const body = entries.map(([key, value]) => `${indent}  ${key}: ${value},`).join("\n");
  return `${name}{\n${body}\n${indent}}`;
}

function primitives(source: TokenSource): string {
  const entries = Object.entries(source.primitives.variables).map(
    ([name, value]): [string, string] => [toCamel(name), literal(value)],
  );
  return `export const primitive = ${object("", entries)} as const;`;
}

function tokens(source: TokenSource): string {
  const entries = Object.keys(source.semantic.variables).map((name): [string, string] => [
    toCamel(name),
    `'var(${toCssVar(name)})'`,
  ]);
  return `export const token = ${object("", entries)} as const;`;
}

function resolvedMode(source: TokenSource, mode: Mode): [string, string] {
  const entries = Object.keys(source.semantic.variables).map((name): [string, string] => [
    toCamel(name),
    literal(resolve(source, name, mode)),
  ]);
  return [mode, object("", entries, "  ")];
}

function typeStyle(style: TextStyle): string {
  const entries: [string, string][] = [
    ["fontFamily", literal(style.family)],
    ["fontStyle", literal(style.style === "Italic" ? "italic" : "normal")],
    ["fontWeight", literal(WEIGHTS[style.style] ?? 400)],
    ["fontSize", literal(style.size)],
    ["lineHeight", literal(style.lineHeight)],
    ["letterSpacing", literal(style.letterSpacing ?? 0)],
    ["textTransform", literal(style.case ? `${style.case}case` : "none")],
  ];
  return object("", entries, "  ");
}

/**
 * The same values for anywhere CSS cannot reach. `token` holds the custom
 * property, which follows the surface. `resolved` holds the final value in
 * each mode, for an email or a share card that has no stylesheet.
 */
export function renderTypescript(source: TokenSource): string {
  const resolved = MODES.map((mode) => resolvedMode(source, mode));
  const styles = Object.entries(source.textStyles).map(([name, style]): [string, string] => [
    toCamel(name),
    typeStyle(style),
  ]);
  return [
    "// generated — do not edit.",
    "// Source: the Figma variables and styles, copied into tokens.json.",
    "// Change them in Figma, export again, then run pnpm tokens:build.",
    "",
    primitives(source),
    "",
    tokens(source),
    "",
    `export const resolved = ${object("", resolved)} as const;`,
    "",
    `export const typeStyle = ${object("", styles)} as const;`,
    "",
    "export type TokenName = keyof typeof token;",
    "export type Surface = keyof typeof resolved;",
    "export type TypeStyleName = keyof typeof typeStyle;",
    "",
  ].join("\n");
}
