'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

type Store = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  cover_image?: string | null;
  image_fit?: 'cover' | 'contain' | null; // << ใช้ตัดสินใจ object-fit
};

type StoresResp =
  | { stores: Store[] }    // บาง BE คืน {stores:[]}
  | { items: Store[] }     // บาง BE คืน {items:[]}
  | Store[];               // หรือคืน array ตรง ๆ

const key = '/stores?limit=200';

function normalize(resp: StoresResp): Store[] {
  if (Array.isArray(resp)) return resp;
  if ((resp as any)?.stores) return (resp as any).stores;
  if ((resp as any)?.items) return (resp as any).items;
  return [];
}

export default function StoresClient() {
  const { data, error, isLoading } = useSWR<StoresResp>(
    key,
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false }
  );

  const stores = normalize(data || []);

  return (
    <section className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-5">ร้านทั้งหมด</h1>

      {isLoading ? (
        <div className="text-gray-500">กำลังโหลด…</div>
      ) : error ? (
        <div className="text-red-400">โหลดไม่สำเร็จ</div>
      ) : stores.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีร้าน</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((s) => {
            const fit = s.image_fit === 'contain' ? 'object-contain p-2' : 'object-cover';
            const href = `/stores/${s.id}/featured`; // ใช้ id เพื่อไม่พลาด slug ที่อาจว่าง

            return (
              <li
                key={s.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <Link href={href} prefetch={false} className="block">
                  <figure className="relative aspect-[16/10] bg-white">
                    {s.cover_image ? (
                      <Image
                        src={s.cover_image}
                        alt={s.name}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        className={fit}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                        ไม่มีภาพหน้าปก
                      </div>
                    )}
                  </figure>
                </Link>

                <div className="p-4">
                  <div className="font-semibold truncate">{s.name}</div>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {s.description || 'ไม่มีคำอธิบาย'}
                  </p>
                  <div className="pt-3">
                    <Link
                      href={href}
                      prefetch={false}
                      className="inline-flex rounded-full bg-gray-900 text-white px-4 py-1.5 text-sm hover:bg-black/85"
                    >
                      เยี่ยมชมร้าน
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}