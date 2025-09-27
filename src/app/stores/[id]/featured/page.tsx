// src/app/stores/[id]/featured/page.tsx
import 'server-only';
import Link from 'next/link';
import StarRater from '@/components/ratings/StarRater';
import { fetchSiteSeo, fetchPageSeoByPath } from '@/seo/fetchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/* ------------ utils ------------- */
function normPath(p?: string) {
  if (!p) return '/';
  let s = String(p).trim();
  if (!s.startsWith('/')) s = '/' + s;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

function getApiBase() {
  const rawBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = rawBase.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

function isAllowed(v: unknown) {
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
  }
  return false;
}
function getAllowFlag(img: any): boolean {
  const v =
    img?.allow_review ??
    img?.can_review ??
    img?.allowRating ??
    img?.canRating ??
    img?.can_rate ??
    img?.is_review_enabled ??
    img?.review_enabled;
  return isAllowed(v);
}

/* ----- JSON-LD helper ----- */
function JsonLd({ data, id }: { data: Record<string, unknown>; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // กัน </script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2).replace(/<\//g, '<\\/') }}
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

/* ------------ Metadata (SEO) ------------- */
// ✅ ใช้ params เป็น object ปกติ เพื่อตัด warning
type PageProps = { params: { id: string } };

// --- แทนที่ฟังก์ชัน generateMetadata เดิม ---
export async function generateMetadata(props: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  // รองรับทั้งแบบ object และ Promise (await non-promise ได้ผลลัพธ์เดิม)
  const { id } = await Promise.resolve((props as any).params);

  const path = normPath(`/stores/${id}/featured`);
  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath(path)]);

  const title = (page?.title || site?.meta_title || 'Sarisagroup') as string;
  const description = (page?.description || site?.meta_description || '') as string;
  const images = collectImages(page, site).map((url) => ({ url }));
  const robots = page?.noindex ? ({ index: false, follow: false } as const) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url: `${SITE_URL}${path}`,
      type: 'website',
    },
    alternates: { canonical: `${SITE_URL}${path}` },
    robots,
    keywords: (site?.keywords ?? '') || undefined,
  };
}

// --- แทนที่ default export เดิม ---
export default async function StoreFeaturedPage(props: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve((props as any).params);

  const API_BASE = getApiBase();
  const path = normPath(`/stores/${id}/featured`);

  const res = await fetch(`${API_BASE}/stores/${id}/featured?limit=all`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Featured fetch failed: ${res.status} ${msg}`);
  }

  const { store, images, siteSeo, pageSeo } = await res.json();

  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath(path)]);
  const imagesForSeo = collectImages(page ?? pageSeo, site ?? siteSeo);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE_URL}${path}`,
    name: store?.name || page?.title || site?.meta_title || 'Sarisagroup',
    image: imagesForSeo.length ? imagesForSeo : undefined,
    description: page?.description || site?.meta_description || '',
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sarisagroup' },
  };

  if (!images?.length) {
    return (
      <>
        <JsonLd id="ld-store-featured" data={jsonld} />
        <main className="container mx-auto max-w-md px-4 md:px-6 py-10">
          <h1 className="text-xl font-semibold">ไม่พบข้อมูลรูปเด่น</h1>
          <p className="text-sm text-gray-600 mt-1">ร้าน: {store?.name ?? id}</p>
          <Link
            href="/stores"
            className="mt-6 inline-flex items-center rounded-full bg-amber-600 text-white px-4 py-2 font-semibold"
          >
            ← กลับไปหน้าร้าน
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <JsonLd id="ld-store-featured" data={jsonld} />

      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            รูปเด่นทั้งหมด — {store.name}
          </h1>
          <Link href="/stores" className="text-amber-700 hover:text-amber-800 font-medium">
            ← กลับไปหน้าร้าน
          </Link>
        </div>

        <section
          className="
            grid gap-4 sm:gap-5
            [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]
          "
        >
          {images.map((img: any) => {
            const allowReview = getAllowFlag(img);
            const title = img.menu_name ?? store.name;
            const price = typeof img.price === 'number' ? `${img.price} บาท` : '';

            const avg =
              typeof img?.avg_rating === 'number'
                ? img.avg_rating
                : typeof img?.avg === 'number'
                ? img.avg
                : null;

            return (
              <figure
                key={img.id}
                className="
                  flex flex-col overflow-hidden rounded-xl bg-white
                  ring-1 ring-gray-200/70 shadow-md hover:shadow-lg transition-shadow
                "
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text ?? title}
                    className="w-full object-cover"
                    style={{ aspectRatio: '4 / 3' }}
                  />
                  {typeof avg === 'number' && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-1 text-xs font-medium text-white shadow">
                        <span>★</span>
                        <span>{avg.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <figcaption className="p-3 sm:p-4 flex flex-col">
                  <div className="min-h-[44px]">
                    <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                      {title}
                    </div>
                    {price && (
                      <div className="mt-0.5 text-[13px] text-slate-600">{price}</div>
                    )}
                  </div>

                  <div className="mt-2 h-px w-full bg-slate-200/70" />

                  <div className="mt-auto pt-2">
                    {allowReview && (
                      <StarRater
                        apiBase={API_BASE}
                        imageId={img.id}
                        allowReview={true}
                        initialAvg={img?.avg_rating ?? null}
                        initialCount={img?.rating_count ?? null}
                        initialMyRating={img?.my_rating ?? null}
                      />
                    )}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </section>
      </main>
    </>
  );
}