import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating dev overlay badge so it stays out of demos and screenshots.
  devIndicators: false,
};

export default nextConfig;
