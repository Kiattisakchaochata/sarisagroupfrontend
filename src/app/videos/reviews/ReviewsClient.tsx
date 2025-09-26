'use client';

import useSWR from 'swr';
import Image from 'next/image';

type Video = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url?: string | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8877').replace(/\/$/, '');

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const isLikelyImageUrl = (u?: string | null) => {
  if (!u) return false;
  try { return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(new URL(u).pathname); }
  catch { return typeof u === 'string' && u.startsWith('/'); }
};
const isExternalHttp = (u?: string | null) => typeof u === 'string' && /^https?:\/\//i.test(u);

export default function ReviewsClient() {
  const url = `${API_BASE}/api/videos?active=1&take=200`;
  const { data, error, isLoading } = useSWR<{ videos: Video[]; total: number }>(url, fetcher, { revalidateOnFocus: false });
  const videos = data?.videos ?? [];

  return (
    <main className="container mx-auto max-w-7xl px-4 md:px-6 py-10 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">วิดีโอรีวิวทั้งหมด</h1>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">
          โหลดข้อมูลไม่สำเร็จ<br />
          <code className="text-xs break-all">{String(error)}</code>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีวิดีโอรีวิว</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.youtube_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isLikelyImageUrl(v.thumbnail_url) ? (
                  isExternalHttp(v.thumbnail_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail_url as string} alt={v.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Image src={v.thumbnail_url as string} alt={v.title} fill className="object-cover"
                      sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
                  )
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-xs font-medium text-white/90">
                    <div className="px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">Video</div>
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col">
                <h2 className="text-sm font-medium leading-5 line-clamp-2 overflow-hidden text-ellipsis">{v.title}</h2>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}