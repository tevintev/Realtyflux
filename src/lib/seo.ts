import type { Metadata } from "next";

export const SITE_NAME = "Realty Flux";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path of the page, e.g. "/about". Becomes the canonical URL. */
  path: string;
  /** Absolute image URLs for social previews. Omit to use the site-wide image. */
  images?: string[];
}

// Title, description, canonical URL and social tags for a page. Titles get the
// " | Realty Flux" suffix from the template in the root layout.
export function pageMetadata({ title, description, path, images }: PageMetadataInput): Metadata {
  const socialTitle = `${title} | ${SITE_NAME}`;
  // A page's own openGraph replaces the site-wide one, so repeat the default image.
  const shareImages = images ?? ["/opengraph-image.jpg"];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_KE",
      type: "website",
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: shareImages,
    },
  };
}
