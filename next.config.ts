import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Google profile images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
