"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ companyName = "Realty Flux", logo = "/logo.png" }: { companyName?: string; logo?: string | null }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: isScrolled ? "0.75rem 1.5rem" : "1.25rem 1.5rem",
          background: isScrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(231,229,228,0.6)" : "none",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={logo || "/logo.png"}
                alt={`${companyName} Logo`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: isScrolled ? "#1c1917" : "#ffffff",
                  letterSpacing: "-0.03em",
                  transition: "color 0.3s ease",
                }}
              >
                {(() => {
                  const parts = companyName.split(" ");
                  return parts[0] || "Realty";
                })()}
              </span>{" "}
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "#16a34a",
                  letterSpacing: "-0.03em",
                }}
              >
                {(() => {
                  const parts = companyName.split(" ");
                  return parts.slice(1).join(" ") || "Flux";
                })()}
              </span>
            </div>

          </Link>

          {/* Desktop nav links */}
          <div
            style={{
              display: "none",
              gap: "0.25rem",
              alignItems: "center",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  color: isScrolled ? "#44403c" : "rgba(255,255,255,0.85)",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  transition: "all 0.25s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#16a34a";
                  e.currentTarget.style.background = isScrolled
                    ? "rgba(22,163,74,0.06)"
                    : "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isScrolled
                    ? "#44403c"
                    : "rgba(255,255,255,0.85)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div
            style={{ display: "none", alignItems: "center", gap: "0.75rem" }}
            className="desktop-cta"
          >
            <Link
              href="/properties"
              className="btn-primary"
              style={{ padding: "0.65rem 1.5rem", fontSize: "0.88rem" }}
            >
              Browse Properties
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobileMenuOpen ? "0px" : "5px",
              padding: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              zIndex: 1100,
            }}
          >
            <span
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: isScrolled || isMobileMenuOpen ? "#1c1917" : "#fff",
                borderRadius: "2px",
                transition: "all 0.3s ease",
                transform: isMobileMenuOpen
                  ? "rotate(45deg) translate(1px, 1px)"
                  : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: isScrolled || isMobileMenuOpen ? "#1c1917" : "#fff",
                borderRadius: "2px",
                transition: "all 0.3s ease",
                opacity: isMobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                height: "2px",
                background: isScrolled || isMobileMenuOpen ? "#1c1917" : "#fff",
                borderRadius: "2px",
                transition: "all 0.3s ease",
                transform: isMobileMenuOpen
                  ? "rotate(-45deg) translate(1px, -1px)"
                  : "none",
                width: isMobileMenuOpen ? "24px" : "18px",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1050,
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        {navLinks.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#1c1917",
              textDecoration: "none",
              padding: "0.75rem 2rem",
              borderRadius: "12px",
              transition: "all 0.25s ease",
              transform: isMobileMenuOpen
                ? "translateY(0)"
                : `translateY(${20 + index * 10}px)`,
              opacity: isMobileMenuOpen ? 1 : 0,
              transitionDelay: `${index * 60}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#16a34a";
              e.currentTarget.style.background = "rgba(22,163,74,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1c1917";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/properties"
          onClick={() => setIsMobileMenuOpen(false)}
          className="btn-primary"
          style={{ marginTop: "1rem", padding: "0.85rem 2.5rem" }}
        >
          Browse Properties
        </Link>
      </div>

      {/* Responsive styles */}
      <style jsx global>{`
        .desktop-nav {
          display: none !important;
        }
        .desktop-cta {
          display: none !important;
        }
        .mobile-menu-btn {
          display: flex !important;
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
