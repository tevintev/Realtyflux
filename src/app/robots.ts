import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or per-visitor areas. /_next/ and /uploads/ stay crawlable so
        // Google can render pages and index property images.
        disallow: ["/admin", "/api/", "/book/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
