'use client';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import Image from 'next/image';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  cover_image?: string | null;
};

export default function CategoryGrid() {
  const { data, error, isLoading } = useSWR<Category[]>('/api/categories', swrFetcher);
  const categories = data || [];
  if (error) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">หมวดหมู่</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/stores?cat=${c.id}`} className="card bg-base-100 shadow rounded-2xl hover:shadow-md transition">
              {c.cover_image ? (
                <figure className="aspect-[16/9] overflow-hidden rounded-t-2xl relative">
                  <Image src={c.cover_image} alt={c.name} fill className="object-cover" sizes="(min-width:768px) 25vw, 50vw" />
                </figure>
              ) : null}
              <div className="card-body p-3">
                <h3 className="font-medium">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}