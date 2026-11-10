"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isOptimizable } from "@/lib/image-path";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  lockScroll,
  motionEnabled,
  prefersReducedMotion,
} from "@/lib/motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

// Pixels of continuous scrolling in one direction before the bar hides/shows.
const NAV_TOGGLE_DISTANCE = 12;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar({ companyName = "Realty Flux", logo = "/logo.png" }: { companyName?: string; logo?: string | null }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const menuOpenRef = useRef(false);
  const navHiddenRef = useRef(false);

  const [firstWord, ...restWords] = companyName.split(" ");
  const brandFirst = firstWord || "Realty";
  const brandRest = restWords.join(" ") || "Flux";

  useEffect(() => {
    if (isAdmin) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdmin]);

  // Hide the bar while scrolling down, bring it back on scroll up.
  useGSAP(
    () => {
      if (isAdmin || !motionEnabled() || !navRef.current) return;
      const nav = navRef.current;
      // Smooth scrolling produces tiny back-and-forth deltas; only react once
      // the user has moved a few pixels in one direction, and only animate
      // when the hidden state actually changes.
      let lastY = window.scrollY;
      let travel = 0;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const delta = y - lastY;
          lastY = y;
          travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
          if (menuOpenRef.current) return;

          let hide = navHiddenRef.current;
          if (y < 160 || travel < -NAV_TOGGLE_DISTANCE) hide = false;
          else if (travel > NAV_TOGGLE_DISTANCE) hide = true;
          if (hide === navHiddenRef.current) return;

          navHiddenRef.current = hide;
          gsap.to(nav, {
            yPercent: hide ? -110 : 0,
            duration: hide ? 0.45 : 0.6,
            ease: hide ? "power3.in" : "expo.out",
            overwrite: true,
          });
        },
      });
    },
    { dependencies: [isAdmin] }
  );

  // Always show the bar when arriving on a new page.
  useEffect(() => {
    navHiddenRef.current = false;
    if (navRef.current) gsap.set(navRef.current, { yPercent: 0, overwrite: true });
  }, [pathname]);

  // Sliding pill that follows the hovered (or active) desktop link.
  const movePill = useCallback((target: HTMLElement | null, immediate = false) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!target) {
      gsap.to(pill, { opacity: 0, duration: 0.3, overwrite: "auto" });
      return;
    }
    gsap.to(pill, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
      duration: immediate || prefersReducedMotion() ? 0 : 0.55,
      ease: "expo.out",
      overwrite: "auto",
    });
  }, []);

  const activeLinkEl = useCallback(
    () => linksRef.current?.querySelector<HTMLElement>("[data-active='true']") ?? null,
    []
  );

  useEffect(() => {
    if (isAdmin) return;
    movePill(activeLinkEl(), true);
    // Fonts can change link widths after load; re-measure once they settle.
    document.fonts?.ready.then(() => movePill(activeLinkEl(), true));
  }, [pathname, isAdmin, movePill, activeLinkEl]);

  // Mobile menu timeline: circular wipe from the toggle, then links rise in.
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (isAdmin || !overlay) return;
      const speed = prefersReducedMotion() ? 0.01 : 1;
      menuTl.current = gsap
        .timeline({ paused: true })
        .set(overlay, { visibility: "visible", pointerEvents: "auto" })
        .fromTo(
          overlay,
          { clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" },
          {
            clipPath: "circle(150% at calc(100% - 2.6rem) 2.6rem)",
            duration: 0.9 * speed,
            ease: "expo.inOut",
          }
        )
        .fromTo(
          ".mobile-link-inner",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8 * speed, ease: "expo.out", stagger: 0.06 * speed },
          "-=0.45"
        )
        .fromTo(
          ".mobile-menu-foot",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 * speed, ease: "expo.out" },
          "-=0.55"
        );
    },
    { scope: overlayRef, dependencies: [isAdmin] }
  );

  useEffect(() => {
    if (isAdmin) return;
    menuOpenRef.current = isMobileMenuOpen;
    const tl = menuTl.current;
    if (tl) {
      if (isMobileMenuOpen) tl.timeScale(1).play();
      else if (tl.progress() > 0) tl.timeScale(1.5).reverse();
    }
    if (isMobileMenuOpen && navRef.current) {
      navHiddenRef.current = false;
      gsap.to(navRef.current, { yPercent: 0, duration: 0.3, overwrite: true });
    }
    lockScroll("mobile-menu", isMobileMenuOpen);
    return () => lockScroll("mobile-menu", false);
  }, [isMobileMenuOpen, isAdmin]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`site-nav${isScrolled ? " is-scrolled" : ""}${isMobileMenuOpen ? " menu-open" : ""}`}
      >
        <div className="site-nav__inner">
          {/* Logo */}
          <Link href="/" className="site-nav__brand">
            <span className="site-nav__logo">
              <Image
                src={logo || "/logo.png"}
                alt={`${companyName} Logo`}
                width={96}
                height={96}
                priority
                unoptimized={!isOptimizable(logo || "/logo.png")}
              />
            </span>
            <span>
              <span className="site-nav__brand-first">{brandFirst}</span>{" "}
              <span className="site-nav__brand-rest">{brandRest}</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            ref={linksRef}
            className="desktop-nav"
            onMouseLeave={() => movePill(activeLinkEl())}
          >
            <span ref={pillRef} className="site-nav__pill" aria-hidden="true" />
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="site-nav__link"
                  onMouseEnter={(e) => movePill(e.currentTarget)}
                  onFocus={(e) => movePill(e.currentTarget)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="desktop-cta">
            <Link
              href="/properties"
              data-magnetic="0.25"
              className="btn-primary"
              style={{ padding: "0.65rem 1.5rem", fontSize: "0.88rem" }}
            >
              Browse Properties
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="mobile-menu-btn"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="mobile-menu-btn__line" />
            <span className="mobile-menu-btn__line" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        ref={overlayRef}
        className="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
        data-lenis-prevent
      >
        <nav className="mobile-menu__links">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className={`mobile-link${isActive(pathname, link.href) ? " is-active" : ""}`}
            >
              <span className="mobile-link-inner">
                <span className="mobile-link__index">0{index + 1}</span>
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <Link
            href="/properties"
            onClick={() => setIsMobileMenuOpen(false)}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            className="btn-primary"
            style={{ padding: "0.9rem 2.5rem" }}
          >
            Browse Properties
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .site-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1100;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid transparent;
          will-change: transform;
          /* backdrop-filter is deliberately not transitioned: animating it
             on a moving bar flickers in Chromium. */
          transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.4s ease, border-color 0.4s ease;
        }
        .site-nav.is-scrolled {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-bottom-color: rgba(231, 229, 228, 0.6);
        }
        .site-nav.menu-open {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-bottom-color: transparent;
        }
        .site-nav__inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .site-nav__brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          font-family: "Outfit", sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .site-nav__logo {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .site-nav__brand:hover .site-nav__logo {
          transform: rotate(-8deg) scale(1.08);
        }
        .site-nav__logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .site-nav__brand-first {
          color: #fff;
          transition: color 0.3s ease;
        }
        .site-nav.is-scrolled:not(.menu-open) .site-nav__brand-first {
          color: #1c1917;
        }
        .site-nav__brand-rest {
          color: #16a34a;
        }
        .desktop-nav {
          position: relative;
          display: none;
          align-items: center;
          gap: 0.25rem;
        }
        .site-nav__pill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          opacity: 0;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
          pointer-events: none;
        }
        .site-nav.is-scrolled .site-nav__pill {
          background: rgba(22, 163, 74, 0.09);
        }
        .site-nav__link {
          position: relative;
          font-family: "Outfit", sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          transition: color 0.25s ease;
        }
        .site-nav.is-scrolled .site-nav__link {
          color: #44403c;
        }
        .site-nav .site-nav__link:hover,
        .site-nav .site-nav__link[data-active="true"] {
          color: #16a34a;
        }
        .site-nav:not(.is-scrolled) .site-nav__link:hover,
        .site-nav:not(.is-scrolled) .site-nav__link[data-active="true"] {
          color: #4ade80;
        }
        .desktop-cta {
          display: none;
          align-items: center;
          gap: 0.75rem;
        }
        .mobile-menu-btn {
          position: relative;
          display: flex;
          width: 44px;
          height: 44px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 1100;
        }
        .mobile-menu-btn__line {
          position: absolute;
          top: 21px;
          left: 10px;
          width: 24px;
          height: 2px;
          border-radius: 2px;
          background: #fff;
          transition: transform 0.5s cubic-bezier(0.7, 0, 0.2, 1),
            width 0.5s cubic-bezier(0.7, 0, 0.2, 1), background 0.3s ease;
        }
        .site-nav.is-scrolled:not(.menu-open) .mobile-menu-btn__line {
          background: #1c1917;
        }
        .mobile-menu-btn__line:first-child {
          transform: translateY(-4px);
        }
        .mobile-menu-btn__line:last-child {
          width: 16px;
          transform: translateY(4px);
        }
        .menu-open .mobile-menu-btn__line:first-child {
          transform: rotate(45deg);
        }
        .menu-open .mobile-menu-btn__line:last-child {
          width: 24px;
          transform: rotate(-45deg);
        }
        .mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 1050;
          visibility: hidden;
          pointer-events: none;
          clip-path: circle(0% at calc(100% - 2.6rem) 2.6rem);
          background: radial-gradient(
              circle at 85% 10%,
              rgba(22, 163, 74, 0.35),
              transparent 55%
            ),
            #0b0f19;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 2rem 3rem;
        }
        .mobile-menu__links {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .mobile-link {
          display: block;
          overflow: hidden;
          text-decoration: none;
          font-family: "Outfit", sans-serif;
          font-size: clamp(2.25rem, 10vw, 3.25rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .mobile-link-inner {
          display: inline-flex;
          align-items: baseline;
          gap: 0.85rem;
          transition: color 0.25s ease;
        }
        .mobile-link:hover .mobile-link-inner,
        .mobile-link.is-active .mobile-link-inner {
          color: #4ade80;
        }
        .mobile-link__index {
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }
        .mobile-menu-foot {
          margin-top: 2.5rem;
        }
        @media (min-width: 768px) {
          .desktop-nav,
          .desktop-cta {
            display: flex;
          }
          .mobile-menu-btn,
          .mobile-menu {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
