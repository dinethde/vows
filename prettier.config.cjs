/**
 * One Prettier config for the whole repository. Import order is Prettier's job
 * (ESLint's import/order rule is off, so the two never disagree):
 * third-party, then react, then the aliases (@vows/* first, then @/*), then
 * relative imports.
 *
 * Beyond the original list: `lib`, `app` and `styles` join the alias names,
 * because the web app imports from `@/lib`, `@/app` and `@/styles` too; side-effect imports stay
 * where they are, because `import 'reflect-metadata'` must come first and a
 * stylesheet's position decides its cascade; `decorators-legacy` lets the
 * NestJS files parse; and the Tailwind plugin, which must be last, keeps
 * sorting class lists.
 */
module.exports = {
  // --- core Prettier style ---
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  printWidth: 100,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  // <SEPARATOR> puts a blank line only where it stands. The two alias patterns
  // have none between them, so they read as one block with the workspace
  // packages (@vows/*) always first, then the app's own @/ aliases.
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "<SEPARATOR>",
    "^react$",
    "<SEPARATOR>",
    "^@vows/(.*)$",
    "^@/?(component|components|slices|store|utils|types|context|src|config|assets|view|root|layout|services|lib|app|styles)(?:/.*)?$",
    "<SEPARATOR>",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderSideEffects: false,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
