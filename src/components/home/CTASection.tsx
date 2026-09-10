"use client";

import Link from "next/link";
import { companyInfo as staticCompanyInfo } from "@/data/company";

interface CTASectionProps {
  companyInfo?: typeof staticCompanyInfo;
}

export default function CTASection({ companyInfo: passedCompanyInfo }: CTASectionProps = {}) {
  const companyInfo = passedCompanyInfo || staticCompanyInfo;
  const logo = companyInfo?.logo;

  return (
    <section
      style={{
        position: "relative",
        padding: "6rem 1.5rem",
        overflow: "hidden",
        background: "linear-gradient(135deg, #064e3b 0%, #14532d 50%, #15803d 100%)",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="container-custom"
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {/* Logo / Brand badge */}
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem",
            padding: logo ? "14px" : "0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt={`${companyInfo.name} Logo`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          )}
        </div>

        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Ready to Find Your
          <br />
          <span style={{ color: "var(--color-gold-400)" }}>Dream Property?</span>
        </h2>

        <p
          style={{
            fontSize: "1.1rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "550px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Book a free property viewing today and let our expert agents guide you
          to the perfect home. No obligations, no pressure — just possibilities.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <Link
            href="/properties"
            className="btn-gold"
            style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book a Viewing
          </Link>
          <Link
            href="/contact"
            className="btn-secondary"
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.85)",
              borderColor: "rgba(255,255,255,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#fff";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            }}
          >
            Talk to an Agent
          </Link>
        </div>
      </div>
    </section>
  );
}
