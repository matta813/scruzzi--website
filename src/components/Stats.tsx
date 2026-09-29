"use client";

import { useRef } from "react";
import { stats } from "@/content/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);

// Odometer-style counters: each digit column rolls to its value when scrolled into view.
export function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reels = gsap.utils.toArray<HTMLElement>("[data-reel]");
      if (prefersReducedMotion()) {
        reels.forEach((reel) => gsap.set(reel, { yPercent: -Number(reel.dataset.digit) * 10 }));
        return;
      }
      reels.forEach((reel, index) => {
        gsap.fromTo(
          reel,
          { yPercent: 0 },
          {
            yPercent: -Number(reel.dataset.digit) * 10 - 0,
            duration: 1.8,
            delay: index * 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: root.current, start: "top 75%" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Kennzahlen" className="relative px-4 py-24 md:px-8 md:py-32">
      <ul className="grid grid-cols-2 gap-y-14 md:grid-cols-5">
        {stats.map((stat, index) => {
          const digits = String(stat.value).padStart(2, "0").split("");
          return (
            <li key={stat.label} className={`pl-3 md:pl-4 ${index === 0 ? "md:col-start-2" : ""}`}>
              <p className="sr-only">
                {stat.value} {stat.label}
              </p>
              <div aria-hidden="true" className="display flex h-[0.86em] overflow-hidden text-[clamp(4.5rem,9vw,8rem)] text-bone">
                {digits.map((digit, position) => (
                  <span key={position} className="relative block h-full w-[0.5em]">
                    <span data-reel data-digit={digit} className="absolute inset-x-0 top-0 flex flex-col">
                      {DIGITS.map((value) => (
                        <span key={value} className="block h-[0.86em]">
                          {value}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </div>
              <p aria-hidden="true" className="micro mt-4">
                {stat.label}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
