// src/components/SeoJsonLd.tsx
// Server Component: สร้าง JSON-LD (Website/Organization/WebPage/Breadcrumb) จาก SEO DB อัตโนมัติ

import JsonLd from '@/components/JsonLd';
import { buildSeoForPath } from '@/lib/seo';

type Props = {
  /** path ของเพจ เช่น "/", "/about", "/stores/s-wash" */
  path: string;
  /** ใช้ override title/description เฉพาะกรณีจำเป็น (ปกติดึงจาก DB ผ่าน buildSeoForPath) */
  overrideTitle?: string;
  overrideDescription?: string;
  /** เพิ่มรูป OG เพิ่มเติมได้ */
  extraImages?: string[];
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Sarisagroup';

/** รวม/ล้างซ้ำรูป และกรองค่าว่าง */
function uniqImages(...groups: Array<string[] | undefined>) {
  const out: string[] = [];
  for (const g of groups) {
    if (!Array.isArray(g)) continue;
    for (const u of g) {
      if (u && typeof u === 'string' && !out.includes(u)) out.push(u);
    }
  }
  return out;
}

/** สร้าง breadcrumb ง่าย ๆ จาก path */
function buildBreadcrumb(path: string) {
  const parts = path.split('/').filter(Boolean);
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'หน้าแรก',
      item: siteUrl + '/',
    },
  ];

  let acc = '';
  parts.forEach((p, i) => {
    acc += '/' + p;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: decodeURIComponent(p).replace(/-/g, ' ').trim(),
      item: siteUrl + acc,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export default async function SeoJsonLd({
  path,
  overrideTitle,
  overrideDescription,
  extraImages = [],
}: Props) {
  // ดึง SEO (global + per-page) จากฐานข้อมูล/บริการกลางของคุณ
  const seo = await buildSeoForPath(path);

  const title = overrideTitle ?? seo.title ?? brandName;
  const description = overrideDescription ?? seo.description ?? '';
  const images = uniqImages(seo.images, seo.jsonld?.image, extraImages);
  const url = `${siteUrl}${path || '/'}`;

  // ---- Global Schemas ----
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brandName,
    url: siteUrl,
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: siteUrl,
    logo: images[0] || undefined,
  };

  // ---- Page Schema (WebPage) ----
  const webPageBase = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    headline: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: brandName },
    image: images.length ? images : undefined,
  };

  // ถ้าใน DB มี jsonld object ของหน้านี้ ให้ merge เข้ากับ WebPage (และอัด image ที่ normalize แล้วลงไป)
  const pageJsonLd: Record<string, any> | null = (() => {
    const raw = seo.jsonld;
    if (!raw || typeof raw !== 'object') return null;

    // ถ้าเป็น @graph ก็ปล่อยให้แสดงแยกด้านล่าง
    if (Array.isArray((raw as any)['@graph'])) {
      return null;
    }

    // ถ้ามี @type อื่น ๆ เช่น Article/Product ก็ merge แบบให้ค่าจาก DB ชนะ
    const merged = { ...webPageBase, ...raw };
    // บังคับ image เป็นอาเรย์ที่ผ่านการ normalize แล้ว
    if (images.length) merged.image = images;
    return merged;
  })();

  // ถ้า jsonld ใน DB เป็น @graph (array ของหลาย schema) จะฉีดเป็นก้อนแยก
  const pageGraph = Array.isArray(seo?.jsonld?.['@graph'])
    ? {
        '@context': 'https://schema.org',
        '@graph': (seo.jsonld['@graph'] as any[]).map((node) => {
          const n = { ...node };
          // ใส่ image ให้ทุก node ที่รองรับ (กันเคสต้องการให้ภาพสะท้อนเหมือน UI)
          if (images.length && (n['@type'] === 'WebPage' || n['@type'] === 'Article' || n['@type'] === 'Product' || n['@type'] === 'Organization')) {
            n.image = n.image ?? images;
          }
          return n;
        }),
      }
    : null;

  // ถ้าไม่มี pageJsonLd และไม่มี @graph ให้ fallback เป็น WebPage พื้นฐาน
  const finalWebPage = pageJsonLd ?? (!pageGraph ? webPageBase : null);

  // Breadcrumbs (ยกเว้นหน้าแรก)
  const breadcrumbs = path && path !== '/' ? buildBreadcrumb(path) : null;

  return (
    <>
      <JsonLd data={webSite} />
      <JsonLd data={organization} />
      {finalWebPage && <JsonLd data={finalWebPage} />}
      {pageGraph && <JsonLd data={pageGraph} />}
      {breadcrumbs && <JsonLd data={breadcrumbs} />}
    </>
  );
}