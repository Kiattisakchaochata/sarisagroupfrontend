// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ✅ บีบอัด response ชัดเจน
  compress: true,

  // ✅ ให้ next/image สร้าง AVIF/WEBP อัตโนมัติ
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'scontent.xx.fbcdn.net' },
      { protocol: 'https', hostname: 'cdn.tiktokcdn.com' },

      // 👇 เพิ่มโดเมนรูปอีเวนต์ของคุณ (แก้เป็นของจริง)
      // { protocol: 'https', hostname: 'cdn.yourdomain.com' },
      // { protocol: 'https', hostname: 'your-bucket.s3.ap-southeast-1.amazonaws.com' },
      // { protocol: 'https', hostname: 'event.sarisagroup.com' },
    ],
  },

  // ✅ cache headers ยาว ๆ สำหรับ asset ที่ไม่เปลี่ยนบ่อย
  async headers() {
    return [
      {
        // JS/CSS
        source: '/:all*(js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // รูปภาพ/ไอคอน
        source: '/:all*(png|jpg|jpeg|gif|webp|avif|svg|ico)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // ฟอนต์
        source: '/:all*(woff|woff2|ttf|otf)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // (optional) HTML ไม่ cache เพื่อให้หน้าอัปเดตทันที
      {
        source: '/:all*(html)',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },

  // ลด log console ใน prod (คงของเดิม)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // ✅ ปิด header x-powered-by
  poweredByHeader: false,
};

export default nextConfig;