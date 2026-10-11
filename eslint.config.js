// The root config exists so `eslint .` at the root does something sensible and
// so editors find a config from any file. Each app and package has its own,
// which is what `turbo run lint` actually uses.
import base from '@vows/config/eslint/base';

export default [
  { ignores: ['apps/**', 'packages/**', '**/dist/**', '**/.next/**'] },
  ...base,
];
