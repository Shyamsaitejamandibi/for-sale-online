import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.E2E ? ".next-e2e" : ".next",
};

export default nextConfig;
