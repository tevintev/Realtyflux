"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import PropertyCard from "@/components/properties/PropertyCard";

function PropertiesListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedListingType, setSelectedListingType] = useState("");
  const [selectedMinPrice, setSelectedMinPrice] = useState("");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState("");
  const [sortBy, setSortBy] = useState("latest");

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

  // Sync state with URL params on load
  useEffect(() => {
    const type = searchParams.get("type");
    const loc = searchParams.get("location");
    const price = searchParams.get("price");
    const listType = searchParams.get("listingType");

    if (type) setSelectedType(type);
    if (loc) setSelectedLocation(loc);
    if (price) setSelectedMaxPrice(price);
    if (listType) setSelectedListingType(listType);
  }, [searchParams]);

  // Reset filters handler
  const handleReset = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedLocation("");
    setSelectedListingType("");
    setSelectedMinPrice("");
    setSelectedMaxPrice("");
    setSelectedBedrooms("");
    setSortBy("latest");
    router.replace("/properties");
  };

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

  // Filter properties logic
  const filteredProperties = propertiesList.filter((property) => {
    // Search query matches title, description, location
    if (
      searchQuery &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (selectedType && property.propertyType?.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }

    // Location filter
    if (
      selectedLocation &&
      !property.location.toLowerCase().includes(selectedLocation.toLowerCase())
    ) {
      return false;
    }

    // Listing Type (Buy/Rent)
    if (selectedListingType && property.listingType?.toLowerCase() !== selectedListingType.toLowerCase()) {
      return false;
    }

    // Min Price
    if (selectedMinPrice && property.price < parseFloat(selectedMinPrice)) {
      return false;
    }

    // Max Price
    if (selectedMaxPrice && property.price > parseFloat(selectedMaxPrice)) {
      return false;
    }

    // Bedrooms
    if (selectedBedrooms) {
      const beds = parseInt(selectedBedrooms);
      if (beds === 5) {
        if (property.bedrooms < 5) return false;
      } else {
        if (property.bedrooms !== beds) return false;
      }
    }

    return true;
  });

  // Sort logic
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    } else if (sortBy === "price-desc") {
      return b.price - a.price;
    } else if (sortBy === "size-desc") {
      return b.size - a.size;
    } else {
      // Default: latest created first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Unique list of locations for filtering
  const locations = ["Nairobi", "Mombasa", "Machakos", "Laikipia"];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Banner / Title Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1c1917 0%, #14532d 100%)",
          padding: "8rem 1.5rem 4rem",
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
            Explore Our Portfolio
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
            Available Properties
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
            Use our interactive filters to narrow down your search and discover the
            perfect property tailored to your demands.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-custom section-padding" style={{ paddingTop: "3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="properties-page-layout"
        >
          {/* Sidebar Filters */}
          <aside
            style={{
              background: "#fff",
              border: "1px solid var(--color-stone-200)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-stone-200)",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Filters
              </h3>
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-primary)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Search Keyword</label>
              <input
                type="text"
                placeholder="e.g. Villa, Penthouse, Karen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Listing Type */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Listing Type</label>
              <select
                value={selectedListingType}
                onChange={(e) => setSelectedListingType(e.target.value)}
                className="input-field"
                style={{ appearance: "auto" }}
              >
                <option value="">Any Type</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Property Category */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Property Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
                style={{ appearance: "auto" }}
              >
                <option value="">Any Category</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>

            {/* Location Selector */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="input-field"
                style={{ appearance: "auto" }}
              >
                <option value="">Any Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Ranges */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <label className="input-label">Min Price</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={selectedMinPrice}
                  onChange={(e) => setSelectedMinPrice(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Max Price</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={selectedMaxPrice}
                  onChange={(e) => setSelectedMaxPrice(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Bedrooms Selection */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="input-label">Bedrooms</label>
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="input-field"
                style={{ appearance: "auto" }}
              >
                <option value="">Any</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
                <option value="5">5+ Beds</option>
              </select>
            </div>
          </aside>

          {/* Listings Display Grid */}
          <div>
            {/* Top Toolbar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Showing{" "}
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {sortedProperties.length}
                </span>{" "}
                {sortedProperties.length === 1 ? "Property" : "Properties"}
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-stone-200)",
                    background: "#fff",
                    fontSize: "0.9rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="latest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size-desc">Size: Largest First</option>
                </select>
              </div>
            </div>

            {/* Properties Grid */}
            {sortedProperties.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  gap: "1.5rem",
                }}
                className="properties-grid"
                data-reveal-stagger
              >
                {sortedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-stone-200)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  No Properties Found
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    maxWidth: "350px",
                    margin: "0 auto 1.5rem",
                  }}
                >
                  We couldn&apos;t find any properties matching your current filter criteria.
                  Try resetting filters to start over.
                </p>
                <button onClick={handleReset} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .properties-page-layout {
          grid-template-columns: 1fr !important;
        }
        .properties-grid {
          grid-template-columns: 1fr !important;
        }
        @media (min-width: 640px) {
          .properties-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .properties-page-layout {
            grid-template-columns: 280px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading Properties...
        </div>
      }
    >
      <PropertiesListContent />
    </Suspense>
  );
}
