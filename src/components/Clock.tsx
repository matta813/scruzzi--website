"use client";

import { useEffect, useState } from "react";

export function Clock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("de-CH", { timeZone, hour: "2-digit", minute: "2-digit" });
    const update = () => setTime(format.format(new Date()));
    update();
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <time suppressHydrationWarning>{time ?? "--:--"}</time>;
}
