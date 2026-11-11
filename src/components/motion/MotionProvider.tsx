"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  setLenis,
  prefersReducedMotion,
  revealStart,
} from "@/lib/motion";

/*
 * Declarative scroll animations. Any element (server or client rendered)
 * opts in with a data attribute:
 *
 *   data-reveal="up|down|left|right|scale|fade"  fade/slide in when scrolled into view
 *   data-reveal-delay="0.2"                      optional delay in seconds
 *   data-reveal-stagger                          children reveal one after another
 *   data-reveal-stagger="flip"                   ...flipping up in 3D from below
 *   data-reveal-stagger="sides"                  ...sliding in from alternating sides
 *   data-scrub-words                             words light up one by one with the scroll
 *   data-split                                   heading lines rise out of a mask
 *   data-parallax="15"                           drifts ±N% while its parent scrolls past
 *   data-img-reveal                              wipes open and settles the inner img/video
 *
 * A MutationObserver picks up elements that render after data loads, so
 * client-fetched content animates the same way as static markup.
 */

type Cleanup = () => void;


const REVEAL_FROM: Record<string, gsap.TweenVars> = {
  up: { y: 56 },
  down: { y: -40 },
  left: { x: -64 },
  right: { x: 64 },
  scale: { scale: 0.9, y: 24 },
  fade: {},
};

function markRevealed(targets: Element | Element[]) {
  (Array.isArray(targets) ? targets : [targets]).forEach((el) =>
    el.setAttribute("data-revealed", "")
  );
}

function killTween(tween: gsap.core.Animation) {
  tween.scrollTrigger?.kill();
  tween.kill();
}

function initReveal(el: HTMLElement): Cleanup {
  const from = REVEAL_FROM[el.dataset.reveal || "up"] ?? REVEAL_FROM.up;
  const tween = gsap.fromTo(
    el,
    { ...from, opacity: 0 },
    {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: "expo.out",
      delay: Number(el.dataset.revealDelay) || 0,
      clearProps: "transform,opacity",
      onComplete: () => markRevealed(el),
      scrollTrigger: { trigger: el, start: revealStart, once: true },
    }
  );
  return () => killTween(tween);
}

const STAGGER_FROM: Record<string, gsap.TweenVars> = {
  default: { y: 64, scale: 0.97 },
  flip: { y: 80, rotationX: -70, transformOrigin: "50% 0%", transformPerspective: 1000 },
  sides: { x: (i: number, el: Element) => sideOffset(el), rotation: (i: number, el: Element) => sideOffset(el) / 40 },
};

// Left half of the container slides in from the left, right half from the right.
function sideOffset(el: Element) {
  const parent = el.parentElement?.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  if (!parent) return 0;
  return rect.left + rect.width / 2 < parent.left + parent.width / 2 ? -140 : 140;
}

function initStagger(children: HTMLElement[], variant: string): Cleanup[] {
  const from = STAGGER_FROM[variant] ?? STAGGER_FROM.default;
  const triggers = ScrollTrigger.batch(children, {
    start: revealStart,
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, ...from },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.09,
          clearProps: "transform,opacity",
          onComplete: () => markRevealed(batch as Element[]),
        }
      );
    },
  });
  return triggers.map((trigger) => () => trigger.kill());
}

function initSplit(el: HTMLElement): Cleanup {
  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      markRevealed(el);
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: revealStart, once: true },
      });
    },
  });
  return () => split.revert();
}

function initScrubWords(el: HTMLElement): Cleanup {
  const split = SplitText.create(el, { type: "words", wordsClass: "scrub-word" });
  const tween = gsap.fromTo(
    split.words,
    { opacity: 0.18 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 0.5 },
    }
  );
  return () => {
    killTween(tween);
    split.revert();
  };
}

function initParallax(el: HTMLElement): Cleanup {
  const amount = Number(el.dataset.parallax) || 15;
  const tween = gsap.fromTo(
    el,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
  return () => {
    killTween(tween);
    gsap.set(el, { clearProps: "transform" });
  };
}

function initImgReveal(el: HTMLElement): Cleanup {
  const media = el.querySelector("img, video");
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: revealStart, once: true },
    onComplete: () => markRevealed(el),
  });
  tl.fromTo(
    el,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.4,
      ease: "expo.inOut",
      clearProps: "clipPath",
    }
  );
  if (media) {
    tl.fromTo(
      media,
      { scale: 1.3 },
      { scale: 1, duration: 1.8, ease: "expo.out", clearProps: "transform" },
      0
    );
  }
  return () => killTween(tl);
}

const registry = new Map<Element, Cleanup>();

// How many elements scan() has newly set up; a scan that finds nothing new
// needs no ScrollTrigger refresh.
let registered = 0;

function register(el: Element, init: () => Cleanup) {
  if (registry.has(el) || el.hasAttribute("data-revealed")) return;
  registry.set(el, init());
  registered++;
}

function scan() {
  for (const [el, cleanup] of registry) {
    if (!el.isConnected) {
      cleanup();
      registry.delete(el);
    }
  }

  document
    .querySelectorAll<HTMLElement>("[data-reveal]")
    .forEach((el) => register(el, () => initReveal(el)));

  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) =>
    register(el, () => initSplit(el))
  );

  document
    .querySelectorAll<HTMLElement>("[data-scrub-words]")
    .forEach((el) => register(el, () => initScrubWords(el)));

  document
    .querySelectorAll<HTMLElement>("[data-parallax]")
    .forEach((el) => register(el, () => initParallax(el)));

  document
    .querySelectorAll<HTMLElement>("[data-img-reveal]")
    .forEach((el) => register(el, () => initImgReveal(el)));

  const freshByVariant = new Map<string, HTMLElement[]>();
  document
    .querySelectorAll<HTMLElement>("[data-reveal-stagger] > *")
    .forEach((child) => {
      if (registry.has(child) || child.hasAttribute("data-revealed")) return;
      const variant = child.parentElement?.dataset.revealStagger || "default";
      freshByVariant.set(variant, [...(freshByVariant.get(variant) ?? []), child]);
    });
  for (const [variant, children] of freshByVariant) {
    const cleanups = initStagger(children, variant);
    children.forEach((child, i) => registry.set(child, cleanups[i]));
    registered += children.length;
  }
}

function teardownAll() {
  for (const cleanup of registry.values()) cleanup();
  registry.clear();
}

// A refresh re-wraps pinned sections and briefly resets scroll. The observers
// below report that as a page change, which scheduled another refresh, which
// changed the page again: a loop that ran for as long as the page was open
// (stuck snaps, flickering buttons, scrollTo(0) dozens of times a second).
// Reports that arrive right after a refresh are the refresh's own doing.
let quietUntil = 0;
let settledHeight = 0;

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    // Triggers are measured in creation order; reveals set up before a pin
    // that sits above them (e.g. the home showcase) would otherwise ignore
    // the pin's spacing. Sorting by page position fixes the order.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 150);
}

export default function MotionProvider() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (isAdmin || prefersReducedMotion()) {
      html.classList.remove("motion", "motion-live");
      return;
    }
    html.classList.add("motion", "motion-live");

    // Anchor jumps land below the fixed navbar.
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -110 } });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let frame = 0;
    const queueScan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const before = registered;
        scan();
        if (registered !== before) scheduleRefresh();
      });
    };
    scan();

    const onRefreshed = () => {
      quietUntil = performance.now() + 400;
      settledHeight = document.body.offsetHeight;
    };
    ScrollTrigger.addEventListener("refresh", onRefreshed);

    // Always scan: a page that mounts just after a refresh must still get its
    // headings and cards set up, or they stay hidden. Scanning is cheap and
    // only schedules a refresh when it finds something new, so the refresh's
    // own DOM changes cannot start a loop.
    const mutations = new MutationObserver(queueScan);
    mutations.observe(document.body, { childList: true, subtree: true });

    // Late-loading images and data change the page height; keep trigger
    // positions in sync with the real layout. Only a real change in height
    // counts, not the pin spacing a refresh itself adds and removes.
    const resizes = new ResizeObserver(() => {
      if (performance.now() < quietUntil) return;
      if (Math.abs(document.body.offsetHeight - settledHeight) < 2) return;
      scheduleRefresh();
    });
    resizes.observe(document.body);

    let progressTween: gsap.core.Tween | undefined;
    if (progressRef.current) {
      progressTween = gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        }
      );
    }

    return () => {
      cancelAnimationFrame(frame);
      ScrollTrigger.removeEventListener("refresh", onRefreshed);
      mutations.disconnect();
      resizes.disconnect();
      if (progressTween) killTween(progressTween);
      teardownAll();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [isAdmin]);

  useEffect(() => {
    scheduleRefresh();
  }, [pathname]);

  if (isAdmin) return null;

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" />;
}
