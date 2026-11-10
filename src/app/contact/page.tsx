import { getMergedCompanyInfo } from "@/app/actions/settings";
import ContactClient from "./ContactClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Realty Flux to book a viewing, ask about a listing or speak to an agent. Call, email or visit our office in Nairobi, Kenya.",
  path: "/contact",
});

export default async function ContactPage() {
  const companyInfo = await getMergedCompanyInfo();

  return <ContactClient companyInfo={companyInfo} />;
}
