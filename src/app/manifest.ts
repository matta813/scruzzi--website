import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.fullName,
    short_name: site.firstName,
    description: site.description,
    lang: "de-CH",
    start_url: "/",
    display: "browser",
    background_color: "#030303",
    theme_color: "#030303",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
