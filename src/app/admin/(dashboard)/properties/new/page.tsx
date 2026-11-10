import { db } from "@/lib/db";
import PropertyForm from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const agents = await db.agent.findMany({ orderBy: { name: "asc" } });
  return <PropertyForm agents={agents} />;
}
