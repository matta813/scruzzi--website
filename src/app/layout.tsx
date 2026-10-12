import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { site, skills } from "@/content/site";
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

const title = "Mattia Scruzzi · Plattformentwickler EFZ";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  alternates: { canonical: "/" },
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  formatDetection: { telephone: false },
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
        alt: "Mattia Scruzzi, Plattformentwickler EFZ in Ausbildung",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.fullName,
      givenName: site.firstName,
      familyName: site.lastName,
      jobTitle: site.jobTitle,
      url: `${site.url}/`,
      image: `${site.url}/social-preview.png`,
      email: `mailto:${site.email}`,
      address: { "@type": "PostalAddress", addressCountry: site.country },
      knowsAbout: skills.flatMap((skill) => skill.items),
      sameAs: site.socials.map((social) => social.href),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: `${site.url}/`,
      name: site.fullName,
      inLanguage: "de-CH",
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="de" className={`${rajdhani.variable} ${dmSans.variable}`}>
      <body>
        <noscript>
          <style nonce={nonce}>{".preloader{display:none}"}</style>
        </noscript>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <script
          defer
          src="/a/script.js"
          data-website-id="29e5d058-9e41-42c4-b9d4-0d0fde48e27a"
          nonce={nonce}
        />
      </body>
    </html>
  );
}
