"use client";

import { useRef } from "react";
import { projects } from "@/content/site";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

const OFFSETS = ["lg:mt-0", "lg:mt-[22vh]", "lg:mt-[6vh]"];

// Lime "snapshot" board: pinned on large screens and panned horizontally by scroll.
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="projekte"
      data-surface="lime"
      aria-labelledby="projekte-title"
      className="relative z-10 overflow-hidden bg-lime text-ink lg:h-svh"
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden size-full lg:block" preserveAspectRatio="none" viewBox="0 0 1000 100">
        <path d="M0 62 H90 L110 48 H300 L330 70 H520 L545 40 H760 L790 58 H1000" fill="none" stroke="rgb(3 3 3 / 0.28)" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
      </svg>

      <div ref={track} className="relative flex h-full flex-col gap-12 px-4 pt-28 pb-20 md:px-8 lg:w-max lg:flex-row lg:items-start lg:gap-[8vw] lg:pt-32 lg:pb-0">
        <header className="lg:w-[34vw] lg:shrink-0 lg:pt-[8vh]">
          <p className="chip chip-dark">Open Source</p>
          <h2 id="projekte-title" className="display mt-5 text-[clamp(3rem,7vw,7rem)] text-ink">
            Öffentliche Arbeits&shy;proben
          </h2>
          <p className="mt-6 max-w-[26rem] text-ink/75">Drei Projekte, deren Architektur und Umsetzung im Quellcode nachvollziehbar sind.</p>
        </header>

        {projects.map((project, index) => (
          <article key={project.name} className={`group w-full shrink-0 lg:w-[30vw] ${OFFSETS[index]}`}>
            <a href={project.href} rel="noopener noreferrer" className="block">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.98]">
                <p aria-hidden="true" className="dot-text text-[clamp(4rem,9vw,8rem)] [--dot-color:var(--color-lime)] [--dot-size:6px]">
                  {project.dot}
                </p>
                <span className="chip absolute bottom-4 left-4">{project.tag}</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-b border-ink/30 pb-3">
                <h3 className="font-display text-2xl font-semibold tracking-wide uppercase">{project.name}</h3>
                <span className="font-display text-xs font-semibold tracking-[0.2em] uppercase">
                  Code <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
            <p className="mt-3 max-w-[28rem] text-[0.95rem] text-ink/75">{project.text}</p>
          </article>
        ))}
        <div aria-hidden="true" className="hidden w-[6vw] shrink-0 lg:block" />
      </div>
    </section>
  );
}
