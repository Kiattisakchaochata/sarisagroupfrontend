// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers'; // 👈 ห่อ client providers แทนการ import hook ตรงๆ

export const metadata: Metadata = {
  title: 'Sarisagroup | รวมธุรกิจชุมชน',
  description:
    'โปรโมตธุรกิจชุมชนอย่างยั่งยืน: ซักผ้าหยอดเหรียญ คาเฟ่ เสริมสวย ร้านอาหาร และคาร์แคร์พลังงานทดแทน',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Sarisagroup | รวมธุรกิจชุมชน',
    description: 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'Sarisagroup',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Sarisagroup' }],
    locale: 'th_TH',
    type: 'website',
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="light" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-base-100 text-base-content">
        <Providers>
          {/* ถ้าต้องการ container รวมทั้งเว็บไว้ตรงนี้ก็ได้ */}
          {/* <div className="container mx-auto px-4">{children}</div> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}