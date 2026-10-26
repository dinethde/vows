import type { NextConfig } from "next";
import { join } from "node:path";

// No security headers are set here, deliberately — chapter 19 and decision 015.
// When they go on, the CSP is assembled in middleware: a static header cannot
// carry the per-request nonce that Next's inline scripts need.
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // @vows/ui is consumed as source, so Tailwind sees its classes.
  transpilePackages: ["@vows/ui"],
  // The workspace root, so a deployment traces files from the right lockfile.
  outputFileTracingRoot: join(__dirname, "../../"),
};

export default config;
