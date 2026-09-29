import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { site } from "@/content/site";
import "./globals.css";

const rajdhani = localFont({
  src: [
    { path: "./fonts/rajdhani-300.woff2", weight: "300" },
    { path: "./fonts/rajdhani-500.woff2", weight: "500" },
    { path: "./fonts/rajdhani-600.woff2", weight: "600" },
  ],
  variable: "--font-rajdhani",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});

const title = "Mattia · Plattformentwickler";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description: site.description,
    siteName: site.fullName,
    locale: "de_CH",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Mattia Scruzzi, Plattformentwickler für Kubernetes und GitOps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/social-preview.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  jobTitle: site.jobTitle,
  url: `${site.url}/`,
  email: `mailto:${site.email}`,
  sameAs: site.socials.map((social) => social.href),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="de" className={`${rajdhani.variable} ${dmSans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed top-4 left-4 z-50 bg-lime px-4 py-2 font-display font-semibold tracking-widest text-ink uppercase"
        >
          Zum Inhalt springen
        </a>
        {children}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
