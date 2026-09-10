"use client";

import { useState, useEffect } from "react";

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from database API
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPropertiesList(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Extract all gallery items from all properties
  const allGalleryItems = propertiesList.flatMap((property) =>
    property.gallery.map((image: string, index: number) => ({
      id: `${property.id}-${index}`,
      propertyTitle: property.title,
      propertySlug: property.slug,
      propertyType: property.propertyType,
      image,
      index,
    }))
  );

  // Filter gallery items by property type
  const filteredGalleryItems = allGalleryItems.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.propertyType === selectedFilter;
  });

  const filters = [
    { label: "All Photos", value: "all" },
    { label: "Houses", value: "house" },
    { label: "Apartments", value: "apartment" },
    { label: "Villas", value: "villa" },
    { label: "Commercial", value: "commercial" },
    { label: "Land", value: "land" },
    { label: "Townhouses", value: "townhouse" },
  ];

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
            Visual Experience
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
            Media Showcase Gallery
          </h1>
          <p
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
            }}
          >
            Browse high-definition photography of our premium properties, gated
            communities, commercial hubs, and land plots.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-custom section-padding" style={{ paddingTop: "3.5rem" }}>
        {/* Category Filters row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "3rem",
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                background: selectedFilter === filter.value ? "var(--accent-primary)" : "#fff",
                color: selectedFilter === filter.value ? "#fff" : "var(--text-secondary)",
                boxShadow: selectedFilter === filter.value ? "var(--shadow-md)" : "var(--shadow-sm)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredGalleryItems.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: "1.5rem",
            }}
            className="gallery-grid"
          >
            {filteredGalleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveImage(item.id)}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                  border: "1px solid var(--color-stone-200)",
                  transition: "transform 0.3s ease",
                }}
                className="gallery-item-card"
              >
                {/* Visual rendering of real property images */}
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "75%",
                    position: "relative",
                    overflow: "hidden",
                    background: "var(--color-stone-100)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.propertyTitle}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(0, 0, 0, 0.65)",
                      color: "#fff",
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {item.propertyType}
                  </span>
                </div>

                {/* Details Footer inside card */}
                <div style={{ padding: "1rem" }}>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.propertyTitle}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Photo #{item.index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>No Images</h3>
            <p style={{ color: "var(--text-secondary)" }}>There are no photos under this category yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Overlay */}
      {activeImage && (() => {
        const activeItem = allGalleryItems.find((x) => x.id === activeImage);
        if (!activeItem) return null;
        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
            }}
            onClick={() => setActiveImage(null)}
          >
            {/* Close Button */}
            <button
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>

            {/* Display Zoom Box */}
            <div
              style={{
                width: "100%",
                maxWidth: "900px",
                height: "65vh",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                position: "relative",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={activeItem.image}
                alt={activeItem.propertyTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            <div style={{ marginTop: "1.5rem", textAlign: "center", color: "#fff" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.25rem", margin: 0 }}>
                {activeItem.propertyTitle}
              </h3>
              <p style={{ color: "#a8a29e", margin: "0.25rem 0 0" }}>Category: {activeItem.propertyType.toUpperCase()}</p>
            </div>
          </div>
        );
      })()}


      <style jsx global>{`
        .gallery-grid {
          grid-template-columns: 1fr !important;
        }
        .gallery-item-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md) !important;
        }
        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
