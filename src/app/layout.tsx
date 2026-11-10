import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import PageTransition from "@/components/motion/PageTransition";
import Interactions from "@/components/motion/Interactions";
import { getMergedCompanyInfo } from "@/app/actions/settings";
import { MOTION_BOOT_SCRIPT } from "@/lib/motion-boot";
import { SITE_URL, absoluteUrl, jsonLd } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set a short title; the template adds the brand. The canonical URL is
  // set per page (a canonical here would be inherited by every route).
  title: {
    default: "Realty Flux — Premium Real Estate in Kenya",
    template: "%s | Realty Flux",
  },
  description:
    "Discover exceptional properties across Kenya. From luxury villas in Karen to beachfront apartments in Mombasa, Realty Flux connects you with your dream property.",
  applicationName: "Realty Flux",
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
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Realty Flux — Premium Real Estate in Kenya",
    description:
      "Discover exceptional properties across Kenya. From luxury villas to modern apartments.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c3a1d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companyInfo = await getMergedCompanyInfo();

  // Tells Google who the business is: name, logo and contact details. Add a
  // `sameAs` list of social profile URLs here once the accounts are confirmed.
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: companyInfo.name,
    url: SITE_URL,
    ...(companyInfo.logo ? { logo: absoluteUrl(companyInfo.logo) } : {}),
    description: companyInfo.about,
    telephone: companyInfo.phone,
    email: companyInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo.address,
      addressCountry: "KE",
    },
    areaServed: { "@type": "Country", name: "Kenya" },
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: companyInfo.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    // The boot script adds a class to <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd([organizationLd, websiteLd]) }}
        />
        <MotionProvider />
        <PageTransition brand={companyInfo.name} />
        <Interactions />
        <Navbar companyName={companyInfo.name} logo={companyInfo.logo} />
        <main>{children}</main>
        <Footer companyInfo={companyInfo} />
      </body>
    </html>
  );
}

