"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, motionEnabled } from "@/lib/motion";

/*
 * Pointer interactions for mouse users, opted into with data attributes:
 *
 *   data-magnetic="0.35"   element is pulled toward the pointer (strength 0–1)
 *   data-tilt              element tilts in 3D to face the pointer
 *   data-cursor="View"     a labelled bubble follows the pointer over it
 *
 * Disabled on touch devices, for reduced motion and in /admin.
 */

type Quick = (value: number) => void;

export default function Interactions() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (
      !cursor ||
      isAdmin ||
      !motionEnabled() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const html = document.documentElement;
    html.classList.add("has-cursor");

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" });

    const magnets = new WeakMap<HTMLElement, { x: Quick; y: Quick }>();
    const tilts = new WeakMap<HTMLElement, { rx: Quick; ry: Quick }>();
    let activeMagnet: HTMLElement | null = null;
    let activeTilt: HTMLElement | null = null;
    let visible = false;
    let lastLabel: string | undefined;

    const releaseMagnet = (el: HTMLElement) =>
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
    const releaseTilt = (el: HTMLElement) =>
      gsap.to(el, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.5)",
        overwrite: true,
        onComplete: () => gsap.set(el, { clearProps: "transform" }),
      });

    let lastX = -1;
    let lastY = -1;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!visible) {
        visible = true;
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
      }
      cursorX(e.clientX);
      cursorY(e.clientY);
      update(e.target as Element, e.clientX, e.clientY);
    };

    // Scrolling moves the page under a still pointer, so re-check what it's over.
    let scrollFrame = 0;
    const onScroll = () => {
      if (!visible || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const el = document.elementFromPoint(lastX, lastY);
        if (el) update(el, lastX, lastY);
      });
    };

    const update = (target: Element, clientX: number, clientY: number) => {

      // Cursor label
      const label = target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      if (label !== lastLabel) {
        lastLabel = label;
        if (label && labelRef.current) labelRef.current.textContent = label;
        cursor.classList.toggle("has-label", Boolean(label));
      }

      // Magnetic pull
      const magnet = target.closest<HTMLElement>("[data-magnetic]");
      if (magnet !== activeMagnet) {
        if (activeMagnet) releaseMagnet(activeMagnet);
        activeMagnet = magnet;
      }
      if (magnet) {
        let quick = magnets.get(magnet);
        if (!quick) {
          quick = {
            x: gsap.quickTo(magnet, "x", { duration: 0.6, ease: "power3.out" }),
            y: gsap.quickTo(magnet, "y", { duration: 0.6, ease: "power3.out" }),
          };
          magnets.set(magnet, quick);
        }
        const rect = magnet.getBoundingClientRect();
        const strength = Number(magnet.dataset.magnetic) || 0.35;
        // Measure from the element's resting centre, not its pulled position.
        const cx = rect.left + rect.width / 2 - (gsap.getProperty(magnet, "x") as number);
        const cy = rect.top + rect.height / 2 - (gsap.getProperty(magnet, "y") as number);
        quick.x((clientX - cx) * strength);
        quick.y((clientY - cy) * strength);
      }

      // 3D tilt
      const tilt = target.closest<HTMLElement>("[data-tilt]");
      if (tilt !== activeTilt) {
        if (activeTilt) releaseTilt(activeTilt);
        activeTilt = tilt;
        if (tilt) gsap.set(tilt, { transformPerspective: 1000 });
      }
      if (tilt) {
        let quick = tilts.get(tilt);
        if (!quick) {
          quick = {
            rx: gsap.quickTo(tilt, "rotationX", { duration: 0.5, ease: "power2.out" }),
            ry: gsap.quickTo(tilt, "rotationY", { duration: 0.5, ease: "power2.out" }),
          };
          tilts.set(tilt, quick);
        }
        const rect = tilt.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;
        quick.ry(px * 10);
        quick.rx(-py * 10);
      }
    };

    const onLeaveWindow = () => {
      visible = false;
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
      if (activeMagnet) releaseMagnet(activeMagnet);
      if (activeTilt) releaseTilt(activeTilt);
      activeMagnet = activeTilt = null;
    };
    const onDown = () => cursor.classList.add("is-down");
    const onUp = () => cursor.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.classList.remove("has-cursor");
      gsap.set(cursor, { opacity: 0 });
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <div ref={cursorRef} className="cursor" aria-hidden="true">
      <div className="cursor__inner">
        <span ref={labelRef} className="cursor__label" />
      </div>
    </div>
  );
}
