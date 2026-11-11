"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, motionEnabled, getLenis } from "@/lib/motion";

const SLIDES = [
  {
    slug: "house",
    name: "Family Homes",
    image: "/images/showcase/houses.webp",
    description:
      "Bungalows and maisonettes with room to grow, in quiet neighbourhoods close to schools and amenities.",
  },
  {
    slug: "apartment",
    name: "Apartments",
    image: "/images/showcase/apartments.webp",
    description:
      "Modern flats, penthouses and studios with secure access, shared amenities and easy city living.",
  },
  {
    slug: "villa",
    name: "Villas",
    image: "/images/showcase/villas.webp",
    description:
      "Luxury villas and country estates with generous gardens, privacy and premium finishes.",
  },
  {
    slug: "townhouse",
    name: "Townhouses",
    image: "/images/showcase/townhouses.webp",
    description:
      "The space of a house with the convenience of a community, in well-managed gated developments.",
  },
  {
    slug: "commercial",
    name: "Commercial",
    image: "/images/showcase/commercial.webp",
    description:
      "Offices, retail shops and warehouses in prime locations, ready for your business to move in.",
  },
  {
    slug: "land",
    name: "Land",
    image: "/images/showcase/land.webp",
    description:
      "Development plots and agricultural land with clear titles, ready for your next project.",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned property-type showcase: as you scroll, the current image slides off
 * to one side while the next slides in from the other, and the copy swaps.
 * Without motion it renders as a plain list of slides.
 */
export default function PropertyShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const tally: Record<string, number> = {};
        for (const property of data) {
          const type = property.propertyType;
          if (type) tally[type] = (tally[type] || 0) + 1;
        }
        setCounts(tally);
      })
      .catch((err) => console.error(err));
  }, []);

  useGSAP(
    () => {
      if (!motionEnabled()) return;
      const section = sectionRef.current!;
      const slides = gsap.utils.toArray<HTMLElement>(".showcase__slide", section);
      const media = slides.map((s) => s.querySelector(".showcase__media"));
      const copy = slides.map((s) => s.querySelector(".showcase__copy"));
      const steps = slides.length - 1;
      const cleanups: Array<() => void> = [];
      let settle: ReturnType<typeof setTimeout> | undefined;
      // Scroll distance per slide. Phones get more room: a single swipe with
      // momentum covers a lot of ground, and slides used to fly past.
      const scrollPerStep = () => window.innerHeight * (window.innerWidth < 768 ? 1.5 : 1.15);

      // Everything after the first slide waits off to the right.
      gsap.set(media.slice(1), { xPercent: 115, rotation: 7, scale: 0.85, autoAlpha: 0 });
      gsap.set(copy.slice(1), { yPercent: 35, autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${steps * scrollPerStep()}`,
          pin: true,
          scrub: 1.2,
          snap: {
            snapTo: (progress: number, self?: ScrollTrigger) => {
              const pos = progress * steps;
              // Past 20% of a card in the direction of travel, commit to the next card.
              const target = (self?.direction ?? 1) > 0 ? Math.floor(pos + 0.8) : Math.ceil(pos - 0.8);
              return Math.min(steps, Math.max(0, target)) / steps;
            },
            // Ignore flick velocity so a fast swipe settles on the next slide
            // in its direction instead of overshooting by several.
            inertia: false,
            delay: 0.12,
            duration: { min: 0.5, max: 1.1 },
            ease: "power2.inOut",
          },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // While slides move, the pointer must not react to them: the text
            // slides under a still mouse and the buttons flipped in and out of
            // hover (see .is-scrubbing in globals.css).
            section.classList.add("is-scrubbing");
            clearTimeout(settle);
            settle = setTimeout(() => section.classList.remove("is-scrubbing"), 180);
            const index = Math.round(self.progress * steps);
            if (counterRef.current) counterRef.current.textContent = pad(index + 1);
            gsap.set(".showcase__progress-bar", { scaleX: self.progress });
            section
              .querySelectorAll(".showcase__dot")
              .forEach((dot, i) => dot.classList.toggle("is-active", i === index));
          },
        },
      });

      for (let i = 1; i <= steps; i++) {
        const at = i - 1;
        tl.to(media[i - 1], { xPercent: -115, rotation: -7, scale: 0.8, autoAlpha: 0 }, at)
          .to(copy[i - 1], { yPercent: -35, autoAlpha: 0, duration: 0.6 }, at)
          .to(media[i], { xPercent: 0, rotation: 0, scale: 1, autoAlpha: 1 }, at)
          .to(copy[i], { yPercent: 0, autoAlpha: 1, duration: 0.6 }, at + 0.4);
      }

      // Touch devices: a hard flick carries native momentum for many screens,
      // which scrubbing and snapping cannot stop. While a swipe is in flight,
      // hold the scroll position to one slide either side of the slide the
      // reader was resting on, so a flick moves one card, never several.
      // Programmatic jumps (anchor links, scroll-to-top) are not swipes and are
      // left alone, as are mouse and wheel users.
      if (ScrollTrigger.isTouch) {
        const st = tl.scrollTrigger!;
        const at = (i: number) => st.start + ((st.end - st.start) * i) / steps;
        const nearest = () => Math.min(steps, Math.max(0, Math.round(st.progress * steps)));
        let resting = nearest();
        let swiping = false;
        let lastY = window.scrollY;
        let idle: ReturnType<typeof setTimeout> | undefined;

        // The swipe is over once the finger is up and the page has stopped moving.
        const settleSoon = () => {
          clearTimeout(idle);
          idle = setTimeout(() => {
            swiping = false;
          }, 350);
        };
        const onTouchStart = () => {
          resting = nearest();
          swiping = false;
        };
        const onTouchMove = () => {
          swiping = true;
        };
        const onScroll = () => {
          const y = window.scrollY;
          // Scroll events keep firing while the page is still, so judge "idle"
          // by the position changing, not by events arriving.
          if (Math.abs(y - lastY) > 0.5) {
            lastY = y;
            settleSoon();
          }
          if (!swiping) return;

          const lo = resting > 0 ? at(resting - 1) : -Infinity;
          const hi = resting < steps ? at(resting + 1) : Infinity;
          const limit = y > hi ? hi : y < lo ? lo : null;
          if (limit === null) return;
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(limit, { immediate: true, force: true });
          else window.scrollTo(0, limit);
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", settleSoon, { passive: true });
        window.addEventListener("touchcancel", settleSoon, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          clearTimeout(idle);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("touchend", settleSoon);
          window.removeEventListener("touchcancel", settleSoon);
          window.removeEventListener("scroll", onScroll);
        });
      }

      return () => {
        clearTimeout(settle);
        section.classList.remove("is-scrubbing");
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: sectionRef }
  );

  return (
    // Block wrapper: pin spacing is skipped when the parent is a flex container.
    <div>
      <section ref={sectionRef} className="showcase">
        <div className="container-custom showcase__inner">
          <header className="showcase__head">
            <span className="section-label">Find Your Space</span>
            <div className="showcase__counter" aria-hidden="true">
              <span ref={counterRef}>01</span> / {pad(SLIDES.length)}
            </div>
          </header>

          <div className="showcase__stage">
            {SLIDES.map((slide, i) => {
              const count = counts[slide.slug];
              return (
                <article key={slide.slug} className="showcase__slide">
                  <div className="showcase__copy">
                    <span className="showcase__index">{pad(i + 1)}</span>
                    <h2 className="showcase__title">{slide.name}</h2>
                    <p className="showcase__text">{slide.description}</p>
                    <Link
                      href={`/properties?type=${slide.slug}`}
                      className="btn-primary"
                    >
                      Explore {slide.name}
                      {count !== undefined && (
                        <span className="showcase__count">
                          {count} {count === 1 ? "listing" : "listings"}
                        </span>
                      )}
                    </Link>
                  </div>
                  <Link
                    href={`/properties?type=${slide.slug}`}
                    className="showcase__media"
                    data-cursor="Explore"
                    aria-label={`Explore ${slide.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.image} alt="" loading="lazy" decoding="async" />
                  </Link>
                </article>
              );
            })}
          </div>

          <footer className="showcase__foot" aria-hidden="true">
            <div className="showcase__dots">
              {SLIDES.map((slide, i) => (
                <span key={slide.slug} className={`showcase__dot${i === 0 ? " is-active" : ""}`} />
              ))}
            </div>
            <div className="showcase__progress">
              <span className="showcase__progress-bar" />
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
