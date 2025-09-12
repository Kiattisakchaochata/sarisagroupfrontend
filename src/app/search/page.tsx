// src/app/search/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import StoreCard from '@/components/StoreCard';

type Store = {
  id: string;
  name: string;
  description?: string;
  cover_image?: string | null;
  category?: { name: string };
};

export default function SearchPage() {
  const [rawQuery, setRawQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // === debounce 300ms ===
  const [query, setQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // ยิงเฉพาะเมื่อมี query จริง ๆ
  const { data, error, isLoading } = useSWR<{ stores: Store[] }>(
    query ? `/api/stores/search?q=${encodeURIComponent(query)}` : null,
    swrFetcher
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // กันการนำทาง/รีเฟรชหน้า
  };

  const canClear = useMemo(() => rawQuery.length > 0, [rawQuery]);

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">ค้นหาร้าน</h1>

      {/* กล่องค้นหาแบบขยายเมื่อโฟกัส */}
      <form onSubmit={onSubmit} className="mb-6">
        <div
          className={[
            'mx-auto flex items-center gap-2 rounded-full border border-black/10 bg-white/90 backdrop-blur',
            'transition-all duration-200 shadow-sm focus-within:shadow-md',
            focused ? 'max-w-3xl ring-2 ring-indigo-500/30' : 'max-w-xl',
            'px-4 py-2 md:px-5 md:py-3',
          ].join(' ')}
        >
          {/* ไอคอนค้นหา */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-gray-500"
          >
            <path
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <input
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="พิมพ์ชื่อร้านที่ต้องการค้นหา..."
            className="w-full bg-transparent outline-none text-[15px] md:text-base"
            autoFocus
          />

          {/* ปุ่มเคลียร์ข้อความ */}
          {canClear && (
            <button
              type="button"
              onClick={() => setRawQuery('')}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-gray-600 hover:bg-black/10"
              aria-label="ล้างข้อความ"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* สถานะ */}
      {isLoading && !!query && (
        <p className="text-sm text-gray-500">กำลังค้นหา...</p>
      )}
      {error && <p className="text-error">เกิดข้อผิดพลาดในการค้นหา</p>}

      {/* ผลลัพธ์ */}
      {data?.stores?.length ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.stores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        query &&
        !isLoading && (
          <p className="mt-3 text-sm text-gray-600">ไม่พบร้านที่ตรงกับคำค้น</p>
        )
      )}

      {/* ข้อความแนะเมื่อยังไม่พิมพ์ */}
      {!query && (
        <p className="mt-2 text-sm text-gray-500">
          ลองค้นหาชื่อร้าน เช่น “คาเฟ่”, “เสริมสวย”, “คาร์แคร์”
        </p>
      )}
    </main>
  );
}