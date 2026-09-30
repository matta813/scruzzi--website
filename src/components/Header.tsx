"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { navigation, site } from "@/content/site";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Clock } from "./Clock";
import { SoundToggle } from "./SoundToggle";

export function Header() {
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback((restoreFocus = false) => {
    setOpen((wasOpen) => {
      if (wasOpen && restoreFocus) toggle.current?.focus();
      return false;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target as Element | null)?.closest("[data-nav]")) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [close]);

  // Flip header ink while it sits on top of a lime section.
  useGSAP(() => {
    document.querySelectorAll<HTMLElement>("[data-surface='lime']").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 40px",
        end: "bottom 40px",
        onToggle: (self) => header.current?.classList.toggle("on-lime", self.isActive),
      });
    });
  });

  return (
    <header ref={header} className="group fixed inset-x-0 top-0 z-40 px-4 pt-5 md:px-8">
      <nav data-nav aria-label="Hauptnavigation" className="relative grid grid-cols-2 items-start md:grid-cols-5">
        <a
          href="#top"
          className="flex items-center gap-2 font-display text-[0.82rem] font-semibold tracking-[0.04em] text-bone uppercase group-[.on-lime]:text-ink"
        >
          <svg viewBox="0 0 16 14" className="h-3 w-3.5 text-lime group-[.on-lime]:text-ink" aria-hidden="true">
            <path d="M8 1 15 13H1L8 1Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 7.2 10.4 11H5.6L8 7.2Z" fill="currentColor" />
          </svg>
          {site.fullName}
        </a>

        <div className="hidden pt-px md:block">
          <SoundToggle />
        </div>

        <p className="micro col-start-4 hidden flex-col md:flex group-[.on-lime]:text-ink/70">
          <span>{site.place}</span>
          <Clock timeZone={site.timeZone} />
        </p>

        <div className="col-start-2 flex items-start justify-end md:col-start-5 md:justify-between">
          <p className="micro hidden flex-col md:flex group-[.on-lime]:text-ink/70">
            <span>{site.coordinates[0]}</span>
            <span>{site.coordinates[1]}</span>
          </p>
          <button
            ref={toggle}
            type="button"
            aria-controls="nav-panel"
            aria-expanded={open}
            aria-label={open ? "Navigation schliessen" : "Navigation öffnen"}
            onClick={() => setOpen((value) => !value)}
            className="hud-btn -mt-2 min-w-[5.5rem] justify-center"
          >
            {open ? "Schliessen" : "Menü"}
          </button>
        </div>

        <div
          id="nav-panel"
          data-open={open}
          inert={!open}
          className="menu-panel absolute top-12 right-0 w-full bg-panel p-6 md:w-[min(26rem,100%)]"
        >
          <p className="micro mb-4">/ Menü</p>
          <ul className="mb-8">
            {navigation.map((item, index) => (
              <li key={item.href} className="menu-item overflow-hidden border-b border-line">
                <a
                  href={item.href}
                  onClick={() => close()}
                  className="group/link flex items-baseline gap-4 py-2.5 font-display text-3xl font-medium tracking-wide text-bone uppercase transition-colors hover:text-lime"
                >
                  <span className="micro w-6 group-hover/link:text-lime" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="menu-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="micro mb-3">/ Links</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a href={social.href} rel="noopener noreferrer" className="micro text-bone hover:text-lime">
                  {social.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.contactEmail}`} className="micro text-bone hover:text-lime">
                E-Mail
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
