"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const CIRCUMFERENCE = 2 * Math.PI * 27;

// Ring that trails the pointer; its lime arc shows page scroll progress.
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;

    const moveX = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      el.dataset.visible = "true";
      moveX(event.clientX);
      moveY(event.clientY);
      const interactive = (event.target as Element | null)?.closest("a, button");
      el.dataset.active = interactive ? "true" : "false";
    };
    const onLeave = () => (el.dataset.visible = "false");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      arc.current?.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - progress)));
    };

    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden="true"
      data-visible="false"
      className="pointer-events-none fixed top-0 left-0 z-50 -mt-7 -ml-7 hidden size-14 opacity-0 transition-[opacity,scale] duration-300 data-[active=true]:scale-150 data-[visible=true]:opacity-100 pointer-fine:block"
    >
      <svg viewBox="0 0 60 60" className="size-full -rotate-90">
        <circle cx="30" cy="30" r="27" fill="none" stroke="rgb(245 240 235 / 0.18)" strokeWidth="1" />
        <circle
          ref={arc}
          cx="30"
          cy="30"
          r="27"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="1.5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
    </div>
  );
}
