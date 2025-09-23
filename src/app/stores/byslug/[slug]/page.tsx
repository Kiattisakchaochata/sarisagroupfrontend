
//src/app/stores/byslug/[slug]/page.tsx
import { notFound } from 'next/navigation';
import StarRater from '@/components/ratings/StarRater';

type StoreImage = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  menu_name?: string | null;
  price?: number | null;

  // ธงเปิด/ปิดรีวิว อาจมาหลายชื่อ/หลายชนิด
  allow_review?: boolean | number | string | null;
  can_review?: boolean | number | string | null;
  allowRating?: boolean | number | string | null;
  canRating?: boolean | number | string | null;
  can_rate?: boolean | number | string | null;
  is_review_enabled?: boolean | number | string | null;
  review_enabled?: boolean | number | string | null;

  avg_rating?: number | null;
  rating_count?: number | null;
  my_rating?: number | null;
};

type Store = {
  id: string;
  name: string;
  description?: string | null;
  images?: StoreImage[];
};

function getApiBase() {
  const rawBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = rawBase.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

/** รับ true/1/"1"/"true"/"yes"/"on" (case-insensitive) */
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

/** รวม alias ชื่อฟิลด์ “เปิดรีวิว” ให้ครอบคลุม */
function getAllowFlag(img: Partial<StoreImage>): boolean {
  const v =
    img.allow_review ??
    img.can_review ??
    img.allowRating ??
    img.canRating ??
    img.can_rate ??
    img.is_review_enabled ??
    img.review_enabled;
  return isAllowed(v);
}

/** ยูทิล: slug → id */
export async function getIdBySlug(slug: string): Promise<string | null> {
  const API_BASE = getApiBase();
  const candidates = [
    `${API_BASE}/stores/by-slug/${encodeURIComponent(slug)}`,
    `${API_BASE}/stores?slug=${encodeURIComponent(slug)}`,
    `${API_BASE}/stores/${encodeURIComponent(slug)}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) continue;

      const data = await res.json().catch(() => ({} as any));
      if (typeof data?.id === 'string') return data.id;
      if (data?.store?.id) return String(data.store.id);

      if (Array.isArray(data?.stores)) {
        const found = data.stores.find((s: any) => String(s?.slug) === slug);
        if (found?.id) return String(found.id);
        if (data.stores.length === 1 && data.stores[0]?.id) {
          return String(data.stores[0].id);
        }
      }
    } catch {}
  }
  return null;
}

/** ดึงข้อมูลร้านตาม slug */
async function getStoreBySlug(slug: string): Promise<Store | null> {
  const API_BASE = getApiBase();

  // by-slug ก่อน
  try {
    const res = await fetch(
      `${API_BASE}/stores/by-slug/${encodeURIComponent(slug)}`,
      { cache: 'no-store', headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const store = (await res.json()) as Store;
      if (store?.id) return store;
    }
  } catch {}

  // ถ้าไม่สำเร็จ → หา id แล้วดึง /stores/{id}
  const id = await getIdBySlug(slug);
  if (!id) return null;

  try {
    const res = await fetch(`${API_BASE}/stores/${id}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const store = (await res.json()) as Store;
    return store ?? null;
  } catch {
    return null;
  }
}

export default async function StoreBySlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const API_BASE = getApiBase();
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    return notFound();
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold">{store.name}</h1>
        {store.description && (
          <p className="text-gray-600 mt-2">{store.description}</p>
        )}
      </header>

      {Array.isArray(store.images) && store.images.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {store.images.map((img) => {
            const allowReview = getAllowFlag(img);

            return (
              <figure key={img.id} className="rounded-xl overflow-hidden border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.alt_text ?? store.name}
                  className="w-full h-48 object-cover"
                />

                {(img.menu_name || typeof img.price === 'number') && (
                  <figcaption className="p-2 text-sm">
                    <div className="font-medium">{img.menu_name ?? ''}</div>
                    {typeof img.price === 'number' ? (
                      <div className="text-gray-600">{img.price} บาท</div>
                    ) : null}
                  </figcaption>
                )}

                {/* แสดงดาวเฉพาะเมนูที่อนุญาต */}
                {allowReview && (
                  <div className="px-2 pb-2">
                    <StarRater
                      apiBase={API_BASE}
                      imageId={img.id}
                      allowReview={true}
                      initialAvg={img?.avg_rating ?? null}
                      initialCount={img?.rating_count ?? null}
                      initialMyRating={img?.my_rating ?? null}
                    />
                  </div>
                )}
              </figure>
            );
          })}
        </section>
      )}

      <div>
        <a
          href={`/stores/${store.id}/featured`}
          className="inline-flex items-center rounded-full bg-amber-600 text-white px-4 py-2 font-semibold hover:bg-amber-700"
        >
          ดูรูปเด่นทั้งหมด
        </a>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: params.slug };
}