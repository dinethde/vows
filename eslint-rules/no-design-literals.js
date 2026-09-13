/**
 * vows/no-design-literals
 *
 * Fails the build when a design value is written anywhere other than the token
 * file. Colour literals (hex, rgb()/hsl()/oklch()/…, CSS named colours),
 * dimension literals (12px, 1.5rem, …), duration literals (320ms, 0.4s) and
 * raw easing curves (cubic-bezier(…)) must be defined once in
 * src/styles/tokens.css and consumed as semantic classes or var(--token).
 *
 * Works against both the JS/TS AST (visitor `Program`) and the @eslint/css AST
 * (visitor `StyleSheet`) — in both cases it scans the raw source text, which is
 * what makes it impossible to smuggle a literal past it via template strings,
 * JSX attributes, GSAP tweens, shader uniforms or inline styles.
 */

const NAMED_COLOURS = [
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque",
  "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood",
  "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk",
  "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen",
  "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink",
  "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite",
  "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
  "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred",
  "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen",
  "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgray",
  "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen",
  "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime",
  "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue",
  "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
  "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
  "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff",
  "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
  "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow",
  "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise",
  "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen",
];

const PATTERNS = [
  {
    id: "hex",
    re: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    message: "Hex colour `{{ match }}`",
  },
  {
    id: "colourFn",
    re: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\s*\(/g,
    message: "Colour function `{{ match }}`",
  },
  {
    id: "named",
    // Only where the word is unambiguously being used as a colour: after a
    // colour-ish CSS/JSX property, or as a Tailwind colour utility suffix.
    // Keeps prose and alt text ("red roses") out of the results.
    re: new RegExp(
      "(?:\\b(?:color|fill|stroke|background|backgroundColor|borderColor|" +
        "outlineColor|caretColor|textDecorationColor|background-color|" +
        "border-color|outline-color|stop-color|flood-color|lighting-color)" +
        "\\s*:\\s*[\"']?|" +
        "\\b(?:bg|text|border|fill|stroke|from|via|to|ring|outline|decoration|" +
        "shadow|caret|accent|divide|placeholder)-)" +
        `(?:${NAMED_COLOURS.join("|")})(?![\\w-])`,
      "g",
    ),
    message: "CSS named colour `{{ match }}`",
  },
  {
    id: "dimension",
    re: /(?<![\w.#-])\d+(?:\.\d+)?(?:px|rem|em|pt|ch|ex)(?![\w-])/g,
    message: "Dimension literal `{{ match }}`",
  },
  {
    id: "duration",
    re: /(?<![\w.#-])\d+(?:\.\d+)?m?s(?![\w-])/g,
    message: "Duration literal `{{ match }}`",
  },
  {
    id: "easing",
    re: /\bcubic-bezier\s*\(/g,
    message: "Easing curve literal `{{ match }}`",
  },
];

/** Regions the scan must skip: comments, import specifiers, url() paths. */
const SKIP_REGIONS = [
  /\/\*[\s\S]*?\*\//g, // block comments (JS + CSS)
  /(^|[^:])\/\/[^\n]*/g, // line comments
  /\burl\(\s*[^)]*\)/g, // url(...) paths
  /\bfrom\s+["'][^"']*["']/g, // JS import specifiers
  /\brequire\(\s*["'][^"']*["']\s*\)/g,
  /@import\s+["'][^"']*["']/g,
  /\bimport\s+["'][^"']*["']/g,
];

function maskSkipRegions(text) {
  let masked = text;
  for (const re of SKIP_REGIONS) {
    masked = masked.replace(re, (m) => m.replace(/[^\n]/g, " "));
  }
  return masked;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow colour, spacing, type and motion literals outside the design token file.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
          checks: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      literal:
        "{{ detail }} is a design literal. Define it once in src/styles/tokens.css and reference it as a semantic class or var(--token). See DESIGN.md §1.",
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allow = new Set(options.allow ?? []);
    const enabled = options.checks
      ? PATTERNS.filter((p) => options.checks.includes(p.id))
      : PATTERNS;

    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function scan() {
      const text = sourceCode.text;
      const masked = maskSkipRegions(text);

      for (const pattern of enabled) {
        pattern.re.lastIndex = 0;
        let m;
        while ((m = pattern.re.exec(masked)) !== null) {
          const raw = text.slice(m.index, m.index + m[0].length);
          if (allow.has(raw)) continue;
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(m.index),
              end: sourceCode.getLocFromIndex(m.index + m[0].length),
            },
            messageId: "literal",
            data: {
              detail: pattern.message.replace("{{ match }}", raw.trim()),
            },
          });
        }
      }
    }

    return { Program: scan, StyleSheet: scan };
  },
};

export default {
  meta: { name: "vows" },
  rules: { "no-design-literals": rule },
};
