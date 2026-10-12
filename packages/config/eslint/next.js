import react from './react.js';

export default [
  ...react,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Nothing outside src/lib/api may call the API directly — chapter 14.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/api/transport*'],
              message: 'Use serverApi() or browserApi() from @/lib/api, not the transport.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/api/**', '**/*.test.{ts,tsx}'],
    rules: {
      // The API is reached through src/lib/api and nowhere else. A stray fetch
      // is how an authenticated reply ends up cached.
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Call the API through @/lib/api. Nothing else in apps/web may call fetch.',
        },
      ],
      // Pages, layouts and route files are found by their default export.
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['src/lib/api/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
];
