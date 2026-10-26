import node from "@vows/config/eslint/node";

// src/index.ts is written by scripts/build.ts, so it is checked by the build's
// own tests and not by the linter.
export default [{ ignores: ["src/index.ts"] }, ...node];
