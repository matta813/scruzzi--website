"use strict";

// --- Theme toggle -----------------------------------------------------------
const toggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function updateThemeControl(theme) {
  const lightActive = theme === "light";
  toggle.setAttribute("aria-pressed", String(lightActive));
  toggle.setAttribute("aria-label", lightActive ? "Dunkles Design aktivieren" : "Helles Design aktivieren");
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Navigation öffnen");
}

updateThemeControl(document.documentElement.dataset.theme);

toggle.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";

  document.body.classList.add("theme-switching");
  root.dataset.theme = next;
  updateThemeControl(next);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.remove("theme-switching"));
  });

  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    /* private mode etc. — theme still switches for this visit */
  }
});

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Navigation öffnen" : "Navigation schließen");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
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
