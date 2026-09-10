import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getMergedCompanyInfo } from "@/app/actions/settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there's no session, middleware should protect us, but this is a solid guard
  if (!session) {
    redirect("/admin/login");
  }

  const [companyInfo, adminName] = await Promise.all([
    getMergedCompanyInfo(),
    (session.name as string) || "Admin User",
  ]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* Sidebar Panel */}
      <AdminSidebar
        adminName={adminName}
        logo={companyInfo.logo}
        companyName={companyInfo.name}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
        className="admin-main-content"
      >
        <main
          style={{
            flex: 1,
            padding: "2rem 1.75rem",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

