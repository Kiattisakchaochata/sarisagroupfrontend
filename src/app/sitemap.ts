// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://sarisagroup.com').replace(/\/$/, '')

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    '').replace(/\/$/, '')

type Row = {
  id: string
  slug?: string
  updatedAt?: string
  updated_at?: string
}

/** ----- Helpers ----- */
async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try { return (await res.json()) as T }
  catch { return null }
}

function pickUpdatedAt(x: Row, fallbackISO: string) {
  return x.updatedAt || x.updated_at || fallbackISO
}

/** ----- Fetchers (ใช้ public endpoints ถ้ามี) ----- */
// Stores: พยายามใช้ /api/stores (public). ถ้าไม่มีและคุณยอมได้ อาจ fallback ไป /api/admin/stores (ต้องมี auth)
async function fetchStores(): Promise<Row[]> {
  if (!API_BASE) return []
  try {
    const res = await fetch(`${API_BASE}/api/stores`, { next: { revalidate: 60 * 60 } })
    if (!res.ok) return []
    const j = (await safeJson<any>(res)) || {}
    // รองรับทั้ง { items: [...] } | { stores: [...] } | array
    return j.items ?? j.stores ?? (Array.isArray(j) ? j : [])
  } catch {
    return []
  }
}

// Brands (ถ้ามี): พยายามใช้ /api/brands หรือ /api/brand/list (เผื่อโปรเจกต์ตั้งชื่อแตกต่าง)
// ไม่มี endpoint ก็จะคืน []
async function fetchBrands(): Promise<Row[]> {
  if (!API_BASE) return []
  const candidates = [
    `${API_BASE}/api/brands`,
    `${API_BASE}/api/brand/list`,
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 * 60 } })
      if (!res.ok) continue
      const j = (await safeJson<any>(res)) || {}
      const arr = j.items ?? j.brands ?? (Array.isArray(j) ? j : [])
      if (Array.isArray(arr)) return arr
    } catch {
      /* try next candidate */
    }
  }
  return []
}

/** ----- Sitemap ----- */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // เพจคงที่หลัก ๆ
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/stores`,  lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/search`,  lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // เพจร้าน (ไดนามิก)
  const stores = await fetchStores()
  const storePages: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${SITE_URL}/stores/${s.slug || s.id}`,
    lastModified: pickUpdatedAt(s, now),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // เพจแบรนด์ (ถ้ามี endpoint จริงจะถูกนำมาใส่)
  // หมายเหตุ: สมมติเส้นทางฝั่งหน้าเว็บคือ /brand/[slug|id]
  const brands = await fetchBrands()
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/brand/${b.slug || b.id}`,
    lastModified: pickUpdatedAt(b, now),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticPages, ...storePages, ...brandPages]
}