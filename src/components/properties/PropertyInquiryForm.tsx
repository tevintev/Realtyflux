"use client";

import { useState } from "react";

interface PropertyInquiryFormProps {
  propertyTitle: string;
  propertyId: string;
}

export default function PropertyInquiryForm({ propertyTitle, propertyId }: PropertyInquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please send me more details.`);
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
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: `Inquiry: ${propertyTitle}`,
          message,
          propertyId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to send inquiry. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-stone-200)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(5, 150, 105, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: "var(--accent-primary)",
            fontSize: "1.5rem",
          }}
        >
          ✓
        </div>
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Inquiry Sent Successfully!
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          Thank you, <span style={{ fontWeight: 600 }}>{name}</span>. One of our property
          agents will contact you back via <span style={{ fontWeight: 600 }}>{email}</span> or
          phone within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setPhone("");
            setMessage(`Hi, I'm interested in "${propertyTitle}". Please send me more details.`);
          }}
          className="btn-secondary"
          style={{ marginTop: "1.5rem", width: "100%" }}
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--color-stone-200)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1.2rem",
          fontWeight: 700,
          marginBottom: "1rem",
          borderBottom: "1px solid var(--color-stone-200)",
          paddingBottom: "0.75rem",
        }}
      >
        Inquire About Property
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#dc2626",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Full Name */}
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

        {/* Email */}
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

        {/* Phone */}
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

        {/* Message */}
        <div>
          <label className="input-label">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field"
            style={{ resize: "none" }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "0.85rem", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Sending..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
