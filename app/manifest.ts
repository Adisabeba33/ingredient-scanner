import type { MetadataRoute } from "next";

/**
 * Web manifest — so adding the scanner to a phone's home screen keeps the icon
 * and opens it without browser chrome, which is how it's actually used in a
 * store aisle.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Catalog Scanner",
    short_name: "Scanner",
    description:
      "Admin-only capture tool — scan pet-food barcodes and photograph labels to seed verified ingredients into ingredients.help.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B0D",
    theme_color: "#0B0B0D",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
