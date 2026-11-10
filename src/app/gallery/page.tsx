"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { gsap, Flip, ScrollTrigger, useGSAP, motionEnabled, revealStart } from "@/lib/motion";
import { getRenderableMediaSrc, isOptimizable, isVideoFile } from "@/lib/image-path";
import Lightbox from "@/components/media/Lightbox";

interface GalleryItem {
  id: string;
  propertyTitle: string;
  propertySlug: string;
  propertyType: string;
  image: string;
  isVideo: boolean;
  index: number;
}

const filters = [
  { label: "All Photos", value: "all" },
  { label: "Houses", value: "house" },
  { label: "Apartments", value: "apartment" },
  { label: "Villas", value: "villa" },
  { label: "Commercial", value: "commercial" },
  { label: "Land", value: "land" },
  { label: "Townhouses", value: "townhouse" },
];

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const gridRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

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
  const allGalleryItems: GalleryItem[] = propertiesList.flatMap((property) =>
    (Array.isArray(property.gallery) ? property.gallery : []).flatMap(
      (value: string, index: number) => {
        const image = getRenderableMediaSrc(value);
        if (!image) return [];
        return [
          {
            id: `${property.id}-${index}`,
            propertyTitle: property.title,
            propertySlug: property.slug,
            propertyType: property.propertyType,
            image,
            isVideo: isVideoFile(image),
            index,
          },
        ];
      }
    )
  );

  const matchesFilter = (item: GalleryItem) =>
    selectedFilter === "all" || item.propertyType === selectedFilter;
  const filteredGalleryItems = allGalleryItems.filter(matchesFilter);

  const changeFilter = (value: string) => {
    if (value === selectedFilter) return;
    // Record where every tile is now, so Flip can animate them to their new
    // positions once React has applied the filter.
    if (motionEnabled() && gridRef.current) {
      flipState.current = Flip.getState(gridRef.current.querySelectorAll(".gallery-item"));
    }
    setSelectedFilter(value);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !gridRef.current) return;
    flipState.current = null;
    const items = gridRef.current.querySelectorAll<HTMLElement>(".gallery-item");
    // Any tile still waiting for its scroll reveal is shown immediately so
    // it doesn't fade in again mid-shuffle.
    items.forEach((el) => el.setAttribute("data-revealed", ""));
    gsap.set(items, { opacity: 1 });
    Flip.from(state, {
      targets: items,
      duration: 0.75,
      ease: "expo.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.6, delay: 0.25, ease: "expo.out" }
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4, ease: "power2.in" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [selectedFilter]);

  // Pill that slides behind the active filter button.
  const movePill = useCallback((immediate: boolean) => {
    const container = filtersRef.current;
    const pill = pillRef.current;
    const button = container?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!pill || !button) return;
    gsap.to(pill, {
      x: button.offsetLeft,
      y: button.offsetTop,
      width: button.offsetWidth,
      height: button.offsetHeight,
      opacity: 1,
      duration: immediate || !motionEnabled() ? 0 : 0.6,
      ease: "expo.out",
      overwrite: "auto",
    });
  }, []);

  useLayoutEffect(() => {
    movePill(false);
  }, [selectedFilter, movePill]);

  useEffect(() => {
    if (loading) return;
    movePill(true);
    const onResize = () => movePill(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loading, movePill]);

  // Tiles rise in as they scroll into view.
  useGSAP(
    () => {
      if (loading) return;
      const items = gridRef.current?.querySelectorAll<HTMLElement>(".gallery-item");
      if (!items || !motionEnabled()) {
        items?.forEach((el) => el.setAttribute("data-revealed", ""));
        return;
      }
      ScrollTrigger.batch(items, {
        start: revealStart,
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 60, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "expo.out",
              stagger: 0.07,
              clearProps: "transform",
              onComplete: () => batch.forEach((el) => el.setAttribute("data-revealed", "")),
            }
          ),
      });
    },
    { dependencies: [loading], scope: gridRef }
  );

  const playPreview = (e: React.MouseEvent<HTMLElement>, play: boolean) => {
    const video = e.currentTarget.querySelector("video");
    if (!video) return;
    if (play) video.play().catch(() => {});
    else {
      video.pause();
      video.currentTime = 0;
    }
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
              display: "inline-block",
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
            data-split
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
            data-reveal
            data-reveal-delay="0.15"
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
          ref={filtersRef}
          data-reveal
          className="gallery-filters"
        >
          <span ref={pillRef} className="gallery-filters__pill" aria-hidden="true" />
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeFilter(filter.value)}
              aria-pressed={selectedFilter === filter.value}
              className="gallery-filter"
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid. Every tile stays mounted (filtered-out ones are
            display:none) so Flip can animate them leaving and returning. */}
        <div ref={gridRef} className="gallery-grid">
          {allGalleryItems.map((item) => {
            const visibleIndex = filteredGalleryItems.indexOf(item);
            return (
              <div
                key={item.id}
                data-flip-id={item.id}
                data-intro
                onClick={() => setLightboxIndex(visibleIndex)}
                onMouseEnter={(e) => playPreview(e, true)}
                onMouseLeave={(e) => playPreview(e, false)}
                className="gallery-item"
                style={{ display: visibleIndex === -1 ? "none" : undefined }}
              >
                <div className="gallery-item__media">
                  {item.isVideo ? (
                    <video src={item.image} muted loop playsInline preload="metadata" />
                  ) : (
                    // Served through the image optimizer: resized, WebP, cached.
                    <Image
                      src={item.image}
                      alt={item.propertyTitle}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={!isOptimizable(item.image)}
                    />
                  )}
                  {item.isVideo && (
                    <span className="gallery-item__play" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </span>
                  )}
                  <span className="gallery-item__type">{item.propertyType}</span>
                  <span className="gallery-item__zoom" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
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
                    {item.isVideo ? "Video" : "Photo"} #{item.index + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGalleryItems.length === 0 && (
          <div data-reveal style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>No Images</h3>
            <p style={{ color: "var(--text-secondary)" }}>There are no photos under this category yet.</p>
          </div>
        )}
      </div>

      <Lightbox
        items={filteredGalleryItems.map((item) => ({
          src: item.image,
          alt: item.propertyTitle,
          caption: item.propertyTitle,
        }))}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        getOrigin={(i) =>
          gridRef.current?.querySelector(
            `[data-flip-id="${filteredGalleryItems[i]?.id}"] .gallery-item__media`
          ) ?? null
        }
      />

      <style jsx global>{`
        .gallery-filters {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }
        .gallery-filters__pill {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          opacity: 0;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          box-shadow: var(--shadow-md), var(--shadow-glow);
          pointer-events: none;
        }
        .gallery-filter {
          position: relative;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-full);
          border: none;
          font-family: "Outfit", sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.7);
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: color 0.3s ease, background 0.3s ease;
        }
        .gallery-filter:hover {
          color: var(--accent-primary);
        }
        .gallery-filter[aria-pressed="true"] {
          background: transparent;
          box-shadow: none;
          color: #fff;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .gallery-item {
          background: #fff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          cursor: zoom-in;
          border: 1px solid var(--color-stone-200);
          transition: box-shadow 0.4s ease;
        }
        .gallery-item:hover {
          box-shadow: var(--shadow-xl);
        }
        .gallery-item__media {
          position: relative;
          width: 100%;
          padding-bottom: 75%;
          overflow: hidden;
          background: var(--color-stone-100);
        }
        .gallery-item__media img,
        .gallery-item__media video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .gallery-item:hover .gallery-item__media img,
        .gallery-item:hover .gallery-item__media video {
          transform: scale(1.08);
        }
        .gallery-item__media::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(11, 15, 25, 0.55));
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .gallery-item:hover .gallery-item__media::after {
          opacity: 1;
        }
        .gallery-item__type {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 1;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          backdrop-filter: blur(4px);
        }
        .gallery-item__play {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(22, 163, 74, 0.9);
          color: #fff;
        }
        .gallery-item__zoom {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          margin: -27px 0 0 -27px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          color: #1c1917;
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .gallery-item:hover .gallery-item__zoom {
          opacity: 1;
          transform: scale(1);
        }
        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
