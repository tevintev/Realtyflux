"use client";

import { companyInfo as staticCompanyInfo } from "@/data/company";

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
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
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
      {/* Dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(11,15,25,0.92) 0%, rgba(11,15,25,0.85) 50%, rgba(20,83,45,0.88) 100%)",
          zIndex: 1,
        }}
      />

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
              className="section-label"
              style={{ color: "#4ade80" }}
            >
              Why We Care
            </span>
            <h2
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
              style={{
                fontSize: "1.05rem",
                color: "rgba(214,211,209,0.85)",
                lineHeight: 1.8,
                marginBottom: "2rem",
                maxWidth: "520px",
              }}
            >
              {companyInfo.about}
            </p>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.25rem",
              }}
            >
              {[
                {
                  value: companyInfo.stats.propertiesSold,
                  label: "Properties Sold",
                  suffix: "+",
                },
                {
                  value: companyInfo.stats.happyClients,
                  label: "Happy Clients",
                  suffix: "+",
                },
                {
                  value: companyInfo.stats.yearsExperience,
                  label: "Years Experience",
                  suffix: "+",
                },
                {
                  value: companyInfo.stats.activeListings,
                  label: "Active Listings",
                  suffix: "+",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: "1.25rem",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "#4ade80",
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(214,211,209,0.7)",
                      fontWeight: 500,
                      marginTop: "0.2rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            {companyInfo.values.map((value, i) => (
              <div
                key={i}
                style={{
                  padding: "1.75rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transform: i % 2 === 1 ? "translateY(1.5rem)" : "none",
                  transition: "all 0.3s ease",
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
        @media (min-width: 1024px) {
          .mission-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
