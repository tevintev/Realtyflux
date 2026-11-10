import { db } from "@/lib/db";
import { Plus, User, Mail, Phone, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteAgentButton from "@/components/admin/DeleteAgentButton";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const agents = await db.agent.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Agents
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
            Manage the agents you can assign to property listings.
          </p>
        </div>
        <Link href="/admin/agents/new" className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
          <Plus size={18} /> Add Agent
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.92rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--color-stone-100)",
                  borderBottom: "1px solid var(--color-stone-200)",
                }}
              >
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Agent
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Contact
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Listings
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "4rem 1.5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    No agents yet. Click &quot;Add Agent&quot; to create one.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr
                    key={agent.id}
                    style={{
                      borderBottom: "1px solid var(--color-stone-200)",
                      transition: "background 0.2s ease",
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "var(--color-stone-100)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {agent.photo ? (
                            <Image
                              src={agent.photo}
                              alt={agent.name}
                              width={44}
                              height={44}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }}
                              unoptimized={!agent.photo.startsWith("/")}
                            />
                          ) : (
                            <User size={18} style={{ color: "var(--text-muted)" }} />
                          )}
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                          {agent.name}
                        </p>
                      </div>
                    </td>

                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.85rem" }}>
                        {agent.email && (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Mail size={12} /> {agent.email}
                          </span>
                        )}
                        {agent.phone && (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Phone size={12} /> {agent.phone}
                          </span>
                        )}
                        {!agent.email && !agent.phone && <em style={{ color: "var(--text-muted)" }}>No contact info</em>}
                      </div>
                    </td>

                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>
                      {agent._count.properties} {agent._count.properties === 1 ? "listing" : "listings"}
                    </td>

                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <Link
                          href={`/admin/agents/${agent.id}/edit`}
                          className="admin-edit-btn"
                          title="Edit Agent"
                        >
                          <Edit size={16} />
                        </Link>
                        <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
