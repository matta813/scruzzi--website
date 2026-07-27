"use strict";

// --- Theme toggle -----------------------------------------------------------
const toggle = document.getElementById("theme-toggle");

toggle.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "light"));

toggle.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";

  document.body.classList.add("theme-switching");
  root.dataset.theme = next;
  toggle.setAttribute("aria-pressed", String(next === "light"));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.remove("theme-switching"));
  });

  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    /* private mode etc. — theme still switches for this visit */
  }
});

// --- Scroll reveal ----------------------------------------------------------
const revealables = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealables.forEach((el) => observer.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("is-visible"));
}
