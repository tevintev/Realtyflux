"use client";

import Link from "next/link";
import { companyInfo as staticCompanyInfo } from "@/data/company";
import StatementSection from "@/components/sections/StatementSection";

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
            Get to Know Us
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
            About {companyInfo.name}
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
          <div data-reveal="left">
            <span data-reveal="fade" className="section-label">Our Journey</span>
            <h2 data-split className="section-title" style={{ marginBottom: "1.25rem" }}>
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

          {/* Photo (the mission statement has its own pinned section below) */}
          <div
            data-img-reveal
            style={{
              position: "relative",
              minHeight: "360px",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/rfcare1.jpg"
              alt="A family standing outside their new home"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "75% 50%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mission statement, pinned while its words light up */}
      <StatementSection label="Our Mission" text={companyInfo.mission} />

      {/* Values Section */}
      <div style={{ background: "#fff", borderTop: "1px solid var(--color-stone-200)", borderBottom: "1px solid var(--color-stone-200)" }}>
        <div className="container-custom section-padding">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "3.5rem" }}>
            <span data-reveal="fade" className="section-label">Our Core Values</span>
            <h2 data-split className="section-title">What Drives Us Every Day</h2>
            <p data-reveal className="section-subtitle" style={{ textAlign: "center" }}>The principles that shape every decision we make and every client relationship we build.</p>
          </div>

          <div className="values-grid" data-reveal-stagger>
            {companyInfo.values.map((val, index) => (
              <div key={val.title} className="value-item">
                <span className="value-item__num">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="value-item__title">{val.title}</h3>
                <p className="value-item__text">{val.description}</p>
              </div>
            ))}
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
          data-reveal="scale"
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
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0 5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .value-item {
          position: relative;
          padding: 2rem 0 2.25rem;
          border-top: 1px solid var(--color-stone-300);
        }
        .value-item::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 0;
          width: 3rem;
          height: 2px;
          background: #b8892c;
          transition: width 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .value-item:hover::before {
          width: 100%;
        }
        .value-item__num {
          display: block;
          margin-bottom: 1rem;
          font-family: "Outfit", sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #9a7220;
        }
        .value-item__title {
          margin: 0 0 0.6rem;
          font-family: "Outfit", sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .value-item__text {
          margin: 0;
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text-secondary);
        }
        @media (min-width: 768px) {
          .values-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .about-story-layout {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
