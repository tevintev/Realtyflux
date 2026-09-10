import Hero from "@/components/home/Hero";
import SearchBar from "@/components/home/SearchBar";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import MissionSection from "@/components/home/MissionSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import { getMergedCompanyInfo } from "@/app/actions/settings";

export default async function Home() {
  const companyInfo = await getMergedCompanyInfo();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Header Section */}
      <Hero />

      {/* Embedded Search Component overlaying Hero */}
      <SearchBar />

      {/* Featured Properties Showcase */}
      <FeaturedProperties />

      {/* Mission & Brand Values Section */}
      <MissionSection companyInfo={companyInfo} />

      {/* Property Categories Quick Links */}
      <CategoriesSection />

      {/* Client Testimonials */}
      <TestimonialsSection />

      {/* CTA section to prompt viewings */}
      <CTASection companyInfo={companyInfo} />
    </div>
  );
}

