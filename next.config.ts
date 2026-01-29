import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip strict TypeScript check during build (we run it separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
