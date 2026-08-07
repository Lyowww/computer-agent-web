import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Render Static Site (publish directory: dist)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
