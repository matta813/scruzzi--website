"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { introReady } from "@/lib/intro";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/<>0123456789";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
};

// Decodes text from random glyphs once the intro starts. Screen readers get the plain text.
export function Scramble({ text, className, delay = 0, duration = 1 }: Props) {
  const visual = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = visual.current;
    if (!el || prefersReducedMotion()) return;

    let tween: gsap.core.Tween | undefined;
    let cancelled = false;
    const chars = [...text];
    const random = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const paint = (progress: number) => {
      const nodes: Node[] = [];
      chars.forEach((char, index) => {
        const threshold = index / chars.length;
        if (char === " " || progress >= threshold + 0.12) {
          nodes.push(document.createTextNode(char));
        } else {
          const span = document.createElement("span");
          span.className = progress >= threshold ? "text-lime" : "text-lime-deep/60";
          span.textContent = random();
          nodes.push(span);
        }
      });
      el.replaceChildren(...nodes);
    };

    paint(0);
    introReady.then(() => {
      if (cancelled) return;
      const state = { p: 0 };
      tween = gsap.to(state, {
        p: 1.12,
        duration,
        delay,
        ease: "power1.inOut",
        onUpdate: () => paint(state.p),
        onComplete: () => el.replaceChildren(document.createTextNode(text)),
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      el.replaceChildren(document.createTextNode(text));
    };
  }, [text, delay, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={visual} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
