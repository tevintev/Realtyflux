import Hero from "@/components/home/Hero";
import SearchBar from "@/components/home/SearchBar";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import MissionSection from "@/components/home/MissionSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import PropertyShowcase from "@/components/home/PropertyShowcase";
import { getMergedCompanyInfo } from "@/app/actions/settings";
import type { Metadata } from "next";

// The home page keeps the full default title from the root layout.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Realty Flux — Premium Real Estate in Kenya",
    description:
      "Discover exceptional properties across Kenya. From luxury villas to modern apartments.",
    url: "/",
    siteName: "Realty Flux",
    locale: "en_KE",
    type: "website",
  },
};

export default async function Home() {
  const companyInfo = await getMergedCompanyInfo();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Header Section */}
      <Hero images={companyInfo.heroImages ?? []} />

      {/* Embedded Search Component overlaying Hero */}
      <SearchBar />

      {/* Pinned property-type showcase: images slide aside as the next arrives */}
      <PropertyShowcase />

      {/* Featured Properties Showcase */}
      <FeaturedProperties />

      {/* Mission & Brand Values Section */}
      <MissionSection companyInfo={companyInfo} />

      {/* Client Testimonials */}
      <TestimonialsSection />

      {/* CTA section to prompt viewings */}
      <CTASection companyInfo={companyInfo} />
    </div>
  );
}

