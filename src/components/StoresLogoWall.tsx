'use client'

import useSWR from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { swrFetcher } from '@/lib/swrFetcher'

type StoreLogo = {
  id: string
  name: string
  slug?: string | null
  logo_url?: string | null
}

export default function StoresLogoWall({
  api = '/api/stores/logos',
  items,
  title = 'ร้านในเครือของเรา',
}: {
  api?: string
  items?: StoreLogo[]
  title?: string
}) {
  const { data, error, isLoading } = useSWR<{ stores: StoreLogo[] }>(
    items ? null : api,
    swrFetcher
  )

  const stores: StoreLogo[] = items ?? data?.stores ?? []

  // ✅ list id ที่ต้องการให้ "contain"
  const containIds = ['s2', 's4'] // <-- ปรับตรงนี้ตาม id จริงของร้าน

  return (
    <section className="mt-12">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-200 h-44 md:h-56 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Grid logos */}
      {!isLoading && !error && stores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stores.map((s) => {
            const imgClass = containIds.includes(s.id)
              ? 'object-contain p-4' // ✅ ไม่โดน crop
              : 'object-cover' // ✅ เต็มกรอบ

            return (
              <div
                key={s.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white"
              >
                {s.logo_url ? (
                  <div className="relative w-full aspect-[16/12]">
                    <Image
                      src={s.logo_url}
                      alt={s.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className={imgClass}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-36 md:h-40 flex items-center justify-center text-sm opacity-60">
                    LOGO
                  </div>
                )}

                {/* ปุ่มกดเข้าหน้าร้าน */}
                <div className="p-3 flex justify-center">
                  <Link
                    href={`/stores/${s.slug ?? s.id}`}
                    className="px-4 py-2 rounded-full bg-white text-gray-800 text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  >
                    เยี่ยมชมร้านเราดูก่อนได้
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}