import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Properties for Sale & Rent in Kenya",
  description:
    "Browse houses, apartments, villas, townhouses, land and commercial property for sale and rent across Kenya. Filter by location, type and budget.",
  path: "/properties",
});

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
