"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (propertyType) params.append("type", propertyType);
    if (priceRange) params.append("price", priceRange);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "-4rem auto 4rem",
        position: "relative",
        zIndex: 20,
        padding: "0 1.5rem",
      }}
    >
      <form
        onSubmit={handleSearch}
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderRadius: "var(--radius-xl)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-xl), var(--shadow-glow)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1.25rem",
        }}
        className="search-bar-form"
      >
        {/* Location Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Location
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-stone-200)",
                background: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Any Location</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Machakos">Machakos</option>
              <option value="Laikipia">Laikipia</option>
            </select>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Property Type
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-stone-200)",
                background: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Any Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Price Range Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Max Price
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-stone-200)",
                background: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">No Limit</option>
              <option value="150000">150,000 KES</option>
              <option value="15000000">15,000,000 KES</option>
              <option value="35000000">35,000,000 KES</option>
              <option value="65000000">65,000,000 KES</option>
              <option value="100000000">100,000,000 KES</option>
            </select>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              padding: "0.875rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search Properties
          </button>
        </div>
      </form>

      <style jsx global>{`
        @media (min-width: 768px) {
          .search-bar-form {
            grid-template-columns: 1fr 1fr 1fr 180px !important;
          }
        }
      `}</style>
    </div>
  );
}
