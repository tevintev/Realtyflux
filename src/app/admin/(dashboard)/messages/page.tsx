import { db } from "@/lib/db";
import MessagesInbox from "@/components/admin/MessagesInbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await db.message.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", height: "100%" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Messages
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
          Read and respond to client inquiries and contact forms.
        </p>
      </div>

      <MessagesInbox initialMessages={messages} />
    </div>
  );
}
