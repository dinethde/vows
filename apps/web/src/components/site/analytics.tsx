import type { ReactElement } from "react";

import { env } from "@/config/env";

/**
 * Cloudflare Web Analytics: the one third-party script the public site is
 * allowed (chapter 18). No cookie, so no banner. Drawn only when a site token
 * is set, so a laptop, a preview and the Studio send nothing.
 */
export function Analytics(): ReactElement | null {
  if (!env.ANALYTICS_TOKEN) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: env.ANALYTICS_TOKEN })}
    />
  );
}
