"use client";

import { testimonials } from "@/data/testimonials";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, motionEnabled } from "@/lib/motion";

const AUTOPLAY_MS = 7000;

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastAnimatedIndex = useRef(activeIndex);
  const visibleTestimonials = testimonials.slice(0, 6);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(
      () => setActiveIndex((i) => (i + 1) % visibleTestimonials.length),
      AUTOPLAY_MS
    );
    return () => clearTimeout(id);
  }, [activeIndex, paused, visibleTestimonials.length]);

  // Crossfade each new quote in: words lift slightly out of a soft blur.
  useGSAP(
    () => {
      if (lastAnimatedIndex.current === activeIndex) return;
      lastAnimatedIndex.current = activeIndex;
      if (!motionEnabled()) return;
      gsap.fromTo(
        bodyRef.current!.children,
        { opacity: 0, y: 24, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.07,
          clearProps: "filter,transform",
        }
      );
    },
    { dependencies: [activeIndex] }
  );

  return (
    <section
      className="section-padding"
      style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, #fff 100%)",
      }}
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
          <span data-reveal="fade" className="section-label">Client Stories</span>
          <h2 data-split className="section-title">What Our Clients Say</h2>
          <p data-reveal className="section-subtitle" style={{ textAlign: "center" }}>
            Real stories from real people who found their perfect property with
            Realty Flux.
          </p>
        </div>

        {/* Featured testimonial */}
        <div
          data-reveal
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            maxWidth: "800px",
            margin: "0 auto 3rem",
            textAlign: "center",
            position: "relative",
            minHeight: "220px",
          }}
        >
          {/* Quote icon */}
          <div
            style={{
              fontSize: "4rem",
              lineHeight: 1,
              color: "var(--color-blue-200)",
              fontFamily: "Georgia, serif",
              marginBottom: "1rem",
            }}
          >
            &ldquo;
          </div>

          <div ref={bodyRef}>
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              fontStyle: "italic",
              marginBottom: "1.5rem",
            }}
          >
            {visibleTestimonials[activeIndex].content}
          </p>

          {/* Stars */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.25rem",
              marginBottom: "1rem",
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={
                  i < visibleTestimonials[activeIndex].rating
                    ? "#fbbf24"
                    : "#e7e5e4"
                }
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          {/* Author */}
          <div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {visibleTestimonials[activeIndex].name}
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
              }}
            >
              {visibleTestimonials[activeIndex].role}
              {visibleTestimonials[activeIndex].propertyType &&
                ` • ${visibleTestimonials[activeIndex].propertyType}`}
            </div>
          </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {visibleTestimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View testimonial ${i + 1}`}
              style={{
                width: activeIndex === i ? "2rem" : "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                border: "none",
                background:
                  activeIndex === i
                    ? "var(--accent-primary)"
                    : "var(--color-stone-300)",
                cursor: "pointer",
                transition: "width 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
