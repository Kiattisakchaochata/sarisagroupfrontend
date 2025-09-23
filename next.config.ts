// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (เผื่อยังใช้ mock หรือภาพ demo)
      { protocol: 'https', hostname: 'images.unsplash.com' },

      // YouTube thumbnails
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },

      // Cloudinary (ที่คุณใช้ upload/store logo/banner)
      { protocol: 'https', hostname: 'res.cloudinary.com' },

      // Optional: เผื่อมี social embed (ถ้าไม่ใช้สามารถลบออกได้)
      { protocol: 'https', hostname: 'scontent.xx.fbcdn.net' },
      { protocol: 'https', hostname: 'cdn.tiktokcdn.com' },
    ],
  },
};

export default nextConfig;