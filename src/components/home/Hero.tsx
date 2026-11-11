"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  gsap,
  SplitText,
  useGSAP,
  motionEnabled,
  isPageTransitioning,
  prefersReducedMotion,
} from "@/lib/motion";
import { isOptimizable } from "@/lib/image-path";

export default function Hero({ images = [] }: { images?: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgScrollRef = useRef<HTMLDivElement>(null);
  const bgMouseRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mouseTo = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      // Subtle parallax offset, eased by GSAP instead of re-rendering
      mouseTo.current?.x(((x / rect.width) - 0.5) * -24);
      mouseTo.current?.y(((y / rect.height) - 0.5) * -24);
    },
    []
  );

  useGSAP(
    () => {
      if (!motionEnabled()) return;
      const heading = headingRef.current!;

      mouseTo.current = {
        x: gsap.quickTo(bgMouseRef.current, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(bgMouseRef.current, "y", { duration: 1.2, ease: "power3.out" }),
      };

      // Intro: background settles, headline lines rise out of a mask,
      // then the supporting copy and buttons follow.
      const split = SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
      });
      const tl = gsap.timeline({
        delay: isPageTransitioning() ? 0.6 : 0.15,
        defaults: { ease: "expo.out" },
        // Restore the original markup so the heading reflows on resize.
        onComplete: () => split.revert(),
      });
      tl.fromTo(
        bgMouseRef.current,
        { scale: 1.3, opacity: 0 },
        { scale: 1.06, opacity: 1, duration: 2.4 },
        0
      )
        .fromTo(heading, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.2)
        .from(split.lines, { yPercent: 115, duration: 1.4, stagger: 0.14 }, 0.2)
        .fromTo(
          ".hero-fade",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 },
          0.6
        )
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2);
      sectionRef.current
        ?.querySelectorAll("[data-intro]")
        .forEach((el) => el.setAttribute("data-revealed", ""));

      // Scroll-out: background drifts slower than the page, content lifts and fades.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(bgScrollRef.current, { yPercent: 22, ease: "none" }, 0)
        .to(contentRef.current, { y: -120, opacity: 0, ease: "none" }, 0);
    },
    { scope: sectionRef }
  );

  // Homepage slides (up to three images, set in the admin): each turns over
  // like a book page onto the next, then holds for a few seconds.
  useGSAP(
    () => {
      if (!motionEnabled() || images.length < 2) return;
      const section = sectionRef.current!;
      const slides = gsap.utils.toArray<HTMLElement>(".hero-slide", section);
      const photos = slides.map((slide) => slide.querySelector("img"));
      const dots = gsap.utils.toArray<HTMLElement>(".hero-dot", section);
      const fills = gsap.utils.toArray<HTMLElement>(".hero-dot__fill", section);
      const HOLD = 6;
      const SLIDE = 1.5;
      let current = 0;
      let busy = false;

      gsap.set(slides[0].parentElement, { perspective: 1600 });
      gsap.set(slides, { autoAlpha: (i: number) => (i === 0 ? 1 : 0), rotateY: 0, zIndex: (i: number) => (i === 0 ? 2 : 1) });

      const drift = (i: number) =>
        gsap.fromTo(photos[i], { scale: 1.14 }, { scale: 1, duration: HOLD + SLIDE * 2, ease: "none", overwrite: true });

      const markActive = (i: number) => {
        dots.forEach((dot, n) => dot.classList.toggle("is-active", n === i));
        fills.forEach((fill, n) => {
          gsap.killTweensOf(fill);
          if (n === i) gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: "none" });
          else gsap.set(fill, { scaleX: 0 });
        });
      };

      const autoplay = gsap.delayedCall(HOLD, () => go((current + 1) % slides.length, 1));

      function go(to: number, dir: 1 | -1) {
        if (busy || to === current) return;
        busy = true;
        autoplay.pause();
        const from = current;
        current = to;
        markActive(to);
        drift(to);
        // Page turn: the current photo swings away like a page of a book,
        // hinged on one edge, revealing the next photo lying underneath.
        const hinge = dir > 0 ? "0% 50%" : "100% 50%";
        gsap.set(slides[to], { autoAlpha: 1, rotateY: 0, filter: "brightness(0.55)", scale: 1.05, zIndex: 2 });
        gsap.set(slides[from], { zIndex: 3, transformOrigin: hinge, rotateY: 0, filter: "brightness(1)" });
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(slides[from], { autoAlpha: 0, rotateY: 0, filter: "none", zIndex: 1 });
              gsap.set(slides[to], { filter: "none", scale: 1, zIndex: 2 });
              busy = false;
              autoplay.restart(true);
            },
          })
          .to(slides[from], { rotateY: -100 * dir, filter: "brightness(0.6)", duration: SLIDE, ease: "power2.inOut" }, 0)
          .to(slides[from], { autoAlpha: 0, duration: 0.25, ease: "none" }, SLIDE - 0.25)
          .to(slides[to], { filter: "brightness(1)", scale: 1, duration: SLIDE, ease: "power2.out" }, 0);
      }

      markActive(0);
      drift(0);

      // Only advance while the hero is on screen and the tab is in front.
      let onScreen = true;
      const syncPlayback = () => {
        if (busy) return;
        if (onScreen && !document.hidden) autoplay.resume();
        else autoplay.pause();
      };
      const observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        syncPlayback();
      });
      observer.observe(section);
      document.addEventListener("visibilitychange", syncPlayback);

      const clicks = dots.map((dot, i) => {
        const onClick = () => go(i, i > current ? 1 : -1);
        dot.addEventListener("click", onClick);
        return () => dot.removeEventListener("click", onClick);
      });

      return () => {
        autoplay.kill();
        observer.disconnect();
        document.removeEventListener("visibilitychange", syncPlayback);
        clicks.forEach((off) => off());
      };
    },
    { scope: sectionRef, dependencies: [images.length] }
  );

  // Cursor trail: a drift of gold dust and twinkling sparkles that follows the
  // mouse, with a soft warm glow trailing behind it. It needs a real pointer
  // and motion to be allowed, so touch screens skip it entirely.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Mote = {
      kind: "dust" | "spark" | "ring";
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      size: number;
      rgb: string;
      phase: number;
      spin: number;
      angle: number;
    };
    const motes: Mote[] = [];
    const GOLD = ["255,236,170", "246,214,120", "232,190,90", "255,247,222"];
    const EMERALD = "110,231,183";
    const MAX_MOTES = 150;

    let w = 0;
    let h = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(canvas);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // More movement leaves more sparkle; a still mouse leaves none.
    const spawn = (x: number, y: number, speed: number) => {
      const count = Math.min(4, 1 + Math.floor(speed / 16));
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const kind: Mote["kind"] = roll < 0.36 ? "spark" : roll < 0.46 ? "ring" : "dust";
        const max = kind === "dust" ? rand(0.9, 1.6) : kind === "spark" ? rand(0.8, 1.4) : rand(1, 1.6);
        motes.push({
          kind,
          x: x + rand(-6, 6),
          y: y + rand(-6, 6),
          vx: rand(-22, 22),
          vy: rand(-46, -10), // lifts gently, like dust in light
          life: max,
          max,
          size: kind === "dust" ? rand(1, 2.7) : kind === "spark" ? rand(7, 15) : rand(7, 17),
          rgb: kind !== "ring" && Math.random() < 0.12 ? EMERALD : GOLD[Math.floor(Math.random() * GOLD.length)],
          phase: rand(0, Math.PI * 2),
          spin: rand(-1.4, 1.4),
          angle: rand(0, Math.PI),
        });
      }
      if (motes.length > MAX_MOTES) motes.splice(0, motes.length - MAX_MOTES);
    };

    // Concave four-point star: the classic sparkle shape.
    const star = (r: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
    };

    let raf = 0;
    let last = performance.now();
    let prevX = -1;
    let prevY = -1;
    let glowX = -1;
    let glowY = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!onScreen || document.hidden) return;

      ctx.clearRect(0, 0, w, h);
      const m = mouseRef.current;
      const hovering = m.x >= 0;

      if (hovering) {
        if (prevX >= 0) {
          const dist = Math.hypot(m.x - prevX, m.y - prevY);
          if (dist > 3) spawn(m.x, m.y, dist);
        }
        prevX = m.x;
        prevY = m.y;
        if (glowX < 0) {
          glowX = m.x;
          glowY = m.y;
        }
        glowX += (m.x - glowX) * Math.min(1, dt * 8);
        glowY += (m.y - glowY) * Math.min(1, dt * 8);
      } else {
        prevX = prevY = glowX = glowY = -1;
      }

      ctx.globalCompositeOperation = "lighter";

      if (hovering) {
        const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 170);
        glow.addColorStop(0, "rgba(255, 224, 150, 0.17)");
        glow.addColorStop(0.45, "rgba(255, 200, 100, 0.06)");
        glow.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(glowX - 170, glowY - 170, 340, 340);
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i];
        p.life -= dt;
        if (p.life <= 0) {
          motes.splice(i, 1);
          continue;
        }
        p.phase += dt * 9;
        p.angle += p.spin * dt;
        p.vx *= 1 - dt * 1.4;
        p.vy *= 1 - dt * 0.7;
        p.x += (p.vx + Math.sin(p.phase * 0.6) * 8) * dt;
        p.y += p.vy * dt;

        const t = p.life / p.max; // 1 -> 0
        const alpha = Math.min(1, t * 2.2); // hold, then fade out

        if (p.kind === "dust") {
          ctx.fillStyle = `rgba(${p.rgb}, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${p.rgb}, ${alpha * 0.12})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "spark") {
          const twinkle = 0.65 + 0.35 * Math.sin(p.phase);
          const r = p.size * twinkle * (0.5 + t * 0.5);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(${p.rgb}, ${alpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(p.angle);
          ctx.fillStyle = `rgba(${p.rgb}, ${alpha})`;
          star(r);
          ctx.restore();
        } else {
          const radius = p.size * (1 + (1 - t) * 1.6); // expands as it fades
          ctx.strokeStyle = `rgba(${p.rgb}, ${alpha * 0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = { x: -100, y: -100 }; }}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        // Text sits in the lower half so it doesn't cover the logo in the photo.
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
        padding: "6rem 0 6rem",
        backgroundColor: "#0b0f19",
      }}
    >
      {/* Parallax Background Image: outer layer follows scroll, inner follows the mouse */}
      <div
        ref={bgScrollRef}
        style={{ position: "absolute", inset: 0, zIndex: 0, willChange: "transform" }}
      >
        <div
          ref={bgMouseRef}
          // The default lobby photo is a CSS background; admin-set images replace it.
          className={images.length ? undefined : "hero-bg"}
          style={{
            position: "absolute",
            inset: "-40px",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
            transform: "scale(1.06)",
            willChange: "transform",
          }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="hero-slide" style={i === 0 ? undefined : { visibility: "hidden" }}>
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                quality={80}
                sizes="100vw"
                unoptimized={!isOptimizable(src)}
                style={{ objectFit: "cover", objectPosition: "center 35%" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark Overlay to increase text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: images.length
            ? "linear-gradient(to bottom, rgba(11, 15, 25, 0.68) 0%, rgba(11, 15, 25, 0.5) 45%, rgba(11, 15, 25, 0.84) 100%)"
            : "linear-gradient(to bottom, rgba(11, 15, 25, 0.6) 0%, rgba(11, 15, 25, 0.4) 50%, rgba(11, 15, 25, 0.75) 100%)",
          zIndex: 1,
        }}
      />

      {/* Canvas Particle Trail Effect */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Decorative blurs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "900px",
        }}
      >
        {/* Main heading */}
        <h1
          ref={headingRef}
          data-intro
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.03em",
            filter: "drop-shadow(0 2px 14px rgba(0, 0, 0, 0.55))",
          }}
        >
          Exceptional{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #4ade80, #16a34a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Homes!
          </span>
          <br />
          Extraordinary Living.
        </h1>

        {/* Subtitle */}
        <p
          className="hero-fade"
          data-intro
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "rgba(214, 211, 209, 0.85)",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
          }}
        >
         Browse distinctive homes and exceptional investment opportunities 
         carefully selected to match your lifestyle and ambitions.
        </p>

        {/* CTA buttons */}
        <div
          className="hero-fade"
          data-intro
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "4rem",
          }}
        >
          <Link
            href="/properties"
            data-magnetic
            className="btn-primary"
            style={{
              padding: "1rem 2.25rem",
              fontSize: "1rem",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Explore Properties
          </Link>
          <Link
            href="/contact"
            data-magnetic
            className="btn-secondary"
            style={{
              padding: "1rem 2.25rem",
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.85)",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#22c55e";
              e.currentTarget.style.color = "#22c55e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            Contact Us
          </Link>
        </div>
      </div>

      {/* Slide indicators: one progress line per hero image */}
      {images.length > 1 && (
        <div className="hero-dots" role="group" aria-label="Hero slides">
          {images.map((_, i) => (
            <button key={i} type="button" className="hero-dot" aria-label={`Show slide ${i + 1}`}>
              <span className="hero-dot__fill" />
            </button>
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div
        className="hero-scroll"
        data-intro
        style={{
          position: "absolute",
          bottom: "2rem",
          left: 0,
          right: 0,
          margin: "0 auto",
          width: "max-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          animation: "float 3s ease-in-out infinite",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "rgba(168, 162, 158, 0.6)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Scroll
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(168, 162, 158, 0.5)"
          strokeWidth="2"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>

    </section>
  );
}
