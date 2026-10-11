import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

import base from './base.js';

export default [
  ...base,
  {
    files: ['**/*.tsx'],
    plugins: { react, 'react-hooks': hooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...hooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // rule 2 — one component, one job, 250 lines at the outside
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
];
