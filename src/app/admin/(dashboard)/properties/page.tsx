import { db } from "@/lib/db";
import { Plus, Edit, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";

export const dynamic = "force-dynamic";

function formatCurrency(price: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency === "KES" ? "KES" : "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminPropertiesPage() {
  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
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
            Properties
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
            Manage and update your active property listings.
          </p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
          <Plus size={18} /> Add Property
        </Link>
      </div>

      {/* Listings Card Container */}
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
                  Listing Info
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Location
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Type
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Purpose
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Status
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Price
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
              {properties.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "4rem 1.5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    No property listings found. Click "Add Property" to create one.
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--color-stone-200)",
                      transition: "background 0.2s ease",
                    }}
                    className="table-row-hover"
                  >
                    {/* Title & Image */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "var(--color-stone-100)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            position: "relative",
                          }}
                        >
                          {p.featuredImage ? (
                            <img
                              src={p.featuredImage}
                              alt={p.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <ImageIcon size={20} style={{ color: "var(--text-muted)" }} />
                          )}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                            {p.title}
                          </p>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {p.bedrooms} bed • {p.bathrooms} bath • {Number(p.size).toLocaleString()} {p.sizeUnit}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>
                      {p.location}
                    </td>

                    {/* Property Type */}
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {p.propertyType}
                    </td>

                    {/* Purpose / Listing Type */}
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {p.listingType}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span className={`badge badge-${p.status}`} style={{ fontSize: "0.72rem" }}>
                        {p.status}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "1.25rem 1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatCurrency(Number(p.price), p.currency)}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "0.5rem",
                        }}
                      >
                        <Link
                          href={`/admin/properties/${p.id}/edit`}
                          className="admin-edit-btn"
                          title="Edit Listing"
                        >
                          <Edit size={16} />
                        </Link>
                        <DeletePropertyButton propertyId={p.id} propertyTitle={p.title} />
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

