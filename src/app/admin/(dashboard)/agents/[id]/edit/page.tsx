import { db } from "@/lib/db";
import AgentForm from "@/components/admin/AgentForm";
import { notFound } from "next/navigation";

interface EditAgentPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;

  const agent = await db.agent.findUnique({ where: { id } });

  if (!agent) {
    notFound();
  }

  return (
    <AgentForm
      initialData={{
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        photo: agent.photo,
        bio: agent.bio,
      }}
    />
  );
}
