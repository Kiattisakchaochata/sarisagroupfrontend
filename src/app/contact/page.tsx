import 'server-only';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactClient from './ContactClient';
import { buildSeoForPath } from '@/seo/fetchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
    if (images.length) {
      out['@graph'] = out['@graph'].map((n: any) => (n?.image ? n : { ...n, image: images }));
    }
    return out;
  }
  const out = { ...(siteObj || {}), ...(pageObj || {}) } as Record<string, any>;
  if (images.length) out.image = images;
  return out;
}

/* ---- SEO metadata ---- */
export async function generateMetadata() {
  const path = '/contact';
  const { site, page } = await buildSeoForPath(path);

  const title = (page?.title || site?.meta_title || 'ติดต่อเรา | Sarisagroup') as string;
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
export default async function ContactPage() {
  const path = '/contact';
  const { site, page } = await buildSeoForPath(path);
  const images = collectImages(page, site);

  const jsonld =
    (page?.jsonld && typeof page.jsonld === 'object'
      ? mergeJsonLd(site, page, images)
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: page?.title || 'ติดต่อเรา',
          headline: page?.title || 'ติดต่อเรา',
          description: page?.description || site?.meta_description || '',
          url: `${SITE_URL}${path}`,
          image: images.length ? images : undefined,
          isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sarisagroup' },
        }) as Record<string, unknown>;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
      <JsonLd id="ld-contact" data={jsonld} />
      <Navbar />
      <ContactClient />
      <Footer />
    </div>
  );
}