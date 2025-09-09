// src/app/stores/[id]/page.tsx
import { StoreJsonLd } from '@/seo/seoSchemas'

type ApiStore = {
  id: string
  name: string
  slug?: string
  description?: string
  address?: string
  phone?: string | null
  email?: string | null
  website?: string | null
  latitude?: number | null
  longitude?: number | null
  cover_image?: string | null
  images?: { image_url: string }[]
  category?: { name?: string; slug?: string }
  social_links?: any // อาจเป็น string หรือ JSON
  avg_rating?: number
  review_count?: number
  openingHours?: Array<{
    day: 'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'|'SUN'
    openTime: string
    closeTime: string
    isOpen: boolean
  }>
}

const DAY_MAP: Record<string, 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday'> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const store: ApiStore = await fetch(`${base}/api/stores/${params.id}`, { cache: 'no-store' })
    .then(r => r.json())

  // รูปหลัก + แกลเลอรี -> images[]
  const images: string[] = [
    ...(store.cover_image ? [store.cover_image] : []),
    ...((store.images || []).map(i => i.image_url)),
  ]

  // แปลง opening hours ไปเป็น schema.org
  const openingHours = (store.openingHours || [])
    .filter(h => h.isOpen)
    .map(h => ({
      dayOfWeek: DAY_MAP[h.day] || 'Monday',
      opens: h.openTime,    // "08:00"
      closes: h.closeTime,  // "19:30"
    }))

  // ค่า canonical ของหน้าร้าน
  const canonicalUrl = `${siteUrl}/stores/${store.slug || params.id}`

  // (ถ้าอยาก) ดึงวิดีโอที่ map กับร้านนี้ (public API เรามี)
  let videos: Array<{ title: string; url: string; thumbnailUrl?: string }> = []
  try {
    const res = await fetch(
      `${base}/api/videos?store_id=${params.id}&active=1`,
      { cache: 'no-store' }
    ).then(r => r.json())
    videos = (res?.videos || []).map((v: any) => ({
      title: v.title,
      url: v.youtube_url,
      thumbnailUrl: v.thumbnail_url || undefined,
    }))
  } catch {}

  return (
    <>
      {/* ✅ JSON-LD/SEO จากข้อมูลจริง */}
      <StoreJsonLd
        id={store.id}
        name={store.name}
        description={store.description}
        phone={store.phone ?? undefined}
        address={store.address}
        latitude={store.latitude ?? undefined}
        longitude={store.longitude ?? undefined}
        url={canonicalUrl}
        images={images}
        categoryName={store.category?.name}
        rating={store.avg_rating}
        reviewCount={store.review_count}
        openingHours={openingHours}
        videos={videos}
      />

      {/* ====== เนื้อหาหน้าจริง ====== */}
      <div className="py-6 space-y-4">
        <h1 className="text-2xl font-bold">{store.name}</h1>
        {store.description ? <p className="opacity-80">{store.description}</p> : null}
        {/* TODO: ใส่แกลเลอรี/แผนที่/รีวิว/วิดีโอ ตาม UX ที่วางไว้ */}
      </div>
    </>
  )
}