/**
 * One Prettier config for the whole repository. Import order is Prettier's job
 * (ESLint's import/order rule is off, so the two never disagree):
 * third-party, then react, then the app's own aliases, then relative imports.
 *
 * Beyond the original list: `lib` joins the alias names, because `@/lib` is
 * where the web app keeps its API client and helpers; side-effect imports stay
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
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^react$",
    "^@/?(component|components|slices|store|utils|types|context|src|config|assets|view|root|layout|services|lib)(?:/.*)?$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderSideEffects: false,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
