import type { Metadata } from "next";
import Link from "next/link";
import { GridLines } from "@/components/GridLines";

export const metadata: Metadata = {
  title: "Seite nicht gefunden · Mattia",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <GridLines />
      <main id="main" className="relative z-10 flex min-h-svh flex-col justify-end px-4 pb-16 md:px-8">
        <p aria-hidden="true" className="dot-text text-[38vw] leading-[0.8] [--dot-color:var(--color-lime)] [--dot-size:0.9vw]">
          404
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="chip">Not found</p>
            <h1 className="display mt-5 text-[clamp(2.8rem,6vw,5rem)] text-bone">Diese Route läuft ins Leere.</h1>
            <p className="mt-4 text-mute">Die gesuchte Seite existiert nicht oder wurde verschoben.</p>
          </div>
          <div className="self-end md:col-start-5">
            <Link href="/" className="hud-btn">
              Zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
