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
