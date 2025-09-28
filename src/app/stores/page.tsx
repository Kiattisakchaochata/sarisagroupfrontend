import 'server-only';
import StoresClient from './StoresClient';
import { buildSeoForPath } from '@/seo/fetchers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {};

// ---- JSON-LD helper ----
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

// ---- Metadata ----
export async function generateMetadata(_: PageProps) {
  const path = `/stores`;
  const { site, page } = await buildSeoForPath(path);

  const title = (page?.title || site?.meta_title || 'ร้านทั้งหมด | Sarisagroup') as string;
  const description = (page?.description || site?.meta_description || '') as string;
  const images = [
    ...(Array.isArray(page?.og_images) ? page.og_images : []),
    ...(page?.og_image ? [page.og_image] : []),
    ...(site?.og_image ? [site.og_image] : []),
  ].filter(Boolean);

  const robots = page?.noindex ? ({ index: false, follow: false } as const) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: images.map((url) => ({ url })),
      url: `${SITE_URL}${path}`,
      type: 'website',
    },
    alternates: { canonical: `${SITE_URL}${path}` },
    robots,
    keywords: site?.keywords || undefined,
  };
}

// ---- Page ----
export default async function StoresPage() {
  const path = `/stores`;
  const { site, page } = await buildSeoForPath(path);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page?.title || site?.meta_title || 'ร้านทั้งหมด',
    description: page?.description || site?.meta_description || '',
    url: `${SITE_URL}${path}`,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sarisagroup' },
  };

  return (
    <>
      {/* ✅ JSON-LD สำหรับ SEO */}
      <JsonLd id="ld-stores" data={jsonld} />

      {/* ✅ Client component ที่ต้องไปดึง /stores API และส่ง image_fit ต่อไปยัง StoreCard */}
      <StoresClient />
    </>
  );
}