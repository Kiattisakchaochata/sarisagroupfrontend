import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // ถ้าคุณมีโดเมนรูปอื่น ๆ เพิ่มที่นี่
    ],
  },
};

export default nextConfig;