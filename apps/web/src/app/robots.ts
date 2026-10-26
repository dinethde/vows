import type { MetadataRoute } from "next";

import { env } from "@/config/env";

/** The Studio is a tool, not a page. It is kept out of every index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api"] },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
