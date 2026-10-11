import globals from 'globals';

import base from './base.js';

export default [
  ...base,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // NestJS decorators and pg-boss handlers both need this
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/unbound-method': 'off',
      // A Nest constructor is its dependency list, not a call anyone writes out.
      'max-params': ['error', 6],
    },
  },
];
