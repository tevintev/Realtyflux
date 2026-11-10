import Image from "next/image";
import Link from "next/link";
import { Property } from "@/types/property";
import { formatPrice } from "@/lib/format";
import { getRenderableImageSrc } from "@/lib/image-path";

interface PropertyCardProps {
  property: Property;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "on-sale": { label: "For Sale", className: "badge-on-sale" },
  sold: { label: "Sold", className: "badge-sold" },
  rented: { label: "Rented", className: "badge-rented" },
  pending: { label: "Pending", className: "badge-pending" },
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const statusInfo = statusConfig[property.status] || statusConfig["on-sale"];
  const displayImage =
    getRenderableImageSrc(property.featuredImage) ||
    getRenderableImageSrc(property.gallery[0]) ||
    "";

  return (
    <Link
      href={`/properties/${property.slug}`}
      data-tilt
      data-cursor="View"
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <article
        className="card"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Image */}
        <div
          className="card-media"
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "65%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #e7e5e4, #d6d3d1)",
          }}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #e7e5e4, #d6d3d1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              >
                <path d="M3 21V9l9-7 9 7v12a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            <span className={`badge ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
            {property.isFeatured && (
              <span className="badge badge-featured">
                ★ Featured
              </span>
            )}
          </div>

          {/* Listing type badge */}
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
            }}
          >
            <span
              style={{
                padding: "0.3rem 0.7rem",
                background: "rgba(28,25,23,0.75)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "6px",
              }}
            >
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>

          {/* Price overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "0.75rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem 0.85rem",
                background: "rgba(28,25,23,0.8)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {formatPrice(property.price, property.currency)}
              </span>
              {property.listingType === "rent" && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 400,
                  }}
                >
                  /mo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "1.25rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Property type */}
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent-primary)",
              marginBottom: "0.35rem",
            }}
          >
            {property.propertyType}
          </span>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.4rem",
              lineHeight: 1.3,
            }}
          >
            {property.title}
          </h3>

          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              marginBottom: "1rem",
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {property.location}
          </div>

          {/* Specs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid var(--color-stone-200)",
              marginTop: "auto",
            }}
          >
            {property.bedrooms > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7" />
                  <path d="M21 11H3V9a2 2 0 012-2h14a2 2 0 012 2v2z" />
                  <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                </svg>
                <span style={{ fontWeight: 600 }}>{property.bedrooms}</span>{" "}
                Beds
              </div>
            )}
            {property.bathrooms > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
                  <path d="M6 12V5a2 2 0 012-2h1" />
                </svg>
                <span style={{ fontWeight: 600 }}>{property.bathrooms}</span>{" "}
                Baths
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
              <span style={{ fontWeight: 600 }}>
                {property.size.toLocaleString()}
              </span>{" "}
              {property.sizeUnit}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
