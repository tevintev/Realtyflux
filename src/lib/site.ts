// Public address of the site: used for canonical links, the sitemap and
// social previews. Override with SITE_URL in the environment if it ever moves.
export const SITE_URL = (process.env.SITE_URL || "https://therealtyflux.com").replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Social networks fetch full-size originals, so route local images through the
// Next image optimizer to keep share previews small and fast.
export function socialImageUrl(path: string, width = 1200): string {
  if (!path.startsWith("/") || /\.svg(\?|$)/i.test(path)) return absoluteUrl(path);
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`;
}

// Serialise structured data for a <script type="application/ld+json"> tag.
// Escaping "<" stops any listing text from closing the script early.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
