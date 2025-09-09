// src/app/search/page.tsx
'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { swrFetcher } from '@/lib/swrFetcher'
import StoreCard from '@/components/StoreCard'

type Store = {
  id: string
  name: string
  description?: string
  cover_image?: string | null
  category?: { name: string }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { data, error, isLoading } = useSWR<{ stores: Store[] }>(
    query ? `/api/stores/search?q=${encodeURIComponent(query)}` : null,
    swrFetcher
  )

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">ค้นหาร้าน</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="พิมพ์ชื่อร้าน..."
        className="input input-bordered w-full mb-6"
      />

      {isLoading && <p>กำลังค้นหา...</p>}
      {error && <p className="text-error">เกิดข้อผิดพลาด</p>}

      {data?.stores?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.stores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        query && !isLoading && <p>ไม่พบร้านที่ค้นหา</p>
      )}
    </main>
  )
}