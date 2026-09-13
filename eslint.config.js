import js from "@eslint/js";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import vows from "./eslint-rules/no-design-literals.js";

/** The one file allowed to hold design values. */
const TOKEN_FILE = "src/styles/tokens.css";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      ".output",
      ".nitro",
      ".tanstack",
      "dist",
      "src/routeTree.gen.ts",
      "public",
    ],
  },

  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { vows },
    rules: {
      "vows/no-design-literals": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: { css, vows },
    languageOptions: { tolerant: true },
    rules: {
      ...css.configs.recommended.rules,
      "css/no-invalid-at-rules": "off",
      "css/no-invalid-properties": "off",
      "css/use-baseline": "off",
      "vows/no-design-literals": "error",
    },
  },

  {
    // The token file is the single definition point — it is exempt by design.
    files: [TOKEN_FILE],
    rules: { "vows/no-design-literals": "off" },
  },

  {
    // The rule and its self-test must name the literals they ban.
    files: ["eslint-rules/**", "scripts/verify-lint-rule.mjs"],
    rules: { "vows/no-design-literals": "off" },
  },
);
