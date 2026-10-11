# @vows/config

Shared presets. Nothing in here runs at request time.

| Export | Used by |
|---|---|
| `@vows/config/eslint/base` | `@vows/contracts`, the repository root |
| `@vows/config/eslint/node` | `@vows/api`, `@vows/worker`, `@vows/db`, `@vows/tokens` |
| `@vows/config/eslint/react` | `@vows/ui`, `@vows/mail` |
| `@vows/config/eslint/next` | `@vows/web` |
| `@vows/config/tsconfig/*.json` | every package's `tsconfig.json` |
| `@vows/config/tailwind/vows.css` | `@vows/web`, `@vows/ui` |

The tsconfig presets all extend `tsconfig.base.json` at the repository root, so
the strict flags are written once. Each preset only adds what its target needs:
`nest.json` turns decorators on, `next.json` keeps JSX for the Next compiler,
`library.json` emits declaration maps.
