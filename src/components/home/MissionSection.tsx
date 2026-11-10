"use client";

import { useRef } from "react";
import { companyInfo as staticCompanyInfo } from "@/data/company";
import { gsap, useGSAP, motionEnabled } from "@/lib/motion";

const iconMap: Record<string, React.ReactNode> = {
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  heart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  chart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  lightning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

interface MissionSectionProps {
  companyInfo?: typeof staticCompanyInfo;
}

export default function MissionSection({ companyInfo: passedCompanyInfo }: MissionSectionProps = {}) {
  const companyInfo = passedCompanyInfo || staticCompanyInfo;
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  // The dark background starts as an inset rounded card and opens out to
  // full width as the section scrolls into view.
  useGSAP(
    () => {
      if (!motionEnabled()) return;
      gsap.fromTo(
        mediaRef.current,
        { clipPath: "inset(7% 5% 7% 5% round 36px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top 15%",
            scrub: 0.5,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div ref={mediaRef} style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      {/* Background Image (oversized so the parallax drift never shows an edge) */}
      <div
        data-parallax="12"
        style={{
          position: "absolute",
          inset: "-15% 0",
          backgroundImage: "url('/images/rfcare1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      {/* Dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(11,15,25,0.92) 0%, rgba(11,15,25,0.85) 50%, rgba(20,83,45,0.88) 100%)",
          zIndex: 1,
        }}
      />
      </div>

      <div className="container-custom section-padding" style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="mission-grid"
        >
          {/* Text side */}
          <div>
            <span
              data-reveal="fade"
              className="section-label"
              style={{ color: "#4ade80" }}
            >
              Why We Care
            </span>
            <h2
              data-split
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "1.25rem",
                lineHeight: 1.15,
              }}
            >
              Building Trust,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                One Property at a Time
              </span>
            </h2>
            <p
              data-scrub-words
              style={{
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "rgba(240,238,236,0.95)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "520px",
              }}
            >
              {companyInfo.about}
            </p>
          </div>

          {/* Values side */}
          <div
            data-reveal-stagger="sides"
            className="mission-values"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            {companyInfo.values.map((value, i) => (
              <div
                key={i}
                className="mission-value-card"
                style={{
                  padding: "1.75rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  // Offset with margin, not transform, so the stagger reveal can animate transform freely.
                  marginTop: i % 2 === 1 ? "1.5rem" : 0,
                  marginBottom: i % 2 === 1 ? "-1.5rem" : 0,
                  transition: "background 0.3s ease, border-color 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(22, 163, 74, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    color: "#4ade80",
                  }}
                >
                  {iconMap[value.icon] || iconMap.shield}
                </div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(214,211,209,0.7)",
                    lineHeight: 1.6,
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mission-grid > :global(*) {
          min-width: 0;
        }
        /* Phones: one card per row, no staggered offset. */
        @media (max-width: 559px) {
          .mission-values {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .mission-value-card {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
        }
        @media (min-width: 1024px) {
          .mission-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
