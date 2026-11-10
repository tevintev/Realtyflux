"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { getRenderableMediaList, isVideoFile } from "@/lib/image-path";
import { gsap, useGSAP, motionEnabled } from "@/lib/motion";
import Lightbox from "@/components/media/Lightbox";

interface PropertyGalleryProps {
  images: string[];
}

function StageMedia({ src, index, className }: { src: string; index: number; className?: string }) {
  return isVideoFile(src) ? (
    <video
      src={src}
      controls
      playsInline
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Image
      src={src}
      alt={`Property image ${index + 1}`}
      fill
      sizes="(max-width: 1024px) 100vw, 70vw"
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const safeImages = getRenderableMediaList(images);
  const [active, setActive] = useState(0);
  // The outgoing slide stays mounted underneath until the incoming one has
  // finished wiping over it.
  const [previous, setPrevious] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const directionRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const lastAnimatedIndex = useRef(active);
  const pointerStartX = useRef<number | null>(null);

  const goTo = (next: number) => {
    if (next === active || safeImages.length === 0) return;
    const wrapped = (next + safeImages.length) % safeImages.length;
    directionRef.current = next > active ? 1 : -1;
    setPrevious(active);
    setActive(wrapped);
  };

  useGSAP(
    () => {
      if (lastAnimatedIndex.current === active) return;
      lastAnimatedIndex.current = active;

      const strip = thumbsRef.current;
      const thumb = strip?.children[active] as HTMLElement | undefined;
      if (strip && thumb) {
        strip.scrollTo({
          left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2,
          behavior: "smooth",
        });
      }

      if (!motionEnabled()) {
        setPrevious(null);
        return;
      }
      const incoming = stageRef.current!.querySelector<HTMLElement>(".gallery-slide.is-active");
      if (!incoming) return;
      const fromClip =
        directionRef.current === 1 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
      gsap
        .timeline({ onComplete: () => setPrevious(null) })
        .fromTo(
          incoming,
          { clipPath: fromClip },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut", clearProps: "clipPath" }
        )
        .fromTo(
          incoming.firstElementChild,
          { scale: 1.18, xPercent: directionRef.current * 6 },
          { scale: 1, xPercent: 0, duration: 1.3, ease: "expo.out", clearProps: "transform" },
          0
        )
        .to(
          ".gallery-slide.is-previous > *",
          { xPercent: directionRef.current * -12, duration: 0.9, ease: "expo.inOut" },
          0
        );
    },
    { dependencies: [active], scope: stageRef }
  );

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

  const activeMedia = safeImages[active];
  const activeIsVideo = isVideoFile(activeMedia);

  return (
    <div>
      {/* Active Big Image/Video Container */}
      <div
        ref={stageRef}
        data-img-reveal
        className="gallery-stage"
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "60%",
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          cursor: activeIsVideo ? "default" : "zoom-in",
          border: "1px solid var(--color-stone-200)",
          background: "linear-gradient(135deg, #f5f5f4, #e7e5e4)",
        }}
        onClick={() => !activeIsVideo && setLightboxIndex(active)}
        onPointerDown={(e) => {
          pointerStartX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (pointerStartX.current === null) return;
          const dx = e.clientX - pointerStartX.current;
          pointerStartX.current = null;
          if (Math.abs(dx) > 50 && safeImages.length > 1) goTo(active + (dx < 0 ? 1 : -1));
        }}
      >
        {previous !== null && previous !== active && (
          <div className="gallery-slide is-previous" key={`prev-${previous}`}>
            <StageMedia src={safeImages[previous]} index={previous} />
          </div>
        )}
        <div className="gallery-slide is-active" key={`active-${active}`}>
          <StageMedia src={activeMedia} index={active} />
        </div>

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

        {/* Prev / next */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-stage__nav gallery-stage__nav--prev"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active - 1);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="gallery-stage__nav gallery-stage__nav--next"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active + 1);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Image overlay caption */}
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            zIndex: 5,
            padding: "1rem 1.25rem",
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "1rem",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {activeIsVideo ? "Video" : "Image"} {active + 1} of {safeImages.length}
          </span>
          {!activeIsVideo && (
            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Click to expand</span>
          )}
        </div>
      </div>

      {/* Thumbnails list */}
      {safeImages.length > 1 && (
        <div
          ref={thumbsRef}
          data-reveal-stagger
          style={{
            position: "relative",
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          {safeImages.map((img, i) => {
            const thumbIsVideo = isVideoFile(img);
            const isActive = active === i;
            return (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${thumbIsVideo ? "video" : "image"} ${i + 1}`}
                aria-current={isActive}
                className={`gallery-thumb${isActive ? " is-active" : ""}`}
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
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                ) : (
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill sizes="80px" style={{ objectFit: "cover" }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      <Lightbox
        items={safeImages.map((src, i) => ({ src, alt: `Property image ${i + 1}` }))}
        index={lightboxIndex}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          goTo(i);
        }}
        onClose={() => setLightboxIndex(null)}
        getOrigin={() => stageRef.current}
      />

      <style jsx global>{`
        .gallery-slide {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .gallery-slide.is-active {
          z-index: 1;
        }
        .gallery-stage__nav {
          position: absolute;
          top: 50%;
          z-index: 6;
          width: 44px;
          height: 44px;
          margin-top: -22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          color: #1c1917;
          box-shadow: var(--shadow-md);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1),
            background 0.25s ease, color 0.25s ease;
        }
        .gallery-stage__nav--prev {
          left: 1rem;
          transform: translateX(-8px);
        }
        .gallery-stage__nav--next {
          right: 1rem;
          transform: translateX(8px);
        }
        .gallery-stage:hover .gallery-stage__nav,
        .gallery-stage__nav:focus-visible {
          opacity: 1;
          transform: none;
        }
        .gallery-stage__nav:hover {
          background: var(--accent-primary);
          color: #fff;
        }
        @media (hover: none) {
          .gallery-stage__nav {
            opacity: 1;
            transform: none;
          }
        }
        .gallery-thumb {
          position: relative;
          width: 80px;
          height: 60px;
          flex-shrink: 0;
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          background: transparent;
          border: 2px solid transparent;
          border-radius: var(--radius-sm);
          outline: none;
          opacity: 0.6;
          transition: opacity 0.3s ease, border-color 0.3s ease;
        }
        .gallery-thumb:hover,
        .gallery-thumb:focus-visible {
          opacity: 0.9;
        }
        .gallery-thumb.is-active {
          opacity: 1;
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
