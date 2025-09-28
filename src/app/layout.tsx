import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import SwalBridge from './SwalBridge';
import { TrackingInjectorHead, TrackingInjectorBody } from '@/components/TrackingInjector';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BRAND_DEFAULT = process.env.NEXT_PUBLIC_BRAND_NAME || 'ครัวคุณจี๊ด';

type Brand = {
  brandName?: string|null; themeColor?: string|null; manifestUrl?: string|null;
  icon16?: string|null; icon32?: string|null;
  apple57?: string|null; apple60?: string|null; apple72?: string|null; apple76?: string|null;
  apple114?: string|null; apple120?: string|null; apple144?: string|null; apple152?: string|null; apple180?: string|null;
  ogDefault?: string|null;
};

// ✅ ปรับมาเรียก public API (ไม่ใช่ /api/admin/seo)
async function fetchBrand(): Promise<Brand> {
  const apiBase =
    (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!apiBase) return {};
  try {
    const r = await fetch(`${apiBase}/api/public/seo/site`, { cache: 'no-store' });
    if (!r.ok) return {};
    const j = await r.json().catch(() => ({}));
    return j?.site || {};
  } catch { return {}; }
}

/** Metadata base (ถูก override บางฟิลด์ด้วย brand runtime) */
export const metadata: Metadata = {
  title: { default: BRAND_DEFAULT, template: `%s | ${BRAND_DEFAULT}` },
  description:
    'ครัวคุณจี๊ด ร้านอาหารพื้นบ้านและคาเฟ่ บรรยากาศอบอุ่น อาหารทะเลสด อร่อย คุ้มค่า พร้อมบริการชุมชนของ Sarisagroup',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/', languages: { 'th-TH': '/' } },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/favicon/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/favicon/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/favicon/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/favicon/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/favicon/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/favicon/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/favicon/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/favicon/apple-icon-180x180.png', sizes: '180x180' },
    ],
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
export const viewport: Viewport = {
  themeColor: '#000000',
};

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

  // สร้างลิสต์ icons จาก brand (ถ้าใส่มาจะ override)
  const iconsOverride = {
    icon: [
      brand.icon16 && { url: brand.icon16, sizes: '16x16' },
      brand.icon32 && { url: brand.icon32, sizes: '32x32' },
    ].filter(Boolean) as any[],
    apple: [
      brand.apple57  && { url: brand.apple57,  sizes: '57x57' },
      brand.apple60  && { url: brand.apple60,  sizes: '60x60' },
      brand.apple72  && { url: brand.apple72,  sizes: '72x72' },
      brand.apple76  && { url: brand.apple76,  sizes: '76x76' },
      brand.apple114 && { url: brand.apple114, sizes: '114x114' },
      brand.apple120 && { url: brand.apple120, sizes: '120x120' },
      brand.apple144 && { url: brand.apple144, sizes: '144x144' },
      brand.apple152 && { url: brand.apple152, sizes: '152x152' },
      brand.apple180 && { url: brand.apple180, sizes: '180x180' },
    ].filter(Boolean) as any[],
  };

  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: SITE_URL };
  const org     = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: SITE_URL };

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        {brand.manifestUrl && <link rel="manifest" href={brand.manifestUrl} />}
        {brand.themeColor && <meta name="theme-color" content={brand.themeColor} />}

        {iconsOverride.icon.map((it, i)=>(
          <link key={`ico-${i}`} rel="icon" href={it.url} sizes={it.sizes} />
        ))}
        {iconsOverride.apple.map((it, i)=>(
          <link key={`apple-${i}`} rel="apple-touch-icon" href={it.url} sizes={it.sizes} />
        ))}

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