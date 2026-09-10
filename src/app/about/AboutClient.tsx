"use client";

import Link from "next/link";
import { companyInfo as staticCompanyInfo } from "@/data/company";

interface AboutClientProps {
  companyInfo: typeof staticCompanyInfo;
}

export default function AboutClient({ companyInfo }: AboutClientProps) {
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
            Get to Know Us
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
            About {companyInfo.name}
          </h1>
          <p
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
            }}
          >
            We are dedicated to redrawing the parameters of real estate matching across Kenya,
            built upon integrity and deep industry expertise.
          </p>
        </div>
      </div>

      {/* Story & History Section */}
      <div className="container-custom section-padding" style={{ paddingBottom: "3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "center",
          }}
          className="about-story-layout"
        >
          <div>
            <span className="section-label">Our Journey</span>
            <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
              Our Story & Foundation
            </h2>
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                marginBottom: "1.5rem",
              }}
            >
              {companyInfo.story}
            </p>
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-secondary)",
                lineHeight: 1.8,
              }}
            >
              {companyInfo.about}
            </p>
          </div>

          {/* Graphical decorative block */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              padding: "3rem 2rem",
              color: "#fff",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              minHeight: "220px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Background image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/images/rfcare1.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 0,
              }}
            />
            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(20,83,45,0.9) 0%, rgba(28,25,23,0.85) 100%)",
                zIndex: 1,
              }}
            />
            <div style={{ position: "relative", zIndex: 10, width: "100%" }}>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  color: "var(--color-gold-400)",
                }}
              >
                Our Mission Statement
              </h3>
              <p style={{ fontSize: "1.2rem", lineHeight: 1.8, fontStyle: "italic", fontWeight: 500, margin: 0 }}>
                &ldquo;{companyInfo.mission}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fafaf9 100%)", borderTop: "1px solid var(--color-stone-200)", borderBottom: "1px solid var(--color-stone-200)" }}>
        <div className="container-custom section-padding">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-label">Our Core Values</span>
            <h2 className="section-title">What Drives Us Every Day</h2>
            <p className="section-subtitle" style={{ textAlign: "center" }}>The principles that shape every decision we make and every client relationship we build.</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
            }}
            className="values-grid"
          >
            {companyInfo.values.map((val, index) => {
              const icons = {
                shield: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
                heart: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ),
                chart: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                ),
                lightning: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
              };
              const gradients = [
                { bg: "linear-gradient(135deg, #14532d, #16a34a)", light: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.15)" },
                { bg: "linear-gradient(135deg, #be123c, #e11d48)", light: "rgba(225,29,72,0.08)", border: "rgba(225,29,72,0.15)" },
                { bg: "linear-gradient(135deg, #1d4ed8, #3b82f6)", light: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
                { bg: "linear-gradient(135deg, #b45309, #f59e0b)", light: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
              ];
              const g = gradients[index % gradients.length];
              const icon = icons[val.icon as keyof typeof icons] || icons.lightning;
              return (
                <div
                  key={val.title}
                  className="value-card"
                  style={{
                    padding: "2rem",
                    background: "#fff",
                    border: `1px solid ${g.border}`,
                    borderRadius: "var(--radius-xl)",
                    textAlign: "left",
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: g.bg }} />
                  {/* Icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: g.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      boxShadow: `0 6px 20px ${g.border}`,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {val.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
                      {val.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Final Call to Action */}
      <div
        className="container-custom"
        style={{
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #14532d 0%, #15803d 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "4rem 2rem",
            textAlign: "center",
            color: "#fff",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
            Browse our listings or contact us to connect with one of our professional agents.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/properties" className="btn-gold" style={{ padding: "0.85rem 2rem" }}>
              Explore Listings
            </Link>
            <Link
              href="/contact"
              className="btn-secondary"
              style={{
                padding: "0.85rem 2rem",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .about-story-layout {
          grid-template-columns: 1fr !important;
        }
        .values-grid {
          grid-template-columns: 1fr !important;
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important;
        }
        @media (min-width: 640px) {
          .values-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .about-story-layout {
            grid-template-columns: 1fr 1fr !important;
          }
          .values-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
