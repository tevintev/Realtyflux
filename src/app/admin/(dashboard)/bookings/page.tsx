import { db } from "@/lib/db";
import BookingsTable from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Bookings
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
          Manage customer property viewing appointments and schedule statuses.
        </p>
      </div>

      <BookingsTable initialBookings={bookings} />
    </div>
  );
}
