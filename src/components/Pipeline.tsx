"use client";

import { useRef } from "react";
import { pipeline } from "@/content/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { SectionHead } from "./SectionHead";

// The deployment path, drawn as a circuit trace that fills while scrolling.
export function Pipeline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-trace]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-flow]", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.from("[data-node]", {
        autoAlpha: 0,
        y: 30,
        stagger: 0.12,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-flow]", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="pipeline-title" className="relative px-4 py-24 md:px-8 md:py-36">
      <SectionHead id="pipeline-title" chip="Diese Website" title="Vom Commit zum Release" />

      <div data-flow className="relative">
        <div aria-hidden="true" className="absolute top-8 right-0 left-0 hidden h-px bg-line md:block">
          <div data-trace className="h-full origin-left bg-lime" />
        </div>
        <ol className="grid gap-3 md:grid-cols-4 md:gap-6">
          {pipeline.map((step, index) => (
            <li key={step.name} data-node className="relative">
              <span aria-hidden="true" className="relative z-10 mb-8 hidden size-4 translate-y-6 bg-lime md:block" />
              <div className="cut-br border-l-2 border-lime bg-panel p-6">
                <span className="micro">{String(index + 1).padStart(2, "0")}</span>
                <p className="display mt-6 text-4xl text-bone">{step.name}</p>
                <p className="micro mt-2">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
