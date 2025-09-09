// src/seo/seoSchemas.tsx
'use client'

import {
  BreadcrumbJsonLd,
  LocalBusinessJsonLd,
  VideoJsonLd,
} from 'next-seo'

type StoreSchemaProps = {
  id: string
  name: string
  description?: string
  phone?: string | null
  address?: string
  latitude?: number | null
  longitude?: number | null
  url: string            // canonical ของหน้าร้าน เช่น `${SITE_URL}/stores/${slug-or-id}`
  images?: string[]      // รูปประกอบ
  categoryName?: string  // ชื่อหมวด เช่น "คาเฟ่นม"
  rating?: number        // 0..5
  reviewCount?: number
  openingHours?: Array<{
    dayOfWeek:
      | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
    opens: string  // "08:00"
    closes: string // "19:00"
  }>
  videos?: Array<{
    title: string
    url: string         // YouTube URL
    uploadDate?: string // ISO
    thumbnailUrl?: string
    description?: string
  }>
  breadcrumbPath?: Array<{ name: string; item: string }>
}

export function StoreJsonLd(props: StoreSchemaProps) {
  const {
    name,
    description,
    phone,
    address,
    latitude,
    longitude,
    url,
    images = [],
    categoryName,
    rating,
    reviewCount,
    openingHours = [],
    videos = [],
    breadcrumbPath = [
      { name: 'หน้าแรก', item: '/' },
      { name: 'ร้านค้า', item: '/stores' },
      { name, item: url },
    ],
  } = props

  const hasGeo = typeof latitude === 'number' && typeof longitude === 'number'

  return (
    <>
      {/* Breadcrumb */}
      <BreadcrumbJsonLd
        itemListElements={breadcrumbPath.map((b, idx) => ({
          position: idx + 1,
          name: b.name,
          item: b.item,
        }))}
      />

      {/* Local Business */}
      <LocalBusinessJsonLd
        type="LocalBusiness"
        id={url}
        name={name}
        description={description}
        url={url}
        telephone={phone || undefined}
        images={images}
        areaServed={['Thailand']}
        priceRange="฿฿"
        // หมวดหมู่ (as keywords)
        knowsAbout={categoryName ? [categoryName] : undefined}
        // ที่อยู่แบบง่าย (ไม่มีการแยก street/city ก็ส่งเป็น string เดียว)
        address={
          address
            ? {
                streetAddress: address,
                addressLocality: 'Thailand',
                addressCountry: 'TH',
              }
            : undefined
        }
        geo={
          hasGeo
            ? {
                latitude: Number(latitude),
                longitude: Number(longitude),
              }
            : undefined
        }
        // ดาว + รีวิวรวม
        ratingValue={typeof rating === 'number' ? rating : undefined}
        reviewCount={typeof reviewCount === 'number' ? reviewCount : undefined}
        // เวลาเปิด-ปิด (schema.org format)
        openingHours={openingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          opens: h.opens,
          closes: h.closes,
        }))}
      />

      {/* วิดีโอ (ถ้ามี) */}
      {videos.map((v, idx) => (
        <VideoJsonLd
          key={idx}
          name={v.title}
          description={v.description || description || name}
          uploadDate={v.uploadDate || new Date().toISOString()}
          thumbnailUrls={
            v.thumbnailUrl ? [v.thumbnailUrl] : images.length ? [images[0]] : undefined
          }
          contentUrl={v.url}
          embedUrl={v.url}
        />
      ))}
    </>
  )
}