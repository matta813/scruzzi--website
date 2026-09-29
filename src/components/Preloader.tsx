"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { markIntroReady } from "@/lib/intro";

const CELL = 36;

// GSAP tweens are thenables that resolve to themselves, so awaiting them
// directly recurses; wrap them in a plain promise instead.
function play(vars: gsap.TweenVars, target: object) {
  return new Promise<void>((resolve) => {
    gsap.to(target, { ...vars, onComplete: () => resolve() });
  });
}

function pageLoaded() {
  return new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
}

// Lime boot screen: a frame closes in while loading, then the screen
// dissolves in pixel blocks from the centre outwards.
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const percent = useRef<HTMLParagraphElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const html = document.documentElement;
    html.classList.add("is-loading");
    window.scrollTo(0, 0);

    const reduce = prefersReducedMotion();
    const lines = {
      left: el.querySelector<HTMLElement>("[data-line='left']")!,
      right: el.querySelector<HTMLElement>("[data-line='right']")!,
      top: el.querySelector<HTMLElement>("[data-line='top']")!,
      bottom: el.querySelector<HTMLElement>("[data-line='bottom']")!,
    };
    const crosses = el.querySelectorAll<HTMLElement>("[data-cross]");
    const state = { p: 0 };
    let cancelled = false;

    const render = () => {
      const t = state.p / 100;
      const x = 3 + t * 41; // % from left/right edge
      const y = 3 + t * 40; // % from top/bottom edge
      gsap.set(lines.left, { left: `${x}%` });
      gsap.set(lines.right, { left: `${100 - x}%` });
      gsap.set(lines.top, { top: `${y}%` });
      gsap.set(lines.bottom, { top: `${100 - y}%` });
      crosses.forEach((cross) => {
        const [h, v] = (cross.dataset.cross ?? "0 0").split(" ").map(Number);
        gsap.set(cross, { left: `${h ? 100 - x : x}%`, top: `${v ? 100 - y : y}%` });
      });
      if (percent.current) percent.current.textContent = `${Math.round(state.p)}%`;
    };

    const dissolve = () =>
      new Promise<void>((resolve) => {
        const c = canvas.current!;
        const ctx = c.getContext("2d")!;
        const width = window.innerWidth;
        const height = window.innerHeight;
        c.width = width;
        c.height = height;
        const cols = Math.ceil(width / CELL);
        const rows = Math.ceil(height / CELL);
        const cx = width / 2;
        const cy = height / 2;
        const max = Math.hypot(cx, cy);
        const cells: { x: number; y: number; t: number }[] = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * CELL;
            const y = row * CELL;
            const distance = Math.hypot(x + CELL / 2 - cx, y + CELL / 2 - cy) / max;
            cells.push({ x, y, t: distance * 0.82 + Math.random() * 0.18 });
          }
        }

        const lime = getComputedStyle(document.documentElement).getPropertyValue("--color-lime").trim() || "#9cf02e";
        const draw = (q: number) => {
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = lime;
          for (const cell of cells) if (cell.t > q) ctx.fillRect(cell.x, cell.y, CELL, CELL);
        };

        draw(0);
        el.dataset.phase = "dissolve";
        const wipe = { q: 0 };
        gsap.to(wipe, {
          q: 1.02,
          duration: reduce ? 0.3 : 1.1,
          ease: "power1.in",
          onUpdate: () => {
            draw(wipe.q);
            if (wipe.q > 0.3) markIntroReady();
          },
          onComplete: resolve,
        });
      });

    const run = async () => {
      render();
      const assets = Promise.all([pageLoaded(), document.fonts?.ready ?? Promise.resolve()]);
      await play({ p: 86, duration: reduce ? 0.2 : 2.1, ease: "power2.inOut", onUpdate: render }, state);
      await assets;
      await play({ p: 100, duration: reduce ? 0.1 : 0.45, ease: "power1.out", onUpdate: render }, state);
      if (cancelled) return;
      await dissolve();
      if (cancelled) return;
      markIntroReady();
      html.classList.remove("is-loading");
      setDone(true);
    };

    run();
    return () => {
      cancelled = true;
      markIntroReady();
      html.classList.remove("is-loading");
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-phase="loading"
      className="preloader fixed inset-0 z-[100] overflow-hidden bg-lime text-ink data-[phase=dissolve]:bg-transparent"
    >
      <div className="preloader-frame absolute inset-0">
        <span data-line="left" className="absolute inset-y-0 left-[3%] w-px bg-lime-deep" />
        <span data-line="right" className="absolute inset-y-0 left-[97%] w-px bg-lime-deep" />
        <span data-line="top" className="absolute inset-x-0 top-[3%] h-px bg-lime-deep" />
        <span data-line="bottom" className="absolute inset-x-0 top-[97%] h-px bg-lime-deep" />
        {["0 0", "1 0", "0 1", "1 1"].map((position) => (
          <span
            key={position}
            data-cross={position}
            className="absolute -mt-[5px] -ml-[5px] size-[11px] font-display text-[11px] leading-[11px] text-ink"
          >
            <svg viewBox="0 0 11 11" className="size-full">
              <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
        ))}

        <svg viewBox="0 0 140 20" className="absolute top-0 left-1/2 h-5 w-36 -translate-x-1/2 text-lime-deep">
          <path d="M0 0 25 18h90L140 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 140 20" className="absolute bottom-0 left-1/2 h-5 w-36 -translate-x-1/2 rotate-180 text-lime-deep">
          <path d="M0 0 25 18h90L140 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 20 140" className="absolute top-1/2 left-0 h-36 w-5 -translate-y-1/2 text-lime-deep">
          <path d="M0 0 18 25v90L0 140" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 20 140" className="absolute top-1/2 right-0 h-36 w-5 -translate-y-1/2 rotate-180 text-lime-deep">
          <path d="M0 0 18 25v90L0 140" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <p ref={percent} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xl font-medium">
          0%
        </p>
      </div>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}
