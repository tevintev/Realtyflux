import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

// Listings change whenever the admin edits them, so build this on every request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await db.property
    .findMany({ select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } })
    .catch(() => []);

  const newest = listings[0]?.updatedAt;

  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/properties"), lastModified: newest, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/gallery"), lastModified: newest, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    ...listings.map((listing) => ({
      url: absoluteUrl(`/properties/${listing.slug}`),
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
