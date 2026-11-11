import type { NextConfig } from "next";

// Files in public/ are otherwise served with max-age=0, so every visit
// re-downloads them. A month plus stale-while-revalidate keeps repeat views fast.
const staticAssetCache = [
  {
    key: "Cache-Control",
    value: "public, max-age=2592000, stale-while-revalidate=86400",
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework/version in responses.
  poweredByHeader: false,
  images: {
    // Full-width photos never need more than ~2000px; the default 3840px
    // versions are slow to generate on first view and heavy to download.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  async headers() {
    return [
      { source: "/images/:path*", headers: staticAssetCache },
      { source: "/hero-lobby.webp", headers: staticAssetCache },
      { source: "/hero-lobby-sm.webp", headers: staticAssetCache },
      { source: "/logo.png", headers: staticAssetCache },
    ];
  },
};

export default nextConfig;
