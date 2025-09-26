'use client';

import useSWR from 'swr';
import Image from 'next/image';

type Event = {
  id: string;
  title: string;
  cover_image?: string | null;
  date?: string | null;
  location?: string | null;
};

function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    '';
  if (!raw) return '/api';
  const trimmed = raw.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}
const API_BASE = getApiBase();

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text?.slice(0, 200)}`);
  }
  return res.json();
};

export default function EventsClient() {
  const { data, error, isLoading } = useSWR<{ events: Event[] }>(
    `${API_BASE}/events?active=1&take=200`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <section className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">กิจกรรมทั้งหมด</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">กิจกรรมทั้งหมด</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          ไม่สามารถโหลดข้อมูลกิจกรรมได้ ( {String(error.message)} )
        </div>
      </section>
    );
  }

  const events = data?.events ?? [];

  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">กิจกรรมทั้งหมด</h1>
      {events.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีกิจกรรม</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((ev) => (
            <article
              key={ev.id}
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {ev.cover_image ? (
                  <Image
                    src={ev.cover_image}
                    alt={ev.title}
                    fill
                    className="object-cover"
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                    ไม่มีรูป
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-base line-clamp-2">{ev.title}</h3>
                {ev.location && <p className="text-sm text-gray-500">📍 {ev.location}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}