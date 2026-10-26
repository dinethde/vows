import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { renderPrimitives, renderSemantic } from "./css";
import { readSource } from "./source";
import { renderTypescript } from "./typescript";

const root = join(__dirname, "..");
const source = readSource(join(root, "tokens.json"));

const files: [string, string][] = [
  ["css/primitives.css", renderPrimitives(source)],
  ["css/semantic.css", renderSemantic(source)],
  ["src/index.ts", renderTypescript(source)],
];

for (const [file, content] of files) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

process.stdout.write(`tokens: wrote ${files.map(([file]) => file).join(", ")}\n`);
