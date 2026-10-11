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
    files: ['src/lib/api/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
];
