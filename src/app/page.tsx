// src/app/page.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisitPing from '@/components/VisitPing';
import HomeClient from '@/components/home/HomeClient';
import { fetchSiteSeo, fetchPageSeoByPath } from '@/seo/fetchers';

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
  const f = site?.og_image ? [site?.og_image] : [];
  const all = [...a, ...b, ...c, ...d, ...e, ...f].filter(Boolean) as string[];
  return Array.from(new Set(all)).slice(0, 4);
}

export async function generateMetadata() {
  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath('/')]);

  // ✅ รวม title/description จาก site + page
  const title = `${site?.meta_title || 'Sarisagroup'} ${page?.title || ''}`.trim();
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
  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath('/')]);
  const images = collectImages(page, site);

  // ✅ รวม JSON-LD
  const fallbackJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${site?.meta_title || 'Sarisagroup'} ${page?.title || ''}`.trim(),
    description: page?.description || site?.meta_description || '',
    url: '/',
    image: images.length ? images : undefined,
    isPartOf: { '@type': 'WebSite', url: '/', name: 'Sarisagroup' },
  };

  const jsonld =
    page?.jsonld && typeof page.jsonld === 'object'
      ? { ...site?.jsonld, ...page.jsonld, image: images }
      : fallbackJsonLd;

  return (
    <>
      <JsonLd id="ld-home" data={jsonld} />

      <Navbar />
      <VisitPing />  {/* ยิงนับเฉพาะหน้าโฮม */}
      <HomeClient />
      <Footer />
    </>
  );
}