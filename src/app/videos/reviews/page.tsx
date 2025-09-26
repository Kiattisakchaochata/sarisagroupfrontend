import 'server-only';
import ReviewsClient from './ReviewsClient';
import { buildSeoForPath } from '@/seo/fetchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/* ---- helpers (สั้น ๆ พอ) ---- */
function JsonLd({ data, id }: { data: Record<string, unknown>; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2).replace(/</g, '\\u003c') }}
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
  return Array.from(new Set([...a, ...b, ...c, ...d, ...e, ...f].filter(Boolean))).slice(0, 4);
}
function mergeJsonLd(site: any, page: any, images: string[]) {
  const siteObj = site?.jsonld && typeof site.jsonld === 'object' ? site.jsonld : undefined;
  const pageObj = page?.jsonld && typeof page.jsonld === 'object' ? page.jsonld : undefined;
  if (pageObj && Array.isArray((pageObj as any)['@graph'])) {
    const out: any = { '@context': 'https://schema.org', '@graph': (pageObj as any)['@graph'] };
    if (images.length) out['@graph'] = out['@graph'].map((n: any) => (n?.image ? n : { ...n, image: images }));
    return out;
  }
  const out = { ...(siteObj || {}), ...(pageObj || {}) } as Record<string, any>;
  if (images.length) out.image = images;
  return out;
}

/* ---- SEO metadata ---- */
export async function generateMetadata() {
  const path = '/videos/reviews';
  const { site, page } = await buildSeoForPath(path);

  const title = (page?.title || site?.meta_title || 'วิดีโอรีวิวทั้งหมด | Sarisagroup') as string;
  const description = (page?.description || site?.meta_description || '') as string;
  const images = collectImages(page, site).map((url) => ({ url }));
  const robots = page?.noindex ? ({ index: false, follow: false } as const) : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images, url: `${SITE_URL}${path}`, type: 'website' },
    alternates: { canonical: `${SITE_URL}${path}` },
    robots,
    keywords: (site?.keywords ?? '') || undefined,
  };
}

/* ---- Page ---- */
export default async function VideosReviewsPage() {
  const path = '/videos/reviews';
  const { site, page } = await buildSeoForPath(path);
  const images = collectImages(page, site);

  const jsonld = mergeJsonLd(
    site,
    page?.jsonld && typeof page.jsonld === 'object' ? page : {
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page?.title || 'วิดีโอรีวิวทั้งหมด',
        headline: page?.title || 'วิดีโอรีวิวทั้งหมด',
        description: page?.description || site?.meta_description || '',
        url: `${SITE_URL}${path}`,
        image: images.length ? images : undefined,
        isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sarisagroup' },
      }
    },
    images
  );

  return (
    <>
      <JsonLd id="ld-videos-reviews" data={jsonld} />
      <ReviewsClient />
    </>
  );
}