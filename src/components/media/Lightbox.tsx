"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP, lockScroll, prefersReducedMotion } from "@/lib/motion";
import { isVideoFile } from "@/lib/image-path";

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Element the media should grow out of when the lightbox opens. */
  getOrigin?: (index: number) => Element | null;
}

const SWIPE_THRESHOLD = 50;

function whenMediaReady(media: Element, fn: () => void) {
  if (media instanceof HTMLImageElement && !media.complete) {
    gsap.set(media, { opacity: 0 });
    media.addEventListener(
      "load",
      () => {
        gsap.set(media, { opacity: 1 });
        fn();
      },
      { once: true }
    );
    return;
  }
  fn();
}

export default function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
  getOrigin,
}: LightboxProps) {
  const isOpen = index !== null && items.length > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(1);
  const hasOpenedRef = useRef(false);
  const closingRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lockScroll("lightbox", true);
    return () => lockScroll("lightbox", false);
  }, [isOpen]);

  const close = useCallback(() => {
    const root = rootRef.current;
    if (!root || closingRef.current) return;
    closingRef.current = true;
    gsap.to(root, {
      opacity: 0,
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.out",
      onComplete: () => {
        closingRef.current = false;
        hasOpenedRef.current = false;
        onClose();
      },
    });
  }, [onClose]);

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length < 2) return;
      directionRef.current = delta;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, go]);

  useGSAP(
    () => {
      if (!isOpen || index === null) {
        hasOpenedRef.current = false;
        return;
      }
      const root = rootRef.current!;
      const media = root.querySelector(".lightbox__media");
      if (!media) return;
      const reduce = prefersReducedMotion();

      if (!hasOpenedRef.current) {
        hasOpenedRef.current = true;
        gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.45 });
        gsap.fromTo(
          ".lightbox__chrome",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.35, stagger: 0.05, ease: "expo.out" }
        );

        // FLIP: start the media at the thumbnail's position and size, then
        // let it settle into its natural place in the stage.
        const origin = getOrigin?.(index);
        if (origin && !reduce) {
          whenMediaReady(media, () => {
            const from = origin.getBoundingClientRect();
            const to = media.getBoundingClientRect();
            if (!to.width || !to.height) return;
            gsap.from(media, {
              x: from.left - to.left,
              y: from.top - to.top,
              scaleX: from.width / to.width,
              scaleY: from.height / to.height,
              transformOrigin: "0 0",
              borderRadius: 16,
              duration: 0.9,
              ease: "expo.inOut",
              clearProps: "transform,borderRadius",
            });
          });
        }
        return;
      }

      if (reduce) return;
      gsap.fromTo(
        media,
        { xPercent: directionRef.current * 10, opacity: 0, scale: 0.96 },
        {
          xPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: "expo.out",
          clearProps: "transform",
        }
      );
    },
    { dependencies: [isOpen, index], scope: rootRef }
  );

  if (!isOpen || index === null || typeof document === "undefined") return null;

  const item = items[index];
  const isVideo = isVideoFile(item.src);

  return createPortal(
    <div
      ref={rootRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={close}
      data-lenis-prevent
    >
      <button
        type="button"
        className="lightbox__btn lightbox__close lightbox__chrome"
        onClick={close}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          pointerStartX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (pointerStartX.current === null) return;
          const dx = e.clientX - pointerStartX.current;
          pointerStartX.current = null;
          if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
        }}
      >
        {isVideo ? (
          <video
            key={item.src}
            className="lightbox__media lightbox__media--video"
            src={item.src}
            controls
            autoPlay
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.src}
            className="lightbox__media"
            src={item.src}
            alt={item.alt}
            draggable={false}
          />
        )}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--prev lightbox__chrome"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--next lightbox__chrome"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div className="lightbox__caption lightbox__chrome" onClick={(e) => e.stopPropagation()}>
        {item.caption && <strong>{item.caption}</strong>}
        <span>
          {index + 1} / {items.length}
        </span>
      </div>
    </div>,
    document.body
  );
}
