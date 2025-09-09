'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import Image from 'next/image';
import Link from 'next/link';

type Video = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url?: string | null;
};

export default function VideoGallery({
  showHeader = false,
  headerTitle = 'วิดีโอรีวิว',
  allHref = '/videos',
}: {
  showHeader?: boolean;
  headerTitle?: string;
  allHref?: string;
}) {
  const { data, error, isLoading } = useSWR<{ videos: Video[]; total: number }>(
    '/api/videos?active=1&take=8',
    swrFetcher
  );

  if (error) return null;
  const videos = data?.videos || [];

  return (
    <section className="mt-6">
      {showHeader && (
        <div className="section-header">
          <h2 className="section-title">{headerTitle}</h2>
          <Link href={allHref} className="link-pill">ดูทั้งหมด</Link>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="card bg-base-100 rounded-2xl shadow hover:shadow-md transition"
            >
              <figure className="aspect-video overflow-hidden rounded-t-2xl bg-base-200 relative">
                {v.thumbnail_url ? (
                  <Image src={v.thumbnail_url} alt={v.title} fill className="object-cover" sizes="(min-width:1024px) 25vw, 50vw" />
                ) : (
                  <div className="w-full h-full grid place-items-center opacity-70">Video</div>
                )}
              </figure>
              <div className="card-body p-3">
                <h3 className="text-sm font-medium line-clamp-2">{v.title}</h3>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}