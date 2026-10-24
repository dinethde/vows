import js from '@eslint/js';
import ts from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

/**
 * The eleven code-quality rules from chapter 26 of architecture.md, as far as a
 * linter can express them. The ones a linter cannot check — "a component does
 * one thing", "name things the way the design names them" — are in
 * .claude/rules and belong to review.
 */
export default ts.config(
  {
    // Config files sit outside each package's tsconfig, so the type-aware
    // rules cannot read them.
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/*.gen.ts',
      '**/*.config.{js,mjs,cjs,ts,mts}',
    ],
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      // rule 1 — a file that does too much is a file nobody reads
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 12],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],

      // rule 3 — no silent failures
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',

      // rule 4 — types are not decoration
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // rule 6 — dead code is a lie about what the project does
      'no-unused-private-class-members': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // rule 9 — imports say where a thing comes from
      'import/no-cycle': 'error',
      'import/no-default-export': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@vows/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-param-reassign': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/e2e/**'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
);
