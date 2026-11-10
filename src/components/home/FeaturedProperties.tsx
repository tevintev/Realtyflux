"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PropertyCard from "@/components/properties/PropertyCard";

export default function FeaturedProperties() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const feat = data.filter((p: any) => p.isFeatured).slice(0, 6);
          setFeatured(feat);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || featured.length === 0) {
    return null;
  }


  return (
    <section className="section-padding" style={{ background: "var(--bg-primary)" }}>
      <div className="container-custom">
        {/* Section header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "3.5rem",
          }}
        >
          <span data-reveal="fade" className="section-label">Curated For You</span>
          <h2 data-split className="section-title">Featured Properties</h2>
          <p data-reveal className="section-subtitle" style={{ textAlign: "center" }}>
            Hand-picked properties that offer exceptional value, prime locations,
            and outstanding quality.
          </p>
        </div>

        {/* Property grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
            gap: "1.5rem",
          }}
          className="property-grid"
          data-reveal-stagger="sides"
        >
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View all CTA */}
        <div
          data-reveal
          style={{
            textAlign: "center",
            marginTop: "3rem",
          }}
        >
          <Link href="/properties" data-magnetic className="btn-secondary">
            View All Properties
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .property-grid {
          grid-template-columns: 1fr !important;
        }
        @media (min-width: 640px) {
          .property-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .property-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
