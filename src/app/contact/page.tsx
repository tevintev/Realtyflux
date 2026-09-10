import { getMergedCompanyInfo } from "@/app/actions/settings";
import ContactClient from "./ContactClient";

export default async function ContactPage() {
  const companyInfo = await getMergedCompanyInfo();

  return <ContactClient companyInfo={companyInfo} />;
}
