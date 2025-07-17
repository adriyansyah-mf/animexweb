import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i1.wp.com', 'oploverz.my', 'i3.wp.com', 'i2.wp.com', 'otakudesu.cloud'], // External domains
  },
  eslint: {
    ignoreDuringBuilds: true, // Nonaktifkan ESLint selama build
  },
};

export default nextConfig;
