'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import StoreCard from './StoreCard';
import Link from 'next/link';

type Store = {
  id: string;
  name: string;
  description?: string;
  cover_image?: string | null;
  category?: { name: string };
};

export default function PopularStores() {
  const { data, error, isLoading } = useSWR<{ stores: Store[] }>(
    '/api/stores/popular',
    swrFetcher
  );

  if (error) return null;
  const stores = data?.stores || [];

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">ร้านยอดนิยม ⭐️</h2>
        <Link href="/stores" className="btn btn-sm btn-ghost">ดูทั้งหมด</Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stores.map((s) => <StoreCard key={s.id} store={s} />)}
        </div>
      ) : (
        <div className="alert">
          <span>ยังไม่มีข้อมูลร้านยอดนิยม</span>
        </div>
      )}
    </section>
  );
}