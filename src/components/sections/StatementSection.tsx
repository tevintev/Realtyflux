"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, motionEnabled } from "@/lib/motion";

interface StatementSectionProps {
  label: string;
  text: string;
}

/** Pinned statement whose words light up one by one as you scroll. */
export default function StatementSection({ label, text }: StatementSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!motionEnabled() || !textRef.current) return;
      const split = SplitText.create(textRef.current, {
        type: "words",
        wordsClass: "statement__word",
      });

      const tl = gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 0.6,
          },
        })
        .fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none" }, 0);
      // Progress bar spans the whole word sequence.
      tl.fromTo(
        ".statement__progress-bar",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", duration: tl.duration() },
        0
      );

      return () => split.revert();
    },
    { scope: sectionRef, dependencies: [text] }
  );

  return (
    // Block wrapper: ScrollTrigger skips pin spacing when the pinned element's
    // parent is a flex container.
    <div>
      <section ref={sectionRef} className="statement">
        <div className="container-custom statement__inner">
          <span className="section-label">{label}</span>
          <p ref={textRef} className="statement__text">
            {text}
          </p>
          <div className="statement__progress" aria-hidden="true">
            <span className="statement__progress-bar" />
          </div>
        </div>
      </section>
    </div>
  );
}
