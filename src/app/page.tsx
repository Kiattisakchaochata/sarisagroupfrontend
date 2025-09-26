// src/app/page.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from '@/components/home/HomeClient';
import { buildSeoForPath } from '@/seo/fetchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function JsonLd({ data, id }: { data: Record<string, unknown>; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2).replace(/</g, '\\u003c'),
      }}
    />
  );
}

function collectImages(page: any, site: any): string[] {
  const a = Array.isArray(page?.jsonld?.image) ? page.jsonld.image : [];
  const b = Array.isArray(site?.jsonld?.image) ? site.jsonld.image : [];
  const c = Array.isArray(page?.og_images) ? page.og_images : [];
  const d = Array.isArray(site?.og_images) ? site.og_images : [];
  const e = page?.og_image ? [page.og_image] : [];
  const f = site?.og_image ? [site.og_image] : [];
  const all = [...a, ...b, ...c, ...d, ...e, ...f].filter(Boolean) as string[];
  return Array.from(new Set(all)).slice(0, 4);
}

function mergeJsonLd(site: any, page: any, images: string[]) {
  const siteObj = site?.jsonld && typeof site.jsonld === 'object' ? site.jsonld : {};
  const pageObj = page?.jsonld && typeof page.jsonld === 'object' ? page.jsonld : {};

  // ถ้า page.jsonld มี @graph → ใช้เป็นหลัก
  if (Array.isArray((pageObj as any)['@graph'])) {
    const out: any = { '@context': 'https://schema.org', '@graph': (pageObj as any)['@graph'] };
    if (images.length) {
      out['@graph'] = out['@graph'].map((n: any) => {
        if (
          n['@type'] === 'WebPage' ||
          n['@type'] === 'Article' ||
          n['@type'] === 'Product' ||
          n['@type'] === 'Organization'
        ) {
          return { ...n, image: n.image ?? images };
        }
        return n;
      });
    }
    return out;
  }

  // รวมข้อมูลจาก site + page
  const out = { ...siteObj, ...pageObj };
  if (images.length) out.image = images;
  return out;
}

export async function generateMetadata() {
  const { site, page } = await buildSeoForPath('/');
  const title = page?.title || site?.meta_title || 'Sarisagroup';
  const description = page?.description || site?.meta_description || '';
  const images = collectImages(page, site).map((u) => ({ url: u }));
  const robots = page?.noindex ? { index: false, follow: false } : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url: '/',
      type: 'website',
    },
    robots,
    keywords: site?.keywords || undefined,
  };
}

export default async function HomePage() {
  const { site, page } = await buildSeoForPath('/');
  const images = collectImages(page, site);

  // ถ้า API ไม่มี jsonld → fallback
  const fallbackJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page?.title || site?.meta_title || 'Sarisagroup | รวมธุรกิจชุมชน',
    headline: page?.title || site?.meta_title || 'Sarisagroup | รวมธุรกิจชุมชน',
    description: page?.description || site?.meta_description || 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน',
    url: '/',
    image: images.length ? images : undefined,
    isPartOf: { '@type': 'WebSite', url: '/', name: 'Sarisagroup' },
  };

  const jsonld =
    page?.jsonld && typeof page.jsonld === 'object'
      ? mergeJsonLd(site, page, images)
      : fallbackJsonLd;

  return (
    <>
      {/* ✅ Inject JSON-LD ที่ merge แล้ว */}
      <JsonLd id="ld-home" data={jsonld} />

      <Navbar />
      <HomeClient />
      <Footer />
    </>
  );
}