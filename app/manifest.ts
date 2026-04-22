import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "France + Spain '26",
    short_name: "Trip '26",
    description: "Personal trip organizer — France & Spain 2026",
    start_url: "/itinerary",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf8f2",
    theme_color: "#d85a1c",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["travel", "productivity"],
  };
}
