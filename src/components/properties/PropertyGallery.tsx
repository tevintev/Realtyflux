"use client";

import Image from "next/image";
import { useState } from "react";
import { getRenderableMediaList } from "@/lib/image-path";

interface PropertyGalleryProps {
  images: string[];
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)$/i.test(url);
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const safeImages = getRenderableMediaList(images);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If no images provided
  if (safeImages.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          paddingBottom: "60%",
          background: "linear-gradient(135deg, #e7e5e4, #d6d3d1)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
        }}
      >
        No Images Available
      </div>
    );
  }

  const activeMedia = safeImages[activeImageIndex];
  const activeIsVideo = isVideoUrl(activeMedia);

  return (
    <div>
      {/* Active Big Image/Video Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "60%",
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          cursor: activeIsVideo ? "default" : "pointer",
          border: "1px solid var(--color-stone-200)",
          background: "linear-gradient(135deg, #f5f5f4, #e7e5e4)",
        }}
        onClick={() => !activeIsVideo && setIsLightboxOpen(true)}
      >
        {activeIsVideo ? (
          <video
            src={activeMedia}
            controls
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Image
            src={activeMedia}
            alt={`Property image ${activeImageIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            style={{ objectFit: "cover" }}
          />
        )}

        {/* Video badge */}
        {activeIsVideo && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              background: "rgba(28,25,23,0.8)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              padding: "0.3rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            VIDEO
          </div>
        )}

        {/* Image overlay caption */}
        {!activeIsVideo && (
          <div
            style={{
              position: "absolute",
              insetInline: 0,
              bottom: 0,
              padding: "1rem 1.25rem",
              background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "1rem",
            }}
          >
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Image {activeImageIndex + 1} of {safeImages.length}
            </span>
            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Click to expand
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {safeImages.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          {safeImages.map((img, i) => {
            const thumbIsVideo = isVideoUrl(img);
            return (
              <button
                key={`${img}-${i}`}
                onClick={() => setActiveImageIndex(i)}
                style={{
                  width: "80px",
                  height: "60px",
                  borderRadius: "var(--radius-sm)",
                  border:
                    activeImageIndex === i
                      ? "2px solid var(--accent-primary)"
                      : "2px solid transparent",
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  background: "transparent",
                  outline: "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {thumbIsVideo ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #1c1917, #292524)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      opacity: activeImageIndex === i ? 1 : 0.7,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      style={{
                        objectFit: "cover",
                        opacity: activeImageIndex === i ? 1 : 0.75,
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Zoom Overlay modal (images only) */}
      {isLightboxOpen && !activeIsVideo && (
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
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>

          {/* Large image */}
          <div
            style={{
              width: "100%",
              maxWidth: "1000px",
              height: "70vh",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(135deg, 
                hsl(${activeImageIndex * 60 + 120}, 30%, 80%), 
                hsl(${activeImageIndex * 60 + 180}, 25%, 70%))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={safeImages[activeImageIndex]}
              alt={`Property image ${activeImageIndex + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Slider controls inside lightbox */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              color: "#fff",
            }}
          >
            <button
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev === 0 ? safeImages.length - 1 : prev - 1
                )
              }
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              ◀
            </button>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1rem" }}>
              Image {activeImageIndex + 1} of {safeImages.length}
            </span>
            <button
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev === safeImages.length - 1 ? 0 : prev + 1
                )
              }
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
