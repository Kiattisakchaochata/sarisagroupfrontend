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

type PageSeoRow = {
  id: string
  path: string
  noindex?: boolean
  updated_at?: string
  updatedAt?: string
}

/** ----- Helpers ----- */
async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try { return (await res.json()) as T }
  catch { return null }
}

function pickUpdatedAt(x: Row | PageSeoRow, fallbackISO: string) {
  return (x as any).updatedAt || (x as any).updated_at || fallbackISO
}

/** ----- Fetchers (ใช้ public endpoints ถ้ามี) ----- */
// Stores
async function fetchStores(): Promise<Row[]> {
  if (!API_BASE) return []
  try {
    const res = await fetch(`${API_BASE}/api/stores`, { next: { revalidate: 60 * 60 } })
    if (!res.ok) return []
    const j = (await safeJson<any>(res)) || {}
    return j.items ?? j.stores ?? (Array.isArray(j) ? j : [])
  } catch {
    return []
  }
}

// Brands
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

// Page SEO
async function fetchPageSeo(): Promise<PageSeoRow[]> {
  if (!API_BASE) return []
  try {
    const res = await fetch(`${API_BASE}/api/public/seo/pages`, { next: { revalidate: 60 * 60 } })
    if (!res.ok) return []
    const j = (await safeJson<any>(res)) || {}
    const arr = j.pages ?? (Array.isArray(j) ? j : [])
    return (arr as PageSeoRow[]).filter((p) => !p.noindex)
  } catch {
    return []
  }
}

/** ----- Sitemap ----- */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // เพจคงที่
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/stores`,  lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/search`,  lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // เพจร้าน
  const stores = await fetchStores()
  const storePages: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${SITE_URL}/stores/${s.slug || s.id}`,
    lastModified: pickUpdatedAt(s, now),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // เพจแบรนด์
  const brands = await fetchBrands()
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/brand/${b.slug || b.id}`,
    lastModified: pickUpdatedAt(b, now),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // เพจจาก Page SEO (เช่น /about, /ร้านอาหารอรัญประเทศ)
  const pages = await fetchPageSeo()
  const pageSeoPages: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: pickUpdatedAt(p, now),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...storePages, ...brandPages, ...pageSeoPages]
}