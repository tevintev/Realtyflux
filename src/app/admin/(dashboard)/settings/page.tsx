import { getCompanySettings } from "@/app/actions/settings";
import CompanySettingsForm from "@/components/admin/CompanySettingsForm";

export const metadata = {
  title: "Company Settings — Realty Flux Admin",
  description: "Configure company information, branding, contact details, and social links.",
};

export default async function CompanySettingsPage() {
  const settings = await getCompanySettings();

  if (!settings) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#dc2626",
          background: "rgba(239,68,68,0.07)",
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(239,68,68,0.18)",
        }}
      >
        Unable to load company settings. Please check your database connection and try again.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px" }}>
      <CompanySettingsForm settings={settings} />
    </div>
  );
}
