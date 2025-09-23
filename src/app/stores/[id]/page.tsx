// src/app/stores/[id]/page.tsx
import StoreJsonLd from '@/seo/seoSchemas'

type SocialLinks = string | Record<string, unknown> | null

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
  social_links?: SocialLinks
  avg_rating?: number
  review_count?: number
  openingHours?: Array<{
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
    openTime: string
    closeTime: string
    isOpen: boolean
  }>
}

// ✅ แก้ type ให้ไม่ชน: ใช้ NonNullable ก่อนค่อย [number]
type DayKey = NonNullable<ApiStore['openingHours']>[number]['day']
type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

const DAY_MAP: Record<DayKey, DayName> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

type VideoApi = {
  id: string
  title: string
  youtube_url: string
  thumbnail_url?: string | null
}

export default async function StoreDetailPage({
  // ✅ params เป็น Promise ของ { id: string }
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ ต้อง await ก่อนใช้งาน
  const { id } = await params

  const base = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877').replace(/\/$/, '')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const storeRes = await fetch(`${base}/api/stores/${id}`, { cache: 'no-store' })
  const store: ApiStore = await storeRes.json()

  const images: string[] = [
    store.cover_image,
    ...(store.images?.map((i) => i.image_url) ?? []),
  ].filter(Boolean) as string[]

  const canonicalUrl = `${siteUrl}/stores/${store.slug || id}`

  // ✅ map วิดีโอให้ตรง schema และใช้ youtube_url
  let videos: Array<{ title: string; url: string; thumbnailUrl?: string }> = []
  try {
    const res = await fetch(`${base}/api/videos?store_id=${id}&active=1`, {
      cache: 'no-store',
    })
    const data: { videos?: VideoApi[] } = await res.json()
    videos =
      data.videos?.map((v) => ({
        title: v.title,
        url: v.youtube_url,
        thumbnailUrl: v.thumbnail_url ?? undefined,
      })) ?? []
  } catch {
    // ignore
  }

  // ✅ แปลง openingHours จาก API -> โครงสำหรับ JSON-LD
  const openingHours =
    store.openingHours
      ?.filter((oh) => oh.isOpen)
      .map((oh) => ({
        day: DAY_MAP[oh.day as DayKey],
        openTime: oh.openTime,
        closeTime: oh.closeTime,
      })) ?? []

  return (
    <>
      <StoreJsonLd
        id={store.id}
        name={store.name}
        description={store.description}
        url={canonicalUrl}
        telephone={store.phone ?? undefined}
        images={images.length ? images : undefined}
        address={store.address}
        latitude={store.latitude ?? undefined}
        longitude={store.longitude ?? undefined}
        categoryName={store.category?.name}
        rating={store.avg_rating}
        reviewCount={store.review_count}
        openingHours={openingHours}
        videos={videos}
      />

      <div className="py-6 space-y-4">
        <h1 className="text-2xl font-bold">{store.name}</h1>
        {store.description ? <p className="opacity-80">{store.description}</p> : null}
        {/* TODO: gallery / map / reviews / videos */}
      </div>
    </>
  )
}