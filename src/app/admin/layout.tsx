// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import AdminGate from '@/components/guards/AdminGate';
import AdminShell from '@/components/admin/AdminShell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  // ช่วยให้ลิงก์ที่เป็น path สร้าง URL สมบูรณ์ได้ถูกต้อง
  metadataBase: new URL(siteUrl),

  // ชื่อหน้า + เทมเพลต หากเพจย่อยอยาก override
  title: {
    default: 'Admin | Sarisagroup',
    template: '%s | Admin · Sarisagroup',
  },

  // หน้าหลังบ้านไม่ควรถูกจัดทำดัชนี
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },

  // canonical หลักสำหรับรากของ admin (เพจย่อยยังสามารถ override เองได้)
  alternates: {
    canonical: '/admin',
  },

  // เติม OG/Twitter ให้ครบ แม้จะ noindex แต่ช่วยเวลาแชร์ภายในทีม
  openGraph: {
    title: 'Admin | Sarisagroup',
    siteName: 'Sarisagroup',
    url: `${siteUrl}/admin`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin | Sarisagroup',
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}