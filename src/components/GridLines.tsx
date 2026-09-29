"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const TICKS = ["top-[22%]", "top-[48%]", "top-[31%]", "top-[67%]", "top-[14%]"];

// Fixed five-column rule lines with small signal ticks drifting on scroll.
export function GridLines() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-tick]").forEach((tick, index) => {
        gsap.to(tick, {
          yPercent: (index % 2 ? -1 : 1) * 900,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 px-4 md:px-8">
      <div className="grid h-full grid-cols-2 border-r border-line md:grid-cols-5">
        {TICKS.map((position, index) => (
          <span key={position} className={`relative border-l border-line ${index > 1 ? "hidden md:block" : ""}`}>
            <span data-tick className={`absolute -left-px h-1.5 w-0.5 bg-signal ${position}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
