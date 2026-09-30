"use client";

import { useRef } from "react";
import { hero, manifesto, site } from "@/content/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { introReady } from "@/lib/intro";
import { DitherPortrait } from "./DitherPortrait";
import { Scramble } from "./Scramble";

// Hero and manifesto share one sticky visual that stays while the text scrolls past.
export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const intro = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out", duration: 1.4 } })
        .from("[data-hero-fade]", { autoAlpha: 0, y: 16, stagger: 0.05, duration: 1 }, 0.1)
        .from("[data-visual]", { autoAlpha: 0, scale: 1.06, duration: 2.4 }, 0);
      introReady.then(() => intro.play());

      gsap.to("[data-hero-copy]", {
        yPercent: -18,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: "#top", start: "top top", end: "bottom 35%", scrub: true },
      });

      gsap.fromTo(
        "[data-word]",
        { opacity: 0.4 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: "[data-manifesto]", start: "top 85%", end: "bottom 60%", scrub: true },
        },
      );

      gsap.from("[data-aside]", {
        yPercent: 110,
        ease: "expo.out",
        duration: 1.2,
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-manifesto]", start: "bottom 90%" },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div data-visual className="absolute top-[12%] right-[-20%] bottom-0 w-[95%] opacity-60 md:right-[4%] md:w-[52%] md:opacity-100">
            <DitherPortrait />
          </div>
        </div>
      </div>

      <section id="top" aria-label="Einleitung" className="relative min-h-svh px-4 pt-24 pb-8 md:px-8 md:pt-28">
        <div data-hero-copy className="grid min-h-[calc(100svh-8.5rem)] grid-cols-2 grid-rows-[auto_1fr_auto] gap-y-10 md:grid-cols-5 md:min-h-[calc(100svh-9rem)]">
          <a
            data-hero-fade
            href={`mailto:${site.email}`}
            className="micro col-span-2 flex max-w-[34rem] flex-col gap-1 border-l-2 border-lime pl-4 hover:text-bone md:pl-4"
          >
            <span className="flex justify-between">
              <span>E-Mail</span>
              <Scramble text={site.email} className="text-bone" duration={0.9} />
            </span>
            <span className="flex justify-between">
              <span>GitHub</span>
              <Scramble text="matta813" className="text-bone" duration={0.9} delay={0.1} />
            </span>
          </a>

          <p data-hero-fade className="col-start-5 hidden items-start justify-between md:flex">
            <span className="micro">Aus</span>
            <Scramble text={site.country} className="display -mt-2 text-[clamp(4rem,8vw,7.5rem)] leading-[0.8] text-bone" delay={0.2} />
          </p>

          <p
            data-hero-fade
            className="col-span-2 max-w-[36rem] self-start text-justify text-[1.05rem] leading-[1.6] text-mute [text-indent:40%] md:text-[1.3rem] md:leading-[1.55]"
          >
            {hero.intro.before} <em className="text-signal italic">{hero.intro.red}</em> {hero.intro.middle}{" "}
            <code className="font-sans text-lime">{hero.intro.code}</code>. {hero.intro.after}
          </p>

          <div className="relative col-span-2 row-start-3 md:col-span-4">
            <p data-hero-fade className="chip mb-5">
              {site.role}
            </p>
            <p data-hero-fade className="micro mb-2 md:absolute md:top-28 md:left-0">
              {hero.noteTop}
            </p>
            <h1 className="display text-[clamp(4.2rem,15vw,10.5rem)] text-bone">
              <Scramble text={site.firstName} className="block md:pl-[25%]" duration={1.2} />
              <Scramble text={site.lastName} className="block" duration={1.4} delay={0.1} />
            </h1>
            <p data-hero-fade className="micro mt-3 md:absolute md:bottom-2 md:left-[62%] md:mt-0">
              {hero.noteBottom}
            </p>
            <p className="display absolute right-0 bottom-0 hidden text-5xl text-bone md:block md:right-[4%]">
              <Scramble text={hero.stamp} delay={0.4} />
            </p>
          </div>

          <p
            data-hero-fade
            aria-hidden="true"
            className="micro absolute right-2 bottom-24 hidden [writing-mode:vertical-rl] md:block"
          >
            Scrollen
          </p>
        </div>
      </section>

      <section aria-label="Haltung" className="relative px-4 pt-[20svh] pb-[30svh] md:px-8">
        <div className="grid md:grid-cols-5">
          <p
            data-manifesto
            className="display text-justify text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.95] text-bone md:col-span-2 [text-align-last:justify]"
          >
            {manifesto.text.split(" ").map((word, index) => (
              <span key={index} data-word>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
        <p className="display mt-16 text-right text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.95] text-bone md:mt-24 md:mr-[12%]">
          {manifesto.aside.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span data-aside className="block">
                {line}
              </span>
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
