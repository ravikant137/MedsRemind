import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5007/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5006/uploads/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
