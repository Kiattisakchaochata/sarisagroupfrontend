// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import SwalBridge from './SwalBridge';
import { TrackingInjectorHead, TrackingInjectorBody } from '@/components/TrackingInjector';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BRAND_DEFAULT = process.env.NEXT_PUBLIC_BRAND_NAME || 'ครัวคุณจี๊ด';

type Brand = {
  brandName?: string | null;
  themeColor?: string | null;
  manifestUrl?: string | null;
  icon16?: string | null;
  icon32?: string | null;
  // ไม่ใช้ชุด apple หลายขนาดแล้ว เพื่อลดความสับสน/ชน
  apple180?: string | null;
  ogDefault?: string | null;
};

async function fetchBrand(): Promise<Brand> {
  const apiBase =
    (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!apiBase) return {};
  try {
    const r = await fetch(`${apiBase}/api/public/seo/site`, { cache: 'no-store' });
    if (!r.ok) return {};
    const j = await r.json().catch(() => ({}));
    return j?.site || {};
  } catch {
    return {};
  }
}

/** Metadata base (ถูก override บางฟิลด์ด้วย brand runtime) */
export const metadata: Metadata = {
  title: { default: BRAND_DEFAULT, template: `%s | ${BRAND_DEFAULT}` },
  description:
    'ครัวคุณจี๊ด ร้านอาหารพื้นบ้านและคาเฟ่ บรรยากาศอบอุ่น อาหารทะเลสด อร่อย คุ้มค่า พร้อมบริการชุมชนของ Sarisagroup',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/', languages: { 'th-TH': '/' } },

  // ── manifest สำหรับ Android/Chrome
  manifest: '/favicon/site.webmanifest',

  // ── ไอคอน: คง favicon (16/32) ไว้ และ "apple" เหลือเพียงตัวเดียวที่ root
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=3', sizes: '180x180' }],
    shortcut: ['/favicon/favicon.ico'],
  },

  openGraph: {
    type: 'website',
    siteName: BRAND_DEFAULT,
    url: SITE_URL,
    title: BRAND_DEFAULT,
    description:
      'ครัวคุณจี๊ด ร้านอาหารพื้นบ้านและคาเฟ่ บรรยากาศอบอุ่น อาหารทะเลสด อร่อย คุ้มค่า พร้อมบริการชุมชนของ Sarisagroup',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: BRAND_DEFAULT }],
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_DEFAULT,
    description:
      'ครัวคุณจี๊ด ร้านอาหารพื้นบ้านและคาเฟ่ บรรยากาศอบอุ่น อาหารทะเลสด อร่อย คุ้มค่า พร้อมบริการชุมชนของ Sarisagroup',
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true },
};

// ✅ ย้าย themeColor มาไว้ที่ viewport ตามที่ Next.js แนะนำ
export const viewport: Viewport = { themeColor: '#000000' };

// JSON-LD helper
function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  const json = JSON.stringify(data, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/<\/script/gi, '<\\/script');
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await fetchBrand();
  const BRAND = brand.brandName || BRAND_DEFAULT;

  // icon override เฉพาะ favicon 16/32 (Android/desktop) — ส่วน apple ให้มีแค่ตัวเดียว เพื่อกันชน
  const iconsOverride = {
    icon: [
      brand.icon16 && { url: brand.icon16, sizes: '16x16' },
      brand.icon32 && { url: brand.icon32, sizes: '32x32' },
    ].filter(Boolean) as any[],
  };

  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: SITE_URL };
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: SITE_URL };

  // ค่ามาตรฐานสำหรับ apple touch icon:
  // - ถ้ามี brand.apple180 จะใช้ของแบรนด์
  // - ถ้าไม่มีก็ใช้ /apple-touch-icon.png ที่ root (ต้องมีไฟล์จริง)
  const appleTouchHref = (brand.apple180 || '/apple-touch-icon.png') + '?v=3';

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />

        {/* manifest (ถ้าแบรนด์ override มาก็ให้สิทธิ์แบรนด์) */}
        {brand.manifestUrl && <link rel="manifest" href={brand.manifestUrl} />}
        {brand.themeColor && <meta name="theme-color" content={brand.themeColor} />}

        {/* favicon override (16/32) */}
        {iconsOverride.icon.map((it, i) => (
          <link key={`ico-${i}`} rel="icon" href={it.url} sizes={it.sizes} />
        ))}

        {/* ===== iOS & iOS Chrome สำคัญมาก: apple-touch-icon ต้องอยู่ที่ root และมีแค่ตัวเดียว ===== */}
        <link rel="apple-touch-icon" href={appleTouchHref} sizes="180x180" />
        {/* บางบริบทบน iOS ยังอ่าน precomposed: ใส่เพิ่มเพื่อความชัวร์ */}
        <link rel="apple-touch-icon-precomposed" href={appleTouchHref} sizes="180x180" />

        <JsonLd id="ld-website" data={website} />
        <JsonLd id="ld-organization" data={org} />

        {/* @ts-expect-error Async Server Component */}
        <TrackingInjectorHead />

        {brand.ogDefault && (
          <>
            <meta property="og:image" content={brand.ogDefault} />
            <meta name="twitter:image" content={brand.ogDefault} />
          </>
        )}
      </head>
      <body className="min-h-screen bg-base-100 text-base-content">
        <SwalBridge />
        <Providers>{children}</Providers>
        <TrackingInjectorBody />
      </body>
    </html>
  );
}