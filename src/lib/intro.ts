"use client";

// Resolves once the preloader starts revealing the page, so intro
// animations begin in sync with the pixel dissolve.
let resolveIntro: () => void = () => {};
let ready = false;

export const introReady = new Promise<void>((resolve) => {
  resolveIntro = resolve;
});

export function markIntroReady() {
  if (ready) return;
  ready = true;
  resolveIntro();
}
