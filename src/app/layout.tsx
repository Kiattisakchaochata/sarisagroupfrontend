// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import 'sweetalert2/dist/sweetalert2.min.css';
import SwalBridge from './SwalBridge';
import { TrackingInjectorHead, TrackingInjectorBody } from '@/components/TrackingInjector';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Sarisagroup';
const defaultOg = `${siteUrl}/og-default.jpg`;
const NOINDEX   = String(process.env.NEXT_PUBLIC_NOINDEX || '').toLowerCase() === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Sarisagroup | รวมธุรกิจชุมชน',
  description: 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน: ซักผ้าหยอดเหรียญ คาเฟ่ เสริมสวย ร้านอาหาร และคาร์แคร์พลังงานทดแทน',
  robots: NOINDEX ? {
    index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true, noarchive: true },
  } : undefined,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Sarisagroup | รวมธุรกิจชุมชน',
    description: 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน',
    url: siteUrl,
    siteName: brandName,
    images: [{ url: defaultOg, width: 1200, height: 630, alt: brandName }],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarisagroup | รวมธุรกิจชุมชน',
    description: 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน',
    images: [defaultOg],
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
  // ⛔️ ย้าย themeColor ออกไปไว้ที่ export const viewport ด้านล่างตาม Next.js API ใหม่
};

export const viewport: Viewport = {
  // ใช้ค่าที่คุณตั้งเดิม เพื่อแก้คำเตือน Unsupported metadata themeColor…
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: brandName, url: siteUrl };
  const orgJsonLd     = { '@context': 'https://schema.org', '@type': 'Organization', name: brandName, url: siteUrl };

  return (
    <html lang="th" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <TrackingInjectorHead />
      </head>
      <body className="min-h-screen bg-base-100 text-base-content">
        <SwalBridge />
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={orgJsonLd} />
        <Providers>{children}</Providers>
        <TrackingInjectorBody />
      </body>
    </html>
  );
}