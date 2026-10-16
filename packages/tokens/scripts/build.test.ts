import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { renderPrimitives, renderSemantic } from './css';
import { toCamel, toCssVar, toKebab } from './names';
import { assertAliasesResolve, readSource, resolve } from './source';
import { renderTypescript } from './typescript';

const source = readSource(join(__dirname, '../tokens.json'));

describe('token names', () => {
  it('turns a Figma name into its three shapes', () => {
    expect(toKebab('bg/surface-light')).toBe('bg-surface-light');
    expect(toCssVar('action/primary/bg')).toBe('--vows-action-primary-bg');
    expect(toCamel('Display/Error code — Mobile')).toBe('displayErrorCodeMobile');
  });
});

describe('the two modes', () => {
  it('makes the Studio primary action orange and the Site one black', () => {
    expect(resolve(source, 'action/primary/bg', 'studio')).toBe(
      source.primitives.variables['color/orange/500'],
    );
    expect(resolve(source, 'action/primary/bg', 'site')).toBe(
      source.primitives.variables['color/ink/900'],
    );
  });

  it('puts Site values on :root and Studio values under the data attribute', () => {
    const css = renderSemantic(source);
    const [site, studio] = css.split("[data-surface='studio']");
    expect(site).toContain('--vows-action-primary-bg: var(--vows-color-ink-900);');
    expect(studio).toContain('--vows-action-primary-bg: var(--vows-color-orange-500);');
  });

  it('refuses a semantic token that points at a primitive that is not there', () => {
    const broken = structuredClone(source);
    broken.semantic.variables['bg/page'] = { site: 'color/ink/50', studio: 'color/gone/1' };
    expect(() => {
      assertAliasesResolve(broken);
    }).toThrow('bg/page (studio)');
  });
});

describe('the generated files', () => {
  it('start with the generated banner', () => {
    expect(renderPrimitives(source)).toMatch(/^\/\* generated — do not edit\./);
    expect(renderSemantic(source)).toMatch(/^\/\* generated — do not edit\./);
    expect(renderTypescript(source)).toMatch(/^\/\/ generated — do not edit\./);
  });

  it('write lengths in pixels and type sizes in rem', () => {
    expect(renderPrimitives(source)).toContain('--vows-space-8: 40px;');
    expect(renderSemantic(source)).toMatch(/@utility type-heading-1 \{[^}]*font-size: 2\.5rem;/);
  });

  it('give every semantic token a custom property in TypeScript', () => {
    const ts = renderTypescript(source);
    for (const name of Object.keys(source.semantic.variables)) {
      expect(ts).toContain(`${toCamel(name)}: 'var(${toCssVar(name)})'`);
    }
  });
});
