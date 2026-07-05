import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix Firebase Admin ESM/CommonJS bundling issues on Vercel
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
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
