'use client';

import useSWR from 'swr'
import { swrFetcher } from '@/lib/swrFetcher'
import StoreCard from '@/components/StoreCard'

type Store = {
  id: string
  slug?: string | null
  name: string
  description?: string
  cover_image?: string | null
  category?: { name: string }
}

export default function StoresPage() {
  const { data, error, isLoading } = useSWR<{ stores: Store[] }>(
    '/api/stores',
    swrFetcher
  )

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">ร้านทั้งหมด</h1>

      {isLoading && <p>กำลังโหลด...</p>}
      {error && <p className="text-error">โหลดข้อมูลล้มเหลว</p>}

      {data?.stores?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.stores.map((s) => {
            const href = s.slug
              ? `/stores/byslug/${encodeURIComponent(s.slug)}`
              : `/stores/${encodeURIComponent(s.id)}`
            return <StoreCard key={s.id} store={s} href={href} />
          })}
        </div>
      ) : (
        !isLoading && <p>ยังไม่มีร้าน</p>
      )}
    </main>
  )
}