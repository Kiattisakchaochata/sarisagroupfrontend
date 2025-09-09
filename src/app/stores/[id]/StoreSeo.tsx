// src/app/stores/[id]/StoreSeo.tsx
'use client'

import { NextSeo } from 'next-seo'
import { buildStoreJsonLd, StoreForSeo } from '@/seo/jsonld'

export default function StoreSeo({ store }: { store: StoreForSeo }) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/stores/${store.slug || store.id}`

  const title = `${store.name} – รีวิว ข้อมูล ติดต่อ`
  const description = store.description || 'ข้อมูลร้านในชุมชน บริการคุณภาพ ใส่ใจสิ่งแวดล้อม'

  const jsonLd = buildStoreJsonLd(store)

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url,
          title,
          description,
          images: store.cover_image
            ? [{ url: store.cover_image, width: 1200, height: 630, alt: store.name }]
            : undefined,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}