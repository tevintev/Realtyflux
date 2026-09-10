"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/data/properties";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyInquiryForm from "@/components/properties/PropertyInquiryForm";
import PropertyCard from "@/components/properties/PropertyCard";
import { Property } from "@/types/property";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "on-sale": { label: "For Sale", className: "badge-on-sale" },
  sold: { label: "Sold", className: "badge-sold" },
  rented: { label: "Rented", className: "badge-rented" },
  pending: { label: "Pending", className: "badge-pending" },
};

export default function PropertyDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const properties = data as Property[];
          const found = properties.find((p) => p.slug === slug);
          if (found) {
            setProperty(found);
            // Find related/similar properties (same type, excluding current one)
            const related = properties
              .filter((p) => p.propertyType === found.propertyType && p.id !== found.id)
              .slice(0, 3);
            setRelatedProperties(related);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{
          width: "40px",
          height: "40px",
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

  if (!property) {
    notFound();
  }

  const statusInfo = statusConfig[property.status] || statusConfig["on-sale"];
  const propertyImages =
    Array.isArray(property.gallery) && property.gallery.length > 0
      ? property.gallery
      : property.featuredImage
        ? [property.featuredImage]
        : [];


  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingBottom: "5rem" }}>
      {/* Top Banner / Header Breadcrumb */}
      <div
        style={{
          background: "linear-gradient(135deg, #1c1917 0%, #14532d 100%)",
          padding: "8.5rem 1.5rem 4.5rem",
          color: "#fff",
        }}
      >
        <div className="container-custom">
          {/* Breadcrumb navigation links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "1rem",
            }}
          >
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/properties" style={{ color: "inherit", textDecoration: "none" }}>
              Properties
            </Link>
            <span>/</span>
            <span style={{ color: "#4ade80" }}>{property.title}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1.5rem",
            }}
          >
            <div>
              {/* Badges */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
                {property.isFeatured && <span className="badge badge-featured">★ Featured</span>}
              </div>
              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {property.title}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {property.address}
              </p>
            </div>

            {/* Price Box */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                padding: "1rem 1.5rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(255,255,255,0.15)",
                textAlign: "right",
              }}
              className="price-container"
            >
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                Price Guide
              </span>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-gold-400)",
                  lineHeight: 1.1,
                }}
              >
                {formatPrice(property.price, property.currency)}
              </div>
              {property.listingType === "rent" && (
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>/ month</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container-custom section-padding" style={{ paddingTop: "3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2.5rem",
            alignItems: "start",
          }}
          className="details-layout"
        >
          {/* Left Column: Media + Specs + Details */}
          <div>
            {/* Gallery component */}
            <PropertyGallery images={propertyImages} />

            {/* Specifications Grid */}
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--color-stone-200)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                margin: "2rem 0",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
              }}
              className="specs-grid"
            >
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Type</span>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                  {property.propertyType.toUpperCase()}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Size</span>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                  {property.size.toLocaleString()} {property.sizeUnit}
                </p>
              </div>
              {property.bedrooms > 0 && (
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Bedrooms</span>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                    {property.bedrooms} Beds
                  </p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Bathrooms</span>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                    {property.bathrooms} Baths
                  </p>
                </div>
              )}
              {property.yearBuilt && (
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Year Built</span>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>
                    {property.yearBuilt}
                  </p>
                </div>
              )}
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Listing Status</span>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.1rem", color: "var(--accent-primary)" }}>
                  {property.status === "on-sale" ? "ACTIVE" : property.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                Property Description
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "1.05rem" }}>
                {property.description}
              </p>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                  Amenities & Facilities
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                  }}
                  className="amenities-grid"
                >
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        background: "#fff",
                        border: "1px solid var(--color-stone-200)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.95rem",
                      }}
                    >
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inquiries & Actions Panel */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Booking Viewing Action Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #14532d 0%, #15803d 100%)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem 1.5rem",
                color: "#fff",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Schedule a Visit
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Want to see this property in person? Book a private physical viewing request at a date/time that fits you.
              </p>
              <Link
                href={`/book/${property.id}`}
                className="btn-gold"
                style={{ width: "100%", padding: "0.85rem", display: "inline-flex" }}
              >
                Book a Viewing Request
              </Link>
            </div>

            {/* General Inquiry Form */}
            <PropertyInquiryForm propertyTitle={property.title} propertyId={property.id} />

            {/* Agent Info Panel */}
            {property.agent && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-stone-200)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-blue-500), var(--color-gold-400))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: "1.2rem",
                  }}
                >
                  {property.agent[0]}
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Assigned Agent</span>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: "1.05rem" }}>
                    {property.agent}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Similar / Related Properties */}
        {relatedProperties.length > 0 && (
          <div style={{ marginTop: "5rem", borderTop: "1px solid var(--color-stone-200)", paddingTop: "4rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "3rem" }}>
              <span className="section-label">Similar Listings</span>
              <h2 className="section-title">Related Properties</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
                gap: "1.5rem",
              }}
              className="related-grid"
            >
              {relatedProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .details-layout {
          grid-template-columns: 1fr !important;
        }
        .specs-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .amenities-grid {
          grid-template-columns: 1fr !important;
        }
        .related-grid {
          grid-template-columns: 1fr !important;
        }
        @media (min-width: 640px) {
          .amenities-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .details-layout {
            grid-template-columns: 1fr 340px !important;
          }
          .specs-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .price-container {
            text-align: right !important;
          }
          .related-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
