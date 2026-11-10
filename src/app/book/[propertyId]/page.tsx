"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Property } from "@/types/property";
import { createBooking, getBookedSlots } from "@/app/actions/bookings";
import { TIME_SLOTS } from "@/lib/booking-slots";

interface PageProps {
  params: Promise<{ propertyId: string }>;
}

export default function BookViewingPage({ params }: PageProps) {
  // Unwrap params using React.use
  const { propertyId } = use(params);

  const [property, setProperty] = useState<Property | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  // Load which slots are already confirmed for this property on the chosen day.
  useEffect(() => {
    if (!preferredDate) return;
    let cancelled = false;
    getBookedSlots(propertyId, preferredDate).then((slots) => {
      if (cancelled) return;
      setBookedSlots(slots);
      setCheckingSlots(false);
      // Drop a selection that just became unavailable.
      setPreferredTime((current) => (slots.includes(current) ? "" : current));
    });
    return () => {
      cancelled = true;
    };
  }, [propertyId, preferredDate]);

  // Sync state with matching property in DB
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const prop = data.find((p: any) => p.id === propertyId);
          if (prop) {
            setProperty(prop);
          } else {
            notFound();
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredTime) {
      setError("Please choose a time slot.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await createBooking({
      propertyId,
      fullName,
      phone,
      email,
      preferredDate,
      preferredTimeSlot: preferredTime,
      message,
    });

    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Failed to submit viewing request.");
      if ("slotTaken" in res && res.slotTaken) {
        // Someone else got there first: refresh availability and clear the pick.
        setPreferredTime("");
        setBookedSlots(await getBookedSlots(propertyId, preferredDate));
      }
    }
  };

  if (!property) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)"
        }}
      >
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--color-stone-200)",
          borderTopColor: "#16a34a",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }


  // Get next 7 days for quick date choices (optional suggestion)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingBottom: "5rem" }}>
      {/* Banner / Title Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1c1917 0%, #14532d 100%)",
          padding: "8.5rem 1.5rem 4.5rem",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div className="container-custom">
          <span
            data-reveal="fade"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#4ade80",
            }}
          >
            Scheduling Flow
          </span>
          <h1
            data-split
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "2.75rem",
              fontWeight: 800,
              marginTop: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Book a Viewing
          </h1>
          <p
            data-reveal
            data-reveal-delay="0.15"
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
            }}
          >
            Schedule a physical walkthrough guide of your selected property with one
            of our regional consultants.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-custom section-padding" style={{ paddingTop: "3.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "start",
          }}
          className="booking-layout"
        >
          {/* Left Column: Selected Property Summary Card */}
          <div>
            <span data-reveal="fade" className="section-label">Selected Property</span>
            <h2 data-split className="section-title" style={{ marginBottom: "1.5rem", fontSize: "1.75rem" }}>
              Walkthrough Details
            </h2>

            <div
              data-reveal
              style={{
                background: "#fff",
                border: "1px solid var(--color-stone-200)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Cover image */}
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {property.featuredImage ? (
                  <img
                    src={property.featuredImage}
                    alt={property.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #e7e5e4, #d6d3d1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                      <path d="M3 21V9l9-7 9 7v12a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{ padding: "1.5rem" }}>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--accent-primary)",
                  }}
                >
                  {property.propertyType}
                </span>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: "0.25rem 0 0.5rem",
                  }}
                >
                  {property.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  📍 {property.location}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--color-stone-200)",
                    paddingTop: "1rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Pricing</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "var(--text-primary)", fontSize: "1.2rem" }}>
                    {formatPrice(property.price, property.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assistance alert banner */}
            <div
              style={{
                marginTop: "2rem",
                background: "rgba(5, 150, 105, 0.05)",
                border: "1px dashed var(--accent-primary)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>ℹ️</span>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Viewing Note:</span> Our agents host viewings seven days a week. Bookings are marked pending first and verified for slot availability before approval updates.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Booking Request Form */}
          <div
            data-reveal="right"
            style={{
              background: "#fff",
              border: "1px solid var(--color-stone-200)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem 1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(245, 158, 11, 0.1)",
                    color: "var(--accent-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  🕒
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Viewing Request Pending!
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.95rem", maxWidth: "320px", margin: "0 auto 1.5rem" }}>
                  Your viewing request for <span style={{ fontWeight: 600 }}>{property.title}</span> has been logged as <span style={{ fontWeight: 600, color: "var(--color-gold-600)" }}>PENDING</span>.
                </p>
                <div
                  style={{
                    background: "var(--bg-primary)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    textAlign: "left",
                    fontSize: "0.88rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    border: "1px solid var(--color-stone-200)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Name:</span> <span style={{ fontWeight: 600 }}>{fullName}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Preferred Date:</span> <span style={{ fontWeight: 600 }}>{preferredDate}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Preferred Time:</span> <span style={{ fontWeight: 600 }}>{preferredTime}</span>
                  </div>
                </div>
                <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                  <Link href="/properties" className="btn-secondary" style={{ flex: 1 }}>
                    Back to Listings
                  </Link>
                  <Link href="/" className="btn-primary" style={{ flex: 1 }}>
                    Go to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: "0 0 0.5rem",
                    borderBottom: "1px solid var(--color-stone-200)",
                    paddingBottom: "0.75rem",
                  }}
                >
                  Book Viewing Slot
                </h3>

                {/* Name */}
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 700 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="input-label">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={preferredDate}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      setCheckingSlots(Boolean(e.target.value));
                    }}
                    className="input-field"
                  />
                </div>

                {/* Preferred Time Slot */}
                <fieldset className="slot-picker" disabled={!preferredDate || checkingSlots}>
                  <legend className="input-label">Preferred Time Slot</legend>
                  {!preferredDate ? (
                    <p className="slot-picker__hint">Pick a date to see available times.</p>
                  ) : bookedSlots.length === TIME_SLOTS.length ? (
                    <p className="slot-picker__hint slot-picker__hint--full">
                      This day is fully booked for this property. Please choose another day.
                    </p>
                  ) : null}
                  <div className="slot-picker__grid" role="radiogroup" aria-label="Time slot">
                    {TIME_SLOTS.map((slot) => {
                      const booked = bookedSlots.includes(slot.value);
                      const selected = preferredTime === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={booked || !preferredDate || checkingSlots}
                          onClick={() => {
                            setPreferredTime(slot.value);
                            setError("");
                          }}
                          className={`slot${selected ? " is-selected" : ""}${booked ? " is-booked" : ""}`}
                        >
                          <span className="slot__label">{slot.label}</span>
                          <span className="slot__time">{slot.value}</span>
                          {booked && <span className="slot__badge">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Special Message Notes */}
                <div>
                  <label className="input-label">Special Notes / Message (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Seeking options close to schools, gated neighborhood focus..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    style={{ resize: "none" }}
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      color: "#dc2626",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", padding: "0.9rem", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Submitting..." : "Book Viewing Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .booking-layout {
          grid-template-columns: 1fr !important;
        }
        @media (min-width: 1024px) {
          .booking-layout {
            grid-template-columns: 1fr 1.2fr !important;
          }
        }
      `}</style>
    </div>
  );
}
