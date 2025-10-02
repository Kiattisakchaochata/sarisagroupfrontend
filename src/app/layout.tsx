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
  apple180?: string | null; // kept for future, not used directly
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

/* -------------------- Global SEO (public) -------------------- */
type PublicSiteSeo = {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: string;
  jsonld?: any; // อาจมี image[], keywords ฯลฯ
};

async function fetchGlobalSeo(): Promise<PublicSiteSeo | null> {
  const apiBase =
    (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!apiBase) return null;
  try {
    const r = await fetch(`${apiBase}/api/public/seo/site`, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json().catch(() => ({} as any));
    return (j?.site as PublicSiteSeo) || null;
  } catch {
    return null;
  }
}

/** Metadata base (ถูก override บางฟิลด์ด้วย brand runtime) */
export const metadata: Metadata = {
  title: { default: BRAND_DEFAULT, template: `%s | ${BRAND_DEFAULT}` },
  description:
    'ครัวคุณจี๊ด ร้านอาหารพื้นบ้านและคาเฟ่ บรรยากาศอบอุ่น อาหารทะเลสด อร่อย คุ้มค่า พร้อมบริการชุมชนของ Sarisagroup',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/', languages: { 'th-TH': '/' } },
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
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

  // ดึง Global SEO เพื่อฝังลง head (SSR ให้ติด view-source)
  const site = await fetchGlobalSeo();
  const siteJsonLd: Record<string, any> | null = site
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: SITE_URL,
        name: site.meta_title || BRAND,
        description: site.meta_description || '',
        image: Array.isArray(site?.jsonld?.image)
          ? site!.jsonld.image
          : (site?.og_image ? [site.og_image] : []),
        keywords: site?.jsonld?.keywords || site?.keywords || undefined,
        // merge JSON-LD จากแอดมิน (ถ้าซ้ำคีย์ ให้ค่าจากแอดมินทับ)
        ...site.jsonld,
      }
    : null;

  // icon override เฉพาะ favicon 16/32 (Android/desktop)
  const iconsOverride = {
    icon: [
      brand.icon16 && { url: brand.icon16, sizes: '16x16' },
      brand.icon32 && { url: brand.icon32, sizes: '32x32' },
    ].filter(Boolean) as any[],
  };

  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: SITE_URL };

  // ใช้ไฟล์ root เดียว พร้อมเวอร์ชันเพื่อ bust cache
  const appleTouchHref = '/apple-touch-icon.png?v=4';

  // Preconnect targets
  const API_BASE =
    (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  const preconnectHosts = [
    'https://res.cloudinary.com',
    'https://images.unsplash.com',
    'https://i.ytimg.com',
    'https://img.youtube.com',
    'https://scontent.xx.fbcdn.net',
    'https://cdn.tiktokcdn.com',
    API_BASE || null,
  ].filter(Boolean) as string[];

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="dark light" />
        <meta name="referrer" content="origin-when-cross-origin" />

        {/* Preconnect/DNS Prefetch เพื่อเร่งโหลด asset ภายนอก */}
        {preconnectHosts.map((h, i) => (
          <link key={`pc-${i}`} rel="preconnect" href={h} crossOrigin="" />
        ))}
        {preconnectHosts.map((h, i) => (
          <link key={`dns-${i}`} rel="dns-prefetch" href={h} />
        ))}

        {/* manifest/ธีมจากแบรนด์ (ถ้ามี) */}
        {brand.manifestUrl && <link rel="manifest" href={brand.manifestUrl} />}
        {brand.themeColor && <meta name="theme-color" content={brand.themeColor} />}

        {/* favicon override (16/32) */}
        {iconsOverride.icon.map((it, i) => (
          <link key={`ico-${i}`} rel="icon" href={it.url} sizes={it.sizes} />
        ))}

        {/* iOS: ต้องอยู่ root และมีแค่ตัวเดียว */}
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchHref} />

        {/* Meta/JSON-LD จาก Global SEO */}
        {site?.meta_description && <meta name="description" content={site.meta_description} />}
        {site?.keywords && <meta name="keywords" content={site.keywords} />}
        {siteJsonLd && <JsonLd id="ld-site" data={siteJsonLd} />}

        {/* Organization JSON-LD */}
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
  <Providers>
    {/* ให้ Next ใช้กรอบนี้เป็น boundary สำหรับ scroll/focus */}
    <main id="content" data-nextjs-scroll-focus-boundary>
      {children}
    </main>
  </Providers>
  <TrackingInjectorBody />
</body>
    </html>
  );
}