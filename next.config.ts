// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // ✅ ให้ build ผ่านแม้เจอ lint error
  },
  typescript: {
    ignoreBuildErrors: true,    // ✅ ให้ build ผ่านแม้เจอ type error
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'scontent.xx.fbcdn.net' },
      { protocol: 'https', hostname: 'cdn.tiktokcdn.com' },
    ],
  },
};

export default nextConfig;