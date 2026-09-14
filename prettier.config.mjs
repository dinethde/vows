/**
 * Formatting is three plugins run in sequence by prettier-plugin-merge:
 * `tailwindcss` sorts each class list into canonical order, `classnames`
 * then wraps the sorted list across lines, and `merge` exists because
 * Prettier would otherwise use only the last plugin that claims a language.
 * Order matters — merge MUST come last.
 */

/** @type {import("prettier").Config} */
export default {
  // Matches the ~80 column shape the codebase was already written to.
  printWidth: 80,

  plugins: [
    "prettier-plugin-tailwindcss",
    "prettier-plugin-classnames",
    "prettier-plugin-merge",
  ],

  overrides: [
    {
      // None of the plugins support Markdown; leaving them on would let them
      // reach into fenced code blocks. The plugin options are declared in the
      // override below rather than at the top level so that they are not in
      // scope here — Prettier warns about options whose plugin is absent.
      files: ["*.md", "*.mdx"],
      options: { plugins: [] },
    },
    {
      files: ["*.js", "*.mjs", "*.ts", "*.tsx", "*.css"],
      options: {
        // Tailwind v4 has no JS config — the sorter reads the utilities and
        // custom variants (mid:, text-h5, px-xs …) out of the CSS entry point.
        tailwindStylesheet: "./src/styles/app.css",

        // cn()/cva()/clsx() take class strings, so both plugins look inside
        // them as well as inside class/className attributes.
        tailwindFunctions: ["cn", "cva", "clsx"],
        customFunctions: ["cn", "cva", "clsx"],

        // Class lists wrap at 100 columns while code stays at 80, so a long
        // utility string breaks onto its own lines without pulling the rest
        // of the file to a wider margin.
        classnamesPrintWidth: 100,
      },
    },
  ],
};
