# Audit exceptions

`pnpm audit` runs in CI and fails on a high or critical advisory. Three are
ignored in `package.json` under `pnpm.auditConfig`. Each is here with its reason,
so an ignore is a decision and not a habit. Remove a line the day its fix exists.

| Advisory                                            | Package                              | Why it is ignored                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GHSA-vfj7-8cjw-p6xm                                 | `braces`, under ESLint's tooling     | No fixed version exists. It runs only when linting our own files.                                                                                                                              |
| The two PostCSS advisories listed in `package.json` | `postcss` 8.4.31, pinned inside Next | Next 15 pins this version, and forcing a newer one breaks `next/font` at build. It only ever processes our own stylesheets, at build time. Goes away with the Next upgrade that moves the pin. |
