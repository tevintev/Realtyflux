"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAgent } from "@/app/actions/agents";
import { Trash2 } from "lucide-react";

export default function DeleteAgentButton({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${agentName}"? Any properties assigned to them will become unassigned.`
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await deleteAgent(agentId);
    if (res && res.error) {
      alert(res.error);
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
        borderRadius: "8px",
        color: "#ef4444",
        cursor: loading ? "not-allowed" : "pointer",
      }}
      title="Delete Agent"
    >
      <Trash2 size={16} />
    </button>
  );
}
