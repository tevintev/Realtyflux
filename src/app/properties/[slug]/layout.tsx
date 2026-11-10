import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { getRenderableImageList, getRenderableImageSrc } from "@/lib/image-path";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl, jsonLd, socialImageUrl } from "@/lib/site";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Both generateMetadata and the layout need the listing; cache() makes it one query.
const getListing = cache((slug: string) =>
  db.property.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  })
);

const TYPE_LABELS: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  villa: "Villa",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial property",
};

function summarise(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function listingImages(listing: NonNullable<Awaited<ReturnType<typeof getListing>>>): string[] {
  const featured = getRenderableImageSrc(listing.featuredImage);
  const gallery = getRenderableImageList(listing.images.map((image) => image.imageUrl));
  return Array.from(new Set([featured, ...gallery].filter((src): src is string => Boolean(src))));
}

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) {
    return { title: "Property not found", robots: { index: false, follow: false } };
  }

  const forRent = listing.listingType === "rent";
  const state =
    listing.status === "sold" ? "Sold" : listing.status === "rented" ? "Rented" : forRent ? "For Rent" : "For Sale";
  const typeLabel = TYPE_LABELS[listing.propertyType] ?? "Property";
  const images = listingImages(listing).slice(0, 3).map((src) => socialImageUrl(src));

  return pageMetadata({
    title: `${listing.title} — ${state} in ${listing.location}`,
    description: summarise(
      listing.shortDescription || listing.description || `${typeLabel} ${state.toLowerCase()} in ${listing.location}.`
    ),
    path: `/properties/${listing.slug}`,
    images: images.length ? images : undefined,
  });
}

export default async function PropertyLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const listing = await getListing(slug);
  // A real 404 for unknown slugs so search engines drop dead links.
  if (!listing) notFound();

  const url = absoluteUrl(`/properties/${listing.slug}`);
  const images = listingImages(listing).slice(0, 6).map((src) => absoluteUrl(src));
  const available = listing.status === "on-sale";

  const listingLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: listing.title,
    url,
    description: summarise(listing.description || listing.shortDescription, 500),
    datePosted: listing.createdAt.toISOString(),
    dateModified: listing.updatedAt.toISOString(),
    ...(images.length ? { image: images } : {}),
    contentLocation: {
      "@type": "Place",
      name: listing.location,
      address: {
        "@type": "PostalAddress",
        streetAddress: listing.address,
        addressLocality: listing.location,
        addressCountry: "KE",
      },
    },
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: listing.currency,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Properties", item: absoluteUrl("/properties") },
      { "@type": "ListItem", position: 3, name: listing.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([listingLd, breadcrumbLd]) }}
      />
      {children}
    </>
  );
}
