"use client";

import { useState } from "react";
import { deleteProperty } from "@/app/actions/properties";
import { Trash2 } from "lucide-react";

interface DeletePropertyButtonProps {
  propertyId: string;
  propertyTitle: string;
}

export default function DeletePropertyButton({
  propertyId,
  propertyTitle,
}: DeletePropertyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyTitle}"? This will permanently delete the listing and all associated images/bookings.`
    );

    if (!confirmed) return;

    setLoading(true);
    const res = await deleteProperty(propertyId);
    if (res && res.error) {
      alert(res.error);
      setLoading(false);
    }
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
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "#ef4444";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
          e.currentTarget.style.color = "#ef4444";
        }
      }}
      title="Delete Listing"
    >
      {loading ? (
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid rgba(239,68,68,0.2)",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
