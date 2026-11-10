import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Realty Flux — Premium Real Estate in Kenya",
    short_name: "Realty Flux",
    description: "Homes, apartments, land and commercial property for sale and rent across Kenya.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c3a1d",
    theme_color: "#0c3a1d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
