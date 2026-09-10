"use client";

import Link from "next/link";
import { propertyCategories } from "@/data/properties";

export default function CategoriesSection() {
  return (
    <section
      className="section-padding"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="container-custom">
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "3.5rem",
          }}
        >
          <span className="section-label">Browse By Type</span>
          <h2 className="section-title">Property Categories</h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            Whether you&apos;re looking for a family home, investment property, or
            commercial space — we have you covered.
          </p>
        </div>

        {/* Categories grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.25rem",
          }}
          className="categories-grid"
        >
          {propertyCategories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/properties?type=${category.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="card category-card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  borderRadius: "var(--radius-lg)",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Background Image */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url('${category.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  className="category-card-bg"
                />

                {/* Dark overlay gradient */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)",
                    zIndex: 1,
                  }}
                />

                {/* Content overlay */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "1.5rem",
                  }}
                >
                  {/* Name */}
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.75)",
                      marginBottom: "0.6rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {category.description}
                  </p>

                  {/* Count badge */}
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#fff",
                      background: "rgba(37, 99, 235, 0.7)",
                      backdropFilter: "blur(6px)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {category.count}{" "}
                    {category.count === 1 ? "Listing" : "Listings"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .categories-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .category-card:hover .category-card-bg {
          transform: scale(1.08);
        }
        @media (min-width: 640px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
