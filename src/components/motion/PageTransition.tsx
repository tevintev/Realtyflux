"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  gsap,
  ScrollTrigger,
  getLenis,
  lockScroll,
  motionEnabled,
  setPageTransitioning,
} from "@/lib/motion";
import { TransitionScene, sceneEnter, sceneExit, sceneIdle } from "./TransitionScene";

const ROUNDED_TOP = "50% 50% 0% 0% / 14vh 14vh 0vh 0vh";
const ROUNDED_BOTTOM = "0% 0% 50% 50% / 0vh 0vh 14vh 14vh";
const SQUARE = "0% 0% 0% 0% / 0vh 0vh 0vh 0vh";
// If the next page never commits (failed fetch, redirect back to the same
// path), lift the curtain anyway rather than leave the user stuck.
const SAFETY_TIMEOUT_MS = 6000;
// Playback speed for the whole curtain (cover + reveal). 1 = original
// timing; 1.25 plays everything 20% faster while keeping it in proportion.
const TRANSITION_SPEED = 1.25;

type Phase = "idle" | "covering" | "covered" | "revealing";

function shouldIntercept(e: MouseEvent): URL | null {
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  ) {
    return null;
  }
  const anchor = (e.target as Element | null)?.closest?.("a");
  if (!anchor || !anchor.href) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download") || anchor.dataset.transition === "off") {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Hash or query-only changes stay on the same page; no curtain.
  if (url.pathname === window.location.pathname) return null;
  // Files and API routes are not app pages.
  if (/\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.startsWith("/api")) {
    return null;
  }
  return url;
}

export default function PageTransition({ brand = "Realty Flux" }: { brand?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("idle");
  const fromPathRef = useRef<string | null>(null);
  const keepScrollRef = useRef(false);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stopIdleRef = useRef<(() => void) | null>(null);
  // Matches the navbar wordmark: everything after the first word is green.
  const accentFrom = brand.indexOf(" ");

  const reveal = useCallback(() => {
    const root = rootRef.current;
    if (!root || (phaseRef.current !== "covered" && phaseRef.current !== "covering")) {
      return;
    }
    clearTimeout(safetyRef.current);
    phaseRef.current = "revealing";

    if (!keepScrollRef.current) {
      window.scrollTo(0, 0);
      getLenis()?.scrollTo(0, { immediate: true, force: true });
    }
    lockScroll("page-transition", false);
    ScrollTrigger.refresh();

    const panels = root.querySelectorAll(".page-curtain__panel");
    const chars = root.querySelectorAll(".page-curtain__char");
    const tagline = root.querySelector(".page-curtain__tagline");

    gsap
      .timeline({
        onComplete: () => {
          stopIdleRef.current?.();
          stopIdleRef.current = null;
          phaseRef.current = "idle";
          setPageTransitioning(false);
          gsap.set(root, { visibility: "hidden", pointerEvents: "none" });
        },
      })
      .timeScale(TRANSITION_SPEED)
      .to(tagline, { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" })
      .to(
        chars,
        {
          yPercent: -110,
          duration: 0.45,
          ease: "expo.in",
          stagger: 0.015,
        },
        "<"
      )
      .addLabel("lift", "-=0.15")
      .to(
        [...panels].reverse(),
        {
          yPercent: -100,
          borderRadius: ROUNDED_BOTTOM,
          duration: 0.85,
          ease: "expo.inOut",
          stagger: 0.08,
        },
        "lift"
      )
      // The house and apartments split apart as the panel lifts.
      .add(sceneExit(root), "lift");
  }, []);

  const cover = useCallback(
    (url: URL) => {
      const root = rootRef.current;
      if (!root) return;
      phaseRef.current = "covering";
      fromPathRef.current = window.location.pathname;
      keepScrollRef.current = Boolean(url.hash);
      setPageTransitioning(true);
      lockScroll("page-transition", true);

      const panels = root.querySelectorAll(".page-curtain__panel");
      const chars = root.querySelectorAll(".page-curtain__char");
      const tagline = root.querySelector(".page-curtain__tagline");

      gsap
        .timeline({
          onStart: () => {
            stopIdleRef.current?.();
            stopIdleRef.current = null;
          },
          onComplete: () => {
            phaseRef.current = "covered";
            router.push(url.pathname + url.search + url.hash);
            safetyRef.current = setTimeout(reveal, SAFETY_TIMEOUT_MS);
          },
        })
        .timeScale(TRANSITION_SPEED)
        .set(root, { visibility: "visible", pointerEvents: "auto" })
        .fromTo(
          panels,
          { yPercent: 100, borderRadius: ROUNDED_TOP },
          {
            yPercent: 0,
            borderRadius: SQUARE,
            duration: 0.8,
            ease: "expo.inOut",
            stagger: 0.08,
          }
        )
        // The scene rises slower than its panel (parallax) while the house and
        // apartments slide in from either side.
        .add(sceneEnter(root), 0.08)
        // Start the ambient motion (bobbing, swaying, drifting leaves) as the
        // builds land, so it shows even on quick navigations.
        .call(() => {
          stopIdleRef.current = sceneIdle(root);
        }, undefined, 0.7)
        .fromTo(
          chars,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.025 },
          0.5
        )
        .fromTo(
          tagline,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" },
          "-=0.35"
        );
    },
    [router, reveal]
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!motionEnabled()) return;
      const url = shouldIntercept(e);
      if (!url) return;
      e.preventDefault();
      if (phaseRef.current === "idle") cover(url);
    };
    // Capture phase runs before next/link's handler, which then sees
    // defaultPrevented and leaves the navigation to us.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [cover]);

  useEffect(() => {
    if (phaseRef.current === "covered" && pathname !== fromPathRef.current) {
      // Give the new page one frame to lay out before lifting the curtain.
      requestAnimationFrame(reveal);
    }
  }, [pathname, reveal]);

  useEffect(
    () => () => {
      clearTimeout(safetyRef.current);
      stopIdleRef.current?.();
    },
    []
  );

  return (
    <div ref={rootRef} className="page-curtain" aria-hidden="true">
      <div className="page-curtain__panel page-curtain__panel--accent" />
      <div className="page-curtain__panel page-curtain__panel--main">
        <TransitionScene />
        <div className="page-curtain__shade" />
        <div className="page-curtain__brand">
          {brand.split("").map((char, i) => (
            <span key={i} className="page-curtain__char-mask">
              <span
                className={`page-curtain__char${
                  accentFrom > 0 && i >= accentFrom ? " is-accent" : ""
                }`}
              >
                {char === " " ? " " : char}
              </span>
            </span>
          ))}
        </div>
        <p className="page-curtain__tagline">Exceptional Homes. Extraordinary Living.</p>
      </div>
    </div>
  );
}
