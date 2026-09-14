/**
 * Proves vows/no-design-literals actually fires. Writes a fixture containing
 * one violation of each category, lints it with the project's real config, and
 * fails if any category slips through. Runs as part of `npm run lint`.
 */
import { ESLint } from "eslint";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), ".lint-fixture");
const cases = [
  ["hex.ts", 'export const a = "#535051";', "Hex colour"],
  ["rgb.ts", 'export const a = "rgba(0, 0, 0, 0.8)";', "Colour function"],
  [
    "named.tsx",
    'export const a = <i className="bg-white" />;',
    "CSS named colour",
  ],
  [
    "gsap.ts",
    'gsap.to(el, { duration: 0.64, backgroundColor: "#fff" });',
    "Hex colour",
  ],
  ["size.ts", 'export const a = { width: "150px" };', "Dimension literal"],
  ["dur.ts", 'export const a = "320ms";', "Duration literal"],
  [
    "ease.ts",
    'export const a = "cubic-bezier(0.22, 1, 0.36, 1)";',
    "Easing curve",
  ],
  [
    "style.css",
    "a { color: #535051; padding: 12px; transition: 320ms; }",
    "Hex colour",
  ],
];

mkdirSync(dir, { recursive: true });
for (const [name, source] of cases) writeFileSync(join(dir, name), source);

const eslint = new ESLint({ errorOnUnmatchedPattern: false });
const results = await eslint.lintFiles([join(dir, "*")]);
rmSync(dir, { recursive: true, force: true });

let failed = false;
for (const [name, , expect] of cases) {
  const result = results.find((r) => r.filePath.endsWith(name));
  const messages = (result?.messages ?? []).filter(
    (m) => m.ruleId === "vows/no-design-literals",
  );
  const hit = messages.some((m) => m.message.includes(expect));
  if (!hit) {
    failed = true;
    console.error(`FAIL ${name}: expected a "${expect}" violation, got none.`);
  } else {
    console.log(`ok   ${name}  ${messages.length} violation(s)  [${expect}]`);
  }
}

if (failed) {
  console.error(
    "\nvows/no-design-literals is not catching everything it must.",
  );
  process.exit(1);
}
console.log("\nvows/no-design-literals verified across all categories.");
