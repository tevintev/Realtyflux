import { db } from "@/lib/db";
import {
  Building,
  Calendar,
  Mail,
  Star,
  Clock,
  ArrowUpRight,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { dateKey, formatSlot, slotForTime } from "@/lib/booking-slots";
import BookingsCalendar, { type CalendarBooking } from "@/components/admin/BookingsCalendar";

// Force dynamic rendering to ensure stats are always up to date
export const dynamic = "force-dynamic";

// The calendar shows everything from three months back onward.
function calendarWindowStart() {
  return new Date(Date.now() - 92 * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  // Query database in parallel for performance
  const [
    totalProperties,
    featuredProperties,
    totalBookings,
    pendingBookings,
    totalMessages,
    unreadMessages,
    recentBookings,
    recentMessages,
    calendarBookings,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { isFeatured: true } }),
    db.booking.count(),
    db.booking.count({ where: { status: "pending" } }),
    db.message.count(),
    db.message.count({ where: { isRead: false } }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { property: true },
    }),
    db.message.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.booking.findMany({
      where: {
        status: { not: "cancelled" },
        preferredDate: { gte: calendarWindowStart() },
      },
      orderBy: { preferredDate: "asc" },
      include: { property: { select: { title: true, slug: true } } },
    }),
  ]);

  // The business runs on Nairobi time; use it for "today" on the calendar.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
  const calendarData: CalendarBooking[] = calendarBookings.map((b) => ({
    id: b.id,
    date: dateKey(b.preferredDate),
    slot: formatSlot(b.preferredTime),
    slotOrder: slotForTime(b.preferredTime)?.hour ?? b.preferredTime.getUTCHours(),
    fullName: b.fullName,
    phone: b.phone,
    propertyTitle: b.property.title,
    propertySlug: b.property.slug,
    status: b.status,
  }));

  const stats = [
    {
      title: "Total Listings",
      value: totalProperties,
      description: `${featuredProperties} Featured Listings`,
      icon: Building,
      color: "#0d9488",
      bgColor: "rgba(13,148,136,0.08)",
      href: "/admin/properties",
    },
    {
      title: "Bookings",
      value: totalBookings,
      description: `${pendingBookings} Pending Actions`,
      icon: Calendar,
      color: "#16a34a",
      bgColor: "rgba(22,163,74,0.08)",
      href: "/admin/bookings",
    },
    {
      title: "Messages",
      value: totalMessages,
      description: `${unreadMessages} Unread Inquiries`,
      icon: Mail,
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.08)",
      href: "/admin/messages",
    },
    {
      title: "Engagement",
      value: totalBookings + totalMessages,
      description: "Total Client Interactions",
      icon: TrendingUp,
      color: "#8b5cf6",
      bgColor: "rgba(139,92,246,0.08)",
      href: "#",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Dashboard Welcome Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Overview
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0" }}>
          Here is what's happening with Realty Flux listings and clients.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="card"
              style={{
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {stat.title}
                </span>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: stat.bgColor,
                    color: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    margin: "0.5rem 0 0",
                  }}
                >
                  {stat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Calendar of booked viewing days */}
      <BookingsCalendar bookings={calendarData} today={today} />

      {/* Two-column layout for Bookings & Messages */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
        className="dashboard-columns"
      >
        {/* Recent Bookings Panel */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--color-stone-200)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={18} style={{ color: "#16a34a" }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Viewings</h2>
            </div>
            <Link
              href="/admin/bookings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#16a34a",
                textDecoration: "none",
              }}
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentBookings.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                No viewing bookings found.
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "var(--bg-primary)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.92rem" }}>
                      {booking.fullName}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {booking.property.title} • {new Date(booking.preferredDate).toLocaleDateString([], { timeZone: "UTC" })} • {formatSlot(booking.preferredTime)}
                    </p>
                  </div>
                  <span
                    className={`badge badge-${booking.status}`}
                    style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                  >
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages Panel */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--color-stone-200)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare size={18} style={{ color: "#f59e0b" }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Messages</h2>
            </div>
            <Link
              href="/admin/messages"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#16a34a",
                textDecoration: "none",
              }}
            >
              Inbox <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentMessages.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                No messages found.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: msg.isRead ? "var(--bg-primary)" : "rgba(22,163,74,0.03)",
                    borderLeft: msg.isRead ? "none" : "3px solid #16a34a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      maxWidth: "80%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.92rem" }}>{msg.name}</p>
                      {!msg.isRead && (
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#16a34a",
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      {msg.subject}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {msg.message}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.25rem",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

