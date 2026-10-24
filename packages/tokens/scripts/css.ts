import { toCssVar, toKebab } from './names';
import { MODES } from './source';
import type { Effect, Mode, TextStyle, TokenSource } from './source';

const ROOT_FONT_SIZE = 16;
const WEIGHTS: Record<string, number> = { Regular: 400, Italic: 400, Medium: 500 };
const FALLBACKS: Record<string, string> = {
  Mate: 'Georgia, serif',
  Inter: 'ui-sans-serif, system-ui, sans-serif',
  'Instrument Sans': 'ui-sans-serif, system-ui, sans-serif',
};
const SELECTORS: Record<Mode, string> = { site: ':root', studio: "[data-surface='studio']" };

export function banner(collection: string): string {
  return [
    '/* generated — do not edit.',
    ` * Source: the Figma ${collection}, copied into tokens.json.`,
    ' * Change it in Figma, export again, then run pnpm tokens:build. */',
  ].join('\n');
}

function rem(px: number): string {
  return px === 0 ? '0' : `${String(Number((px / ROOT_FONT_SIZE).toFixed(4)))}rem`;
}

function block(selector: string, lines: string[]): string {
  return `${selector} {\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;
}

function primitiveValue(value: string | number): string {
  if (typeof value === 'string') return value;
  return value === 0 ? '0' : `${String(value)}px`;
}

export function renderPrimitives(source: TokenSource): string {
  const lines = Object.entries(source.primitives.variables).map(
    ([name, value]) => `${toCssVar(name)}: ${primitiveValue(value)};`,
  );
  return `${banner('collection vows/primitives')}\n\n${block(':root', lines)}\n`;
}

function effectValue(effect: Effect): string {
  if (effect.type === 'blur') return `${String(effect.radius)}px`;
  const offsets = [effect.x, effect.y, effect.blur, effect.spread]
    .map((n) => (n === 0 ? '0' : `${String(n)}px`))
    .join(' ');
  const percent = String(Number((effect.opacity * 100).toFixed(2)));
  return `${offsets} color-mix(in srgb, var(${toCssVar('color/ink/900')}) ${percent}%, transparent)`;
}

function effectLines(source: TokenSource): string[] {
  return Object.entries(source.effectStyles).map(
    ([name, effects]) => `${toCssVar(name)}: ${effects.map(effectValue).join(', ')};`,
  );
}

function modeLines(source: TokenSource, mode: Mode): string[] {
  return Object.entries(source.semantic.variables).map(
    ([name, modes]) => `${toCssVar(name)}: var(${toCssVar(modes[mode])});`,
  );
}

function typeUtility(name: string, style: TextStyle): string {
  const family = `var(${toCssVar(`font/${style.family}`)}), ${FALLBACKS[style.family] ?? 'serif'}`;
  const lines = [
    `font-family: ${family};`,
    `font-style: ${style.style === 'Italic' ? 'italic' : 'normal'};`,
    `font-weight: ${String(WEIGHTS[style.style] ?? 400)};`,
    `font-size: ${rem(style.size)};`,
    `line-height: ${rem(style.lineHeight)};`,
    `letter-spacing: ${rem(style.letterSpacing ?? 0)};`,
  ];
  if (style.case) lines.push(`text-transform: ${style.case}case;`);
  return block(`@utility type-${toKebab(name)}`, lines);
}

/**
 * Site values sit on :root and Studio values under the data attribute, so one
 * attribute on the Studio layout re-skins everything below it. The text styles
 * are Tailwind utilities, which is what lets a breakpoint variant pick one.
 */
export function renderSemantic(source: TokenSource): string {
  const modes = MODES.map((mode) => {
    const extra = mode === 'site' ? effectLines(source) : [];
    return block(SELECTORS[mode], [...modeLines(source, mode), ...extra]);
  });
  const type = Object.entries(source.textStyles).map(([name, style]) => typeUtility(name, style));
  const head = banner('collection vows/semantic and the text and effect styles');
  return `${[head, ...modes, ...type].join('\n\n')}\n`;
}
