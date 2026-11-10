"use client";

import { useState } from "react";
import { updateBookingStatus, deleteBooking } from "@/app/actions/bookings";
import { Calendar, Phone, Mail, Clock, Search, Trash2, Check, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { dateKey, formatSlot } from "@/lib/booking-slots";

interface Booking {
  id: string;
  propertyId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: Date;
  preferredTime: Date;
  message: string | null;
  status: string;
  createdAt: Date;
  property: {
    title: string;
    slug: string;
  };
}

interface BookingsTableProps {
  initialBookings: Booking[];
}

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    const res = await updateBookingStatus(bookingId, newStatus);
    
    if (res.success) {
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } else {
      alert(res.error || "Failed to update status");
    }
    setUpdatingId(null);
  };

  const handleDelete = async (bookingId: string, clientName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the booking for "${clientName}"?`
    );
    if (!confirmed) return;

    setUpdatingId(bookingId);
    const res = await deleteBooking(bookingId);
    
    if (res.success) {
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } else {
      alert(res.error || "Failed to delete booking");
    }
    setUpdatingId(null);
  };

  // Slots (property + day + time) already held by a confirmed viewing.
  const slotKey = (b: Booking) =>
    `${b.propertyId}|${dateKey(new Date(b.preferredDate))}|${formatSlot(new Date(b.preferredTime))}`;
  const confirmedSlots = new Set(bookings.filter((b) => b.status === "confirmed").map(slotKey));

  // Filter & Search
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.property.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Search & Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search bookings..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Filter:
          </span>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px", padding: "0.5rem 1rem", appearance: "auto" }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Card Table */}
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
                  Client Details
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Property
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Date & Time
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Message
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Status
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Manage Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "4rem 1.5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    No bookings found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: "1px solid var(--color-stone-200)",
                      transition: "background 0.2s ease",
                      opacity: updatingId === b.id ? 0.6 : 1,
                    }}
                    className="table-row-hover"
                  >
                    {/* Client Info */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
                        {b.fullName}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.15rem",
                          marginTop: "0.3rem",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={12} /> {b.phone}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Mail size={12} /> {b.email}
                        </span>
                      </div>
                    </td>

                    {/* Property */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <Link
                        href={`/properties/${b.property.slug}`}
                        target="_blank"
                        style={{
                          fontWeight: 500,
                          color: "#16a34a",
                          textDecoration: "none",
                        }}
                      >
                        {b.property.title}
                      </Link>
                    </td>

                    {/* Date/Time */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 500 }}>
                          <Calendar size={13} style={{ color: "var(--text-secondary)" }} />
                          {new Date(b.preferredDate).toLocaleDateString([], {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          <Clock size={13} />
                          {formatSlot(new Date(b.preferredTime))}
                        </span>
                      </div>
                    </td>

                    {/* Message */}
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)", maxWidth: "220px" }}>
                      {b.message ? (
                        <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.4 }}>
                          {b.message}
                        </p>
                      ) : (
                        <em style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No message</em>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                      {b.status === "pending" && confirmedSlots.has(slotKey(b)) && (
                        <span
                          title="Another viewing is already confirmed for this property at this time. Reschedule or cancel this request."
                          style={{
                            display: "block",
                            marginTop: "0.4rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#dc2626",
                          }}
                        >
                          Slot already taken
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "0.4rem",
                        }}
                      >
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(b.id, "confirmed")}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "30px",
                                height: "30px",
                                background: "rgba(22, 163, 74, 0.1)",
                                border: "1px solid rgba(22, 163, 74, 0.2)",
                                borderRadius: "6px",
                                color: "#16a34a",
                                cursor: "pointer",
                              }}
                              title="Confirm Appointment"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "30px",
                                height: "30px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "6px",
                                color: "#ef4444",
                                cursor: "pointer",
                              }}
                              title="Cancel Appointment"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => handleStatusChange(b.id, "completed")}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0.3rem 0.6rem",
                              background: "rgba(22, 163, 74, 0.08)",
                              border: "1px solid rgba(22, 163, 74, 0.15)",
                              borderRadius: "6px",
                              color: "#16a34a",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            title="Complete Appointment"
                          >
                            Mark Completed
                          </button>
                        )}
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                            border: "1px solid var(--color-stone-300)",
                            background: "var(--bg-secondary)",
                            cursor: "pointer",
                          }}
                          aria-label="Change status"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(b.id, b.fullName)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "30px",
                            height: "30px",
                            background: "rgba(239, 68, 68, 0.05)",
                            border: "1px solid rgba(239, 68, 68, 0.1)",
                            borderRadius: "6px",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                          title="Delete Booking"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .table-row-hover:hover {
          background-color: var(--color-stone-100) !important;
        }
      `}</style>
    </div>
  );
}
