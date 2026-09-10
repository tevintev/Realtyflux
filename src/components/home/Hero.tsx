"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export default function Hero() {
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      // Subtle parallax offset
      const offsetX = ((x / rect.width) - 0.5) * 20;
      const offsetY = ((y / rect.height) - 0.5) * 20;
      setParallaxOffset({ x: offsetX, y: offsetY });
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticles = (now: number) => {
      if (mouseRef.current.x < 0) return;
      // Spawn 2-3 particles every 16ms (~60fps)
      if (now - lastSpawnRef.current < 16) return;
      lastSpawnRef.current = now;

      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.2;
        const life = 40 + Math.random() * 50;
        particlesRef.current.push({
          x: mouseRef.current.x + (Math.random() - 0.5) * 8,
          y: mouseRef.current.y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3, // slight upward drift
          life,
          maxLife: life,
          size: 1.5 + Math.random() * 3,
          hue: 140 + Math.random() * 30, // green range 140-170
        });
      }
    };

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnParticles(now);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        // Gentle deceleration
        p.vx *= 0.98;
        p.vy *= 0.98;

        const progress = p.life / p.maxLife; // 1 → 0
        const alpha = progress * 0.85;
        const size = p.size * (0.4 + progress * 0.6);

        // Glow layer
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 55%, ${alpha * 0.12})`;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${alpha})`;
        ctx.fill();

        // Bright center dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 92%, ${alpha * 0.9})`;
        ctx.fill();
      }

      // Soft glow around cursor position
      if (mouseRef.current.x > 0) {
        const grd = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 120
        );
        grd.addColorStop(0, "rgba(74, 222, 128, 0.07)");
        grd.addColorStop(0.5, "rgba(22, 163, 74, 0.03)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(
          mouseRef.current.x - 120,
          mouseRef.current.y - 120,
          240, 240
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = { x: -100, y: -100 }; }}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#0b0f19",
      }}
    >
      {/* Parallax Background Image */}
      <div
        style={{
          position: "absolute",
          inset: "-30px",
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0) scale(1.05)`,
          transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex: 0,
        }}
      />

      {/* Dark Overlay to increase text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(11, 15, 25, 0.8) 0%, rgba(11, 15, 25, 0.55) 50%, rgba(11, 15, 25, 0.85) 100%)",
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
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "900px",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1.25rem",
            background: "rgba(37, 99, 235, 0.15)",
            borderRadius: "9999px",
            border: "1px solid rgba(37, 99, 235, 0.25)",
            marginBottom: "2rem",
          }}
        >
          {/* <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#4ade80",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Kenya&apos;s Trusted Property Partner
          </span> */}
        </div>

        {/* Main heading */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.03em",
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
          className="animate-fade-in-up animate-delay-200"
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
          className="animate-fade-in-up animate-delay-300"
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

        {/* Stats row */}
        <div
          className="animate-fade-in-up animate-delay-500 hero-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.5rem",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {[
            { value: "850+", label: "Properties Sold" },
            { value: "1,200+", label: "Happy Clients" },
            { value: "6+", label: "Years Experience" },
            { value: "100+", label: "Active Listings" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#22c55e",
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(214, 211, 209, 0.75)",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
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

      <style jsx>{`
        .hero-stats {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        @media (min-width: 640px) {
          .hero-stats {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
