"use client";

import { useRef, useState } from "react";
import { operations } from "@/content/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { SectionHead } from "./SectionHead";

type Operation = (typeof operations)[number];

function SystemButton({
  item,
  index,
  active,
  onSelect,
}: {
  item: Operation;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-controls="ops-stage"
      onClick={onSelect}
      className={`cut flex w-60 shrink-0 lg:w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-300 ${
        active ? "bg-bone text-ink" : "bg-panel text-bone hover:bg-line"
      }`}
    >
      <span className={`micro ${active ? "text-ink/60" : ""}`}>{String(index + 1).padStart(2, "0")}</span>
      <span className="flex flex-col">
        <span className="font-display text-lg leading-tight font-semibold tracking-wide uppercase">{item.short}</span>
        <span className={`micro ${active ? "text-ink/60" : ""}`}>{item.tag}</span>
      </span>
    </button>
  );
}

export function Operations() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const current = operations[active];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-stage-dot]", { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "expo.out" });
      gsap.fromTo("[data-stage-copy]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", delay: 0.1 });
    },
    { scope: root, dependencies: [active] },
  );

  const left = operations.slice(0, 3);
  const right = operations.slice(3);

  return (
    <section ref={root} id="betrieb" aria-labelledby="betrieb-title" className="relative px-4 py-24 md:px-8 md:py-36">
      <SectionHead id="betrieb-title" chip="Homelab" title="Was ich betreue" align="center" />

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-0">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pr-6">
          {left.map((item, index) => (
            <SystemButton key={item.id} item={item} index={index} active={active === index} onSelect={() => setActive(index)} />
          ))}
          {right.map((item, index) => (
            <div key={item.id} className="contents lg:hidden">
              <SystemButton item={item} index={index + 3} active={active === index + 3} onSelect={() => setActive(index + 3)} />
            </div>
          ))}
        </div>

        <div id="ops-stage" aria-live="polite" className="relative lg:col-span-3 lg:px-6">
          <div className="relative flex aspect-[16/8] items-center justify-center border border-line">
            {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-right-1 -bottom-1"].map((corner) => (
              <span key={corner} aria-hidden="true" className={`absolute size-2 bg-bone/40 ${corner}`} />
            ))}
            <p data-stage-dot aria-hidden="true" className="dot-text text-[clamp(4rem,11vw,10rem)] [--dot-size:6px]">
              {current.dot}
            </p>
          </div>
          <article data-stage-copy className="mx-auto mt-8 max-w-[40rem] text-center">
            <h3 className="display mb-4 text-4xl text-bone">{current.title}</h3>
            <p className="text-mute">{current.text}</p>
            <p className="mt-6 inline-flex flex-col items-center gap-1 border-t border-line pt-4">
              <strong className="micro text-lime">Ergebnis</strong>
              <span className="text-bone">{current.result}</span>
            </p>
          </article>
        </div>

        <div className="hidden flex-col gap-2 pl-6 lg:flex">
          {right.map((item, index) => (
            <SystemButton key={item.id} item={item} index={index + 3} active={active === index + 3} onSelect={() => setActive(index + 3)} />
          ))}
        </div>
      </div>

      <noscript>
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {operations.map((item) => (
            <li key={item.id}>
              <h3 className="display text-3xl text-bone">{item.title}</h3>
              <p className="text-mute">{item.text}</p>
              <p className="text-bone">Ergebnis: {item.result}</p>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
