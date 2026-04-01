import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/human',
  experimental: {
    turbopack: false,
  },
};

export default nextConfig;
