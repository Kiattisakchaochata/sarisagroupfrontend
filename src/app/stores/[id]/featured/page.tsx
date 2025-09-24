// src/app/sotres/[id]/featured/page.tsx
import Link from 'next/link';
import StarRater from '@/components/ratings/StarRater';

function getApiBase() {
  const rawBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = rawBase.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

/** รับ true/1/"1"/"true"/"yes"/"on" (case-insensitive, trim แล้ว) เป็น “อนุญาต” */
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

/** บาง API อาจใช้ชื่อฟิลด์ไม่เหมือนกัน → รวมให้ครบ */
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

export default async function StoreFeaturedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const API_BASE = getApiBase();

  const res = await fetch(`${API_BASE}/stores/${id}/featured?limit=all`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Featured fetch failed: ${res.status} ${msg}`);
  }

  const { store, images } = await res.json();

  if (!images?.length) {
    return (
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
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          รูปเด่นทั้งหมด — {store.name}
        </h1>
        <Link href="/stores" className="text-amber-700 hover:text-amber-800 font-medium">
          ← กลับไปหน้าร้าน
        </Link>
      </div>

      {/* ✅ กริดยืด-หดอัตโนมัติ รองรับทุกความกว้าง */}
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

          // ✅ ค่าที่ใช้แสดง AVG (รองรับหลายชื่อฟิลด์)
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
              {/* รูปเมนู: คงอัตราส่วน 4:3 + ป้าย AVG มุมขวาบน */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.alt_text ?? title}
                  className="w-full object-cover"
                  style={{ aspectRatio: '4 / 3' }}
                />

                {/* ⭐ ป้าย AVG: แสดงได้ทั้งตอน login และไม่ login */}
                {typeof avg === 'number' && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-1 text-xs font-medium text-white shadow">
                      <span className="text-amber-300">★</span>
                      <span>{avg.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* เนื้อหาในการ์ด */}
              <figcaption className="p-3 sm:p-4 flex flex-col">
                <div className="min-h-[44px]">
                  <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                    {title}
                  </div>
                  {price && (
                    <div className="mt-0.5 text-[13px] text-slate-600">{price}</div>
                  )}
                </div>

                {/* เส้นคั่นบาง ๆ */}
                <div className="mt-2 h-px w-full bg-slate-200/70" />

                {/* ⭐ ให้คะแนน — ดันลงล่างเพื่อให้การ์ดสูงเท่ากัน */}
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
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: 'รูปเด่นทั้งหมด' };
}