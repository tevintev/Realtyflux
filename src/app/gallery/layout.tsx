import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Property Gallery",
  description:
    "Photos and videos of homes, apartments, villas, land and commercial properties listed by Realty Flux across Kenya.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
