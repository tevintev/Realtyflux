import { getMergedCompanyInfo } from "@/app/actions/settings";
import AboutClient from "./AboutClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about Realty Flux, a Kenyan real estate company connecting buyers, tenants and investors with carefully vetted homes, apartments, land and commercial property.",
  path: "/about",
});

export default async function AboutPage() {
  const companyInfo = await getMergedCompanyInfo();

  return <AboutClient companyInfo={companyInfo} />;
}
