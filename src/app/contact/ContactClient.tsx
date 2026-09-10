"use client";

import { useState } from "react";
import { companyInfo as staticCompanyInfo } from "@/data/company";

interface ContactClientProps {
  companyInfo: typeof staticCompanyInfo;
}

export default function ContactClient({ companyInfo }: ContactClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#4ade80",
            }}
          >
            Get in touch
          </span>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "2.75rem",
              fontWeight: 800,
              marginTop: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Contact {companyInfo.name}
          </h1>
          <p
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
            }}
          >
            Have any questions or need information about a property listing? Talk to us today.
          </p>
        </div>
      </div>

      {/* Main Content Form + Details */}
      <div className="container-custom section-padding" style={{ paddingTop: "3.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "start",
          }}
          className="contact-layout"
        >
          {/* Left Side: Contact Information Cards */}
          <div>
            <span className="section-label">Find Us</span>
            <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>
              Our Office &amp; Support Details
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "420px" }}>
              We&apos;re here to help. Reach us through any of the channels below and our team will respond promptly.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.25rem",
                marginBottom: "2.5rem",
              }}
              className="info-cards"
            >
              {/* Address card */}
              <div
                className="contact-info-card"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(22,163,74,0.12)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "linear-gradient(180deg, #14532d, #22c55e)", borderRadius: "3px 0 0 3px" }} />
                <div
                  style={{
                    flexShrink: 0,
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #14532d, #16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 6px 16px rgba(22,163,74,0.25)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: "0 0 0.25rem", fontSize: "1rem" }}>
                    Physical Address
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                    {companyInfo.address}
                  </p>
                </div>
              </div>

              {/* Call Card */}
              <div
                className="contact-info-card"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(59,130,246,0.12)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "linear-gradient(180deg, #1d4ed8, #3b82f6)", borderRadius: "3px 0 0 3px" }} />
                <div
                  style={{
                    flexShrink: 0,
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 6px 16px rgba(59,130,246,0.25)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.89 10.65 19.79 19.79 0 01.82 2a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: "0 0 0.25rem", fontSize: "1rem" }}>
                    Phone Lines
                  </p>
                  <a
                    href={`tel:${companyInfo.phone}`}
                    style={{ color: "var(--text-primary)", fontSize: "0.95rem", textDecoration: "none", fontWeight: 700, display: "block" }}
                  >
                    {companyInfo.phone}
                  </a>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: "0.2rem 0 0", lineHeight: 1.4 }}>
                    {companyInfo.workingHours}
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div
                className="contact-info-card"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(245,158,11,0.12)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: "linear-gradient(180deg, #b45309, #f59e0b)", borderRadius: "3px 0 0 3px" }} />
                <div
                  style={{
                    flexShrink: 0,
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #b45309, #f59e0b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 6px 16px rgba(245,158,11,0.25)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: "0 0 0.25rem", fontSize: "1rem" }}>
                    Email Support
                  </p>
                  <a
                    href={`mailto:${companyInfo.email}`}
                    style={{ color: "var(--accent-primary)", fontSize: "0.95rem", textDecoration: "none", fontWeight: 700, display: "block" }}
                  >
                    {companyInfo.email}
                  </a>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: "0.2rem 0 0" }}>
                    We respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Instant Services links (WhatsApp / Call) */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href={companyInfo.socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{
                  background: "linear-gradient(135deg, #128C7E, #25D366)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  boxShadow: "0 6px 20px rgba(37, 211, 102, 0.35)",
                  padding: "0.9rem 1.75rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Chat
              </a>
              <a
                href={`tel:${companyInfo.phone}`}
                className="btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.9rem 1.75rem",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.89 10.65 19.79 19.79 0 01.82 2a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Quick Call
              </a>
            </div>
          </div>

          {/* Right Side: Message Submission Form */}
          <div
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
                    background: "rgba(5,150,105,0.1)",
                    color: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Message Sent Successfully!
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.95rem", maxWidth: "300px", margin: "0 auto" }}>
                  Thank you for writing to us. One of our customer managers will read your message and respond shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setSubject("");
                    setMessage("");
                  }}
                  className="btn-primary"
                  style={{ marginTop: "1.5rem", width: "100%" }}
                >
                  Send Another Message
                </button>
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
                  Send Us A Message
                </h3>

                {error && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "#dc2626",
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>

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

                <div>
                  <label className="input-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +254 700 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Inquiry about general pricing, partnerships..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message details here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    style={{ resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", padding: "0.9rem", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Location Banner */}
        <div style={{ marginTop: "4rem" }}>
          <div
            style={{
              width: "100%",
              height: "200px",
              background: "linear-gradient(135deg, #1c1917 0%, #14532d 100%)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid rgba(22,163,74,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              padding: "2rem",
              flexWrap: "wrap",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                border: "2px solid rgba(34,197,94,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4ade80",
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ color: "#fff" }}>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0 0 0.35rem", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Our Location</p>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, margin: "0 0 0.25rem", fontSize: "1.3rem" }}>
                {companyInfo.address}
              </h4>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                {companyInfo.workingHours}
              </p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(companyInfo.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.7rem 1.5rem",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "var(--radius-full)",
                color: "#4ade80",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              Open in Maps
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .contact-layout {
          grid-template-columns: 1fr !important;
        }
        .info-cards {
          grid-template-columns: 1fr !important;
        }
        .contact-info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
        }
        @media (min-width: 640px) {
          .info-cards {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 1024px) {
          .contact-layout {
            grid-template-columns: 1.1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
