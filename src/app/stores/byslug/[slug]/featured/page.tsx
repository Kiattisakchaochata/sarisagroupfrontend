// src/app/stores/byslug/[slug]/page.tsx
import { notFound } from 'next/navigation';
import StarRater from '@/components/ratings/StarRater';

type StoreImage = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  menu_name?: string | null;
  price?: number | null;
  // ✅ ฟิลด์สำหรับให้ดาว
  allow_review?: boolean | null;
  can_review?: boolean | null; // เผื่อ BE ใช้ชื่ออื่น
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

/** ✅ ยูทิล: slug → id */
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
    } catch {
      // noop
    }
  }
  return null;
}

/** ✅ ดึงข้อมูลร้านตาม slug */
async function getStoreBySlug(slug: string): Promise<Store | null> {
  const API_BASE = getApiBase();

  // ลอง by-slug ก่อน
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

  // ถ้าไม่เจอ → หา id แล้วดึง /stores/{id}
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
    return (
      <main className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
        <h1 className="text-xl font-semibold mb-2">ไม่พบร้านจาก Slug นี้</h1>
        <p className="text-sm text-gray-600">
          slug: <span className="font-mono">{params.slug}</span>
        </p>
        <div className="mt-6">
          <a
            href="/stores"
            className="inline-flex items-center rounded-full bg-amber-600 text-white px-5 py-2.5 font-semibold"
          >
            ← กลับไปหน้าร้านค้า
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold">{store.name}</h1>
        {store.description && (
          <p className="text-gray-600 mt-2">{store.description}</p>
        )}
      </header>

      {/* แกลเลอรี่รูป + ให้ดาว */}
      {Array.isArray(store.images) && store.images.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {store.images.map((img) => {
            // ✅ default true ถ้า BE ไม่ส่งมา
            const allowReview =
              (img?.allow_review ?? img?.can_review ?? true) === true;

            return (
              <figure
                key={img.id}
                className="rounded-xl overflow-hidden border bg-white"
              >
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

                {/* ⭐ ให้ดาวแต่ละเมนู */}
                <div className="px-2 pb-2">
                  <StarRater
                    apiBase={API_BASE}
                    imageId={img.id}
                    allowReview={allowReview}
                    initialAvg={img?.avg_rating ?? null}
                    initialCount={img?.rating_count ?? null}
                    initialMyRating={img?.my_rating ?? null}
                  />
                </div>
              </figure>
            );
          })}
        </section>
      )}

      {/* ปุ่มดู “รูปเด่นทั้งหมด” */}
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: params.slug };
}