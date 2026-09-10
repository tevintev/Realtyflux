import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getMergedCompanyInfo } from "@/app/actions/settings";

export const metadata: Metadata = {
  title: "Realty Flux — Premium Real Estate in Kenya",
  description:
    "Discover exceptional properties across Kenya. From luxury villas in Karen to beachfront apartments in Mombasa, Realty Flux connects you with your dream property.",
  keywords: [
    "real estate Kenya",
    "property for sale Nairobi",
    "luxury homes Kenya",
    "apartments Nairobi",
    "villas Karen",
    "Realty Flux",
  ],
  openGraph: {
    title: "Realty Flux — Premium Real Estate in Kenya",
    description:
      "Discover exceptional properties across Kenya. From luxury villas to modern apartments.",
    siteName: "Realty Flux",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companyInfo = await getMergedCompanyInfo();

  return (
    <html lang="en">
      <body>
        <Navbar companyName={companyInfo.name} logo={companyInfo.logo} />
        <main>{children}</main>
        <Footer companyInfo={companyInfo} />
      </body>
    </html>
  );
}

