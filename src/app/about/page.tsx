import { getMergedCompanyInfo } from "@/app/actions/settings";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const companyInfo = await getMergedCompanyInfo();

  return <AboutClient companyInfo={companyInfo} />;
}
