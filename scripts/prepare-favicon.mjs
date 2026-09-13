/**
 * Writes public/favicon.svg from the design tokens, so the favicon's colours
 * come from src/styles/tokens.css like everything else rather than being a
 * second place a hex value lives.
 *
 * Usage: node scripts/prepare-favicon.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const tokens = await readFile(
  join(process.cwd(), "src", "styles", "tokens.css"),
  "utf8",
);

function token(name) {
  const match = tokens.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Missing design token --${name}`);
  return match[1].trim();
}

const ink = token("color-ink");
const canvas = token("color-canvas");

// The wordmark's V, set in Mate's proportions: a plain two-stroke chevron.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${canvas}"/>
  <path d="M16 18 L32 47 L48 18" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter"/>
</svg>
`;

await writeFile(join(process.cwd(), "public", "favicon.svg"), svg);
console.log("wrote public/favicon.svg");
