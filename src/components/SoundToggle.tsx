"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const onOver = (event: PointerEvent) => {
      if ((event.target as Element | null)?.closest("a, button")) sound.blip();
    };
    document.addEventListener("pointerover", onOver);
    return () => document.removeEventListener("pointerover", onOver);
  }, [on]);

  const toggle = async () => {
    if (on) {
      setOn(false);
      await sound.disable();
    } else {
      await sound.enable();
      setOn(true);
      sound.blip(2200);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="micro text-left transition-colors hover:text-bone group-[.on-lime]:text-ink/70"
    >
      Sound <span className="px-1">-</span>
      <span className="text-bone group-[.on-lime]:text-ink">{on ? "On" : "Off"}</span>
    </button>
  );
}
