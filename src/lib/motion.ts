"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };

// Animated elements are hidden by CSS only while <html> has the `motion`
// class (set before paint by MOTION_BOOT_SCRIPT in ./motion-boot), so
// reduced-motion users and the admin area always see static content.
export function motionEnabled() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("motion")
  );
}

// Fire when the element's top crosses 88% of the viewport. Elements already
// above that line on load start negative (so they play immediately), and
// elements near the very bottom are capped just below max scroll so they
// still play even if the page can't scroll far enough to reach the line.
export function revealStart(self: ScrollTrigger) {
  const el = self.trigger as Element;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.min(
    top - window.innerHeight * 0.88,
    ScrollTrigger.maxScroll(window) - 1
  );
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Lenis instance shared between the provider and components that need to
// pause scrolling (mobile menu, lightboxes).
let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}

// True while the page-transition curtain covers the screen, so intro
// animations on the incoming page can wait for it to lift.
let pageTransitioning = false;

export function setPageTransitioning(value: boolean) {
  pageTransitioning = value;
}

export function isPageTransitioning() {
  return pageTransitioning;
}

const scrollLocks = new Set<string>();

export function lockScroll(key: string, locked: boolean) {
  if (locked) scrollLocks.add(key);
  else scrollLocks.delete(key);

  const shouldLock = scrollLocks.size > 0;
  if (lenisInstance) {
    if (shouldLock) lenisInstance.stop();
    else lenisInstance.start();
  }
  document.body.style.overflow = shouldLock ? "hidden" : "";
}
