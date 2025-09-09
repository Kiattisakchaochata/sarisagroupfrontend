// src/seo/jsonld.ts
type StoreCategory =
  | 'restaurant'
  | 'cafe'
  | 'laundromat'
  | 'hair-salon'
  | 'car-wash'

export type StoreForSeo = {
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
  category_slug: StoreCategory
  social_links?: Record<string, string> | null // { facebook, line, instagram, tiktok }
  avg_rating?: number
  review_count?: number
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function typeFromCategory(cat: StoreCategory) {
  switch (cat) {
    case 'restaurant': return 'Restaurant'
    case 'cafe': return 'CafeOrCoffeeShop'
    case 'laundromat': return 'Laundromat'
    case 'hair-salon': return 'HairSalon'
    case 'car-wash': return 'AutoWash'
    default: return 'LocalBusiness'
  }
}

/** สร้าง JSON-LD สำหรับร้าน (LocalBusiness subtype) */
export function buildStoreJsonLd(store: StoreForSeo) {
  const url = `${siteUrl}/stores/${store.slug || store.id}`

  const sameAs: string[] = []
  if (store.social_links) {
    for (const v of Object.values(store.social_links)) {
      if (v) sameAs.push(v)
    }
  }

  const data: any = {
    '@context': 'https://schema.org',
    '@type': typeFromCategory(store.category_slug),
    '@id': url + '#store',
    url,
    name: store.name,
    description: store.description || undefined,
    image: store.cover_image || undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    aggregateRating:
      store.review_count && store.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: store.avg_rating ?? 0,
            reviewCount: store.review_count,
          }
        : undefined,
  }

  if (store.address) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: store.address, // แบบง่าย (ถ้าอยากละเอียด แยกเป็น locality/region/postalCode ได้)
      addressCountry: 'TH',
    }
  }

  if (store.latitude && store.longitude) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: store.latitude,
      longitude: store.longitude,
    }
  }

  return data
}