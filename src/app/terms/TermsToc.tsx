"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger, motionEnabled } from "@/lib/motion";

interface TermsTocProps {
  sections: { id: string; title: string }[];
}

/** Sticky contents list that highlights the section currently being read. */
export default function TermsToc({ sections }: TermsTocProps) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const triggers = sections.flatMap(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return [];
      return [
        ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => self.isActive && setActive(id),
        }),
      ];
    });
    return () => triggers.forEach((t) => t.kill());
  }, [sections]);

  return (
    <nav className="legal-toc" aria-label="Contents">
      <p className="legal-toc__title">Contents</p>
      <ol>
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={active === section.id ? "is-active" : undefined}
              aria-current={active === section.id ? "location" : undefined}
              onClick={() => {
                // Without Lenis (reduced motion) the browser jumps natively.
                if (!motionEnabled()) setActive(section.id);
              }}
            >
              <span className="legal-toc__num">{String(i + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
      <button type="button" className="legal-toc__print" onClick={() => window.print()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 14h12v8H6z" />
        </svg>
        Print or save as PDF
      </button>
    </nav>
  );
}
