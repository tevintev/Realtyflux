"use client";

import { testimonials } from "@/data/testimonials";
import { useState } from "react";

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleTestimonials = testimonials.slice(0, 6);

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
          <span className="section-label">Client Stories</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            Real stories from real people who found their perfect property with
            Realty Flux.
          </p>
        </div>

        {/* Featured testimonial */}
        <div
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

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              fontStyle: "italic",
              marginBottom: "1.5rem",
              transition: "opacity 0.3s ease",
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
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
