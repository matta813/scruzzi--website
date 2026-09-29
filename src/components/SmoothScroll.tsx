"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { introReady } from "@/lib/intro";

// Inertia scrolling driven by the GSAP ticker so ScrollTrigger stays in sync.
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Tuned to match the reference site: a wheel tick of 100 travels ~75px
    // and eases out over roughly 1.5s.
    const lenis = new Lenis({ lerp: 0.05, wheelMultiplier: 0.75, anchors: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);

    // Hold the page still behind the boot screen.
    if (document.documentElement.classList.contains("is-loading")) {
      lenis.stop();
      introReady.then(() => lenis.start());
    }

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
