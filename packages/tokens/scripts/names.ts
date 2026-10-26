/**
 * The only place a Figma name changes shape. `bg/surface-light` becomes
 * `bg-surface-light`, `--vows-bg-surface-light` and `bgSurfaceLight`, and
 * nothing else in the repository is allowed to do that by hand.
 */
export function toKebab(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toCamel(name: string): string {
  return toKebab(name).replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

export function toCssVar(name: string): string {
  return `--vows-${toKebab(name)}`;
}
