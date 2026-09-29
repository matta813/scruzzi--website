"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const CELL = 5; // CSS pixels per RGB dot cell
const FRAME_MS = 1000 / 24;

type Led = { index: number; phase: number; speed: number };

type Props = {
  /** Optional photo; without it a server rack is drawn procedurally. */
  src?: string;
  className?: string;
};

// Renders a source image as an RGB sub-pixel dot matrix, like a close-up of an LED panel.
export function DitherPortrait({ src, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const source = document.createElement("canvas");
    const sctx = source.getContext("2d", { willReadFrequently: true })!;
    const reduce = prefersReducedMotion();

    let cols = 0;
    let rows = 0;
    let luminance = new Float32Array(0);
    let leds: Led[] = [];
    let frame: ImageData | null = null;
    let image: HTMLImageElement | null = null;
    let visible = true;
    let raf = 0;
    let last = 0;
    const pointer = { x: -999, y: -999 };

    const drawRack = (W: number, H: number) => {
      sctx.fillStyle = "#000";
      sctx.fillRect(0, 0, W, H);
      leds = [];

      const x0 = Math.round(W * 0.24);
      const x1 = Math.round(W * 0.76);
      const y0 = Math.round(H * 0.1);
      const y1 = H + 2;
      const depth = Math.round(W * 0.09);

      // Side panel for depth
      const side = sctx.createLinearGradient(x1, 0, x1 + depth, 0);
      side.addColorStop(0, "#4a4a4a");
      side.addColorStop(1, "#070707");
      sctx.fillStyle = side;
      sctx.beginPath();
      sctx.moveTo(x1, y0);
      sctx.lineTo(x1 + depth, y0 + depth * 0.55);
      sctx.lineTo(x1 + depth, y1);
      sctx.lineTo(x1, y1);
      sctx.closePath();
      sctx.fill();

      // Frame and dark interior
      sctx.fillStyle = "#6a6a6a";
      sctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      const inset = Math.max(2, Math.round(W * 0.025));
      sctx.fillStyle = "#070707";
      sctx.fillRect(x0 + inset, y0 + inset, x1 - x0 - inset * 2, y1 - y0 - inset);

      const units = 7;
      const top = y0 + inset * 2;
      const unitGap = Math.max(1, Math.round(H * 0.012));
      const unitH = Math.floor((H - top - unitGap * units) / units);
      const ux0 = x0 + inset * 2;
      const ux1 = x1 - inset * 2;

      for (let u = 0; u < units; u++) {
        const uy = top + u * (unitH + unitGap);
        const face = sctx.createLinearGradient(0, uy, 0, uy + unitH);
        face.addColorStop(0, "#a8a8a8");
        face.addColorStop(0.2, "#6e6e6e");
        face.addColorStop(1, "#2a2a2a");
        sctx.fillStyle = face;
        sctx.fillRect(ux0, uy, ux1 - ux0, unitH);

        // Rack ears
        sctx.fillStyle = "#b5b5b5";
        sctx.fillRect(ux0 - inset, uy + 1, inset, unitH - 2);
        sctx.fillRect(ux1, uy + 1, inset, unitH - 2);

        const width = ux1 - ux0;
        // Vent slits
        sctx.fillStyle = "#0c0c0c";
        for (let x = ux0 + 3; x < ux0 + width * 0.52; x += 2) {
          sctx.fillRect(x, uy + Math.round(unitH * 0.28), 1, Math.round(unitH * 0.5));
        }
        // Drive bays
        const bayY = uy + Math.round(unitH * 0.25);
        const bayH = Math.max(2, Math.round(unitH * 0.5));
        for (let x = ux0 + Math.round(width * 0.58); x < ux0 + width * 0.86; x += 4) {
          sctx.fillStyle = u % 2 ? "#c2c2c2" : "#9a9a9a";
          sctx.fillRect(x, bayY, 3, bayH);
        }
        // Status LEDs, animated per frame
        for (let l = 0; l < 2; l++) {
          const lx = Math.round(ux0 + width * 0.91 + l * 3);
          const ly = Math.round(uy + unitH * 0.45);
          leds.push({ index: ly * W + lx, phase: Math.random() * 6.28, speed: 0.6 + Math.random() * 3 });
        }
      }

      // Hanging cables on the right
      sctx.strokeStyle = "#5a5a5a";
      sctx.lineWidth = 1;
      for (let c = 0; c < 4; c++) {
        sctx.beginPath();
        sctx.moveTo(x1 - inset, top + c * unitH * 1.6 + unitH * 0.5);
        sctx.bezierCurveTo(x1 + depth * 1.6, top + c * unitH * 1.7 + unitH * 2, x1 + depth * 0.4, H * 0.8, x1 + depth * (1.2 + c * 0.25), H);
        sctx.stroke();
      }

      // Key light from the upper left
      sctx.globalCompositeOperation = "lighter";
      const key = sctx.createRadialGradient(W * 0.18, H * 0.2, 0, W * 0.18, H * 0.2, W * 0.75);
      key.addColorStop(0, "rgba(255,255,255,0.35)");
      key.addColorStop(1, "rgba(255,255,255,0)");
      sctx.fillStyle = key;
      sctx.fillRect(0, 0, W, H);
      sctx.globalCompositeOperation = "source-over";
    };

    const drawImage = (W: number, H: number, img: HTMLImageElement) => {
      sctx.fillStyle = "#000";
      sctx.fillRect(0, 0, W, H);
      const scale = Math.max(W / img.width, H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      sctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      leds = [];
    };

    const buildSource = () => {
      if (!cols || !rows) return;
      source.width = cols;
      source.height = rows;
      if (image) drawImage(cols, rows, image);
      else drawRack(cols, rows);

      const data = sctx.getImageData(0, 0, cols, rows).data;
      luminance = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const nx = (x / cols - 0.5) * 2;
          const ny = (y / rows - 0.45) * 2;
          const vignette = Math.max(0, 1 - (nx * nx * 1.05 + ny * ny * 1.15) ** 1.6);
          const raw = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
          // Crush the black floor, then lift mid-tones so the dots read clearly.
          luminance[i] = Math.min(1, Math.max(0, raw - 0.08) * 1.5) ** 0.75 * vignette;
        }
      }
    };

    const render = (time: number) => {
      if (!frame) return;
      const px = frame.data;
      const width = cols * CELL;
      const scanY = ((time / 45) % (rows + 40)) - 20;
      const ledOn = new Set<number>();
      for (const led of leds) if (Math.sin(time / 1000 * led.speed + led.phase) > 0.1) ledOn.add(led.index);

      for (let y = 0; y < rows; y++) {
        const scan = 0.12 * Math.exp(-(((y - scanY) / 2.5) ** 2));
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          let l = luminance[i];
          if (ledOn.has(i)) l = 1;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          l += (0.18 + l) * 0.9 * Math.exp(-(dx * dx + dy * dy) / 160);
          l += scan * (l > 0.02 ? 1 : 0);
          if (l > 1) l = 1;

          // Colour drifts from lime-green light on the left to violet/red shadow on the right.
          const t = x / cols;
          const led = ledOn.has(i);
          const r = led ? 90 : 255 * l * (0.3 + 0.9 * t);
          const g = led ? 255 : 255 * l * (1.15 - 0.75 * t);
          const b = led ? 60 : 255 * l * (0.35 + 0.85 * t * (1 - y / rows * 0.4));

          const ox = x * CELL;
          const oy = y * CELL;
          for (let sy = 0; sy < CELL - 1; sy++) {
            const row = ((oy + sy) * width + ox) * 4;
            px[row] = r; // red sub-pixel
            px[row + 5] = g; // green sub-pixel
            px[row + 10] = b; // blue sub-pixel
          }
        }
      }
      ctx.putImageData(frame, 0, 0);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cols = Math.max(1, Math.floor(rect.width / CELL));
      rows = Math.max(1, Math.floor(rect.height / CELL));
      canvas.width = cols * CELL;
      canvas.height = rows * CELL;
      frame = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 3; i < frame.data.length; i += 4) frame.data[i] = 255;
      buildSource();
      render(performance.now());
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || time - last < FRAME_MS) return;
      last = time;
      render(time);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / CELL;
      pointer.y = (event.clientY - rect.top) / CELL;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    visibility.observe(canvas);

    if (src) {
      const img = new Image();
      img.onload = () => {
        image = img;
        buildSource();
      };
      img.src = src;
    }

    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [src]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`block size-full [image-rendering:pixelated] ${className ?? ""}`} />;
}
