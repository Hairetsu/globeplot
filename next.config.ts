import type { NextConfig } from "next";

const basePath = process.env.NODE_ENV === 'production' ? '/globeplot' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
