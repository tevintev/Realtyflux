"use client";

import Link from "next/link";
import Image from "next/image";
import { isOptimizable } from "@/lib/image-path";
import { companyInfo as staticCompanyInfo } from "@/data/company";
import { usePathname } from "next/navigation";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const propertyLinks = [
  { label: "Houses", href: "/properties?type=house" },
  { label: "Apartments", href: "/properties?type=apartment" },
  { label: "Villas", href: "/properties?type=villa" },
  { label: "Commercial", href: "/properties?type=commercial" },
  { label: "Land", href: "/properties?type=land" },
];

interface FooterProps {
  companyInfo?: typeof staticCompanyInfo;
}

export default function Footer({ companyInfo: passedCompanyInfo }: FooterProps = {}) {
  const pathname = usePathname();
  const companyInfo = passedCompanyInfo || staticCompanyInfo;

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #1c1917 0%, #0f0e0d 100%)",
        color: "#d6d3d1",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient line */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #16a34a, #4ade80, #16a34a, transparent)",
        }}
      />

      {/* Main footer */}
      <div
        style={{ padding: "4rem 1.5rem 2rem" }}
        className="container-custom"
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
          }}
          className="footer-grid"
          data-reveal-stagger
        >
          {/* Company info */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                textDecoration: "none",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={companyInfo.logo || "/logo.png"}
                  alt={`${companyInfo.name} Logo`}
                  width={72}
                  height={72}
                  unoptimized={!isOptimizable(companyInfo.logo || "/logo.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {(() => {
                  const parts = companyInfo.name.split(" ");
                  return parts[0] || "Realty";
                })()}
                <span style={{ color: "#16a34a" }}>
                  {" "}{(() => {
                    const parts = companyInfo.name.split(" ");
                    return parts.slice(1).join(" ") || "Flux";
                  })()}
                </span>
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.7,
                color: "#a8a29e",
                maxWidth: "320px",
                marginBottom: "1.5rem",
              }}
            >
              {companyInfo.mission}
            </p>
            {/* Social links */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                {
                  name: "Facebook",
                  href: companyInfo.socialLinks.facebook,
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  name: "Instagram",
                  href: companyInfo.socialLinks.instagram,
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  name: "Twitter",
                  href: companyInfo.socialLinks.twitter,
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  name: "TikTok",
                  href: companyInfo.socialLinks.tiktok,
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  ),
                },
              ]
                .filter((social) => Boolean(social.href))
                .map((social) => (
                <a
                  key={social.name}
                  href={social.href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    color: "#a8a29e",
                    transition: "all 0.25s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#16a34a";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#a8a29e";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "1.25rem",
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "#a8a29e",
                      textDecoration: "none",
                      fontSize: "0.92rem",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#4ade80";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#a8a29e";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "1.25rem",
              }}
            >
              Property Types
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {propertyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "#a8a29e",
                      textDecoration: "none",
                      fontSize: "0.92rem",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#4ade80";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#a8a29e";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "1.25rem",
              }}
            >
              Get In Touch
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(22,163,74,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      color: "#d6d3d1",
                      fontSize: "0.9rem",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {companyInfo.address}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(22,163,74,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <a
                  href={`tel:${companyInfo.phone}`}
                  style={{
                    color: "#d6d3d1",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#4ade80")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#d6d3d1")
                  }
                >
                  {companyInfo.phone}
                </a>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(22,163,74,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <a
                  href={`mailto:${companyInfo.email}`}
                  style={{
                    color: "#d6d3d1",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#4ade80")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#d6d3d1")
                  }
                >
                  {companyInfo.email}
                </a>
              </div>

              <p
                style={{
                  color: "#78716c",
                  fontSize: "0.85rem",
                  margin: 0,
                  marginTop: "0.25rem",
                }}
              >
                {companyInfo.workingHours}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            maxWidth: "1280px",
            margin: "3rem auto 0",
          }}
          className="footer-bottom"
        >
          <p
            style={{
              color: "#78716c",
              fontSize: "0.85rem",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Realty Flux. All rights reserved.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
            }}
          >
            <Link
              href="#"
              style={{
                color: "#78716c",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d6d3d1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#78716c")}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={{
                color: "#78716c",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d6d3d1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#78716c")}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Footer responsive grid */}
      <style jsx global>{`
        /* Phones: brand and contact span the width, the two link lists sit side by side. */
        .footer-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 2rem 1.25rem !important;
        }
        .footer-grid > :first-child,
        .footer-grid > :last-child {
          grid-column: 1 / -1;
        }
        .footer-bottom {
          flex-direction: column !important;
          text-align: center;
        }
        @media (min-width: 640px) {
          .footer-grid {
            gap: 3rem !important;
          }
          .footer-grid > :first-child,
          .footer-grid > :last-child {
            grid-column: auto;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr 1.3fr !important;
          }
          .footer-bottom {
            flex-direction: row !important;
            text-align: left;
          }
        }
      `}</style>
    </footer>
  );
}
