// src/components/BannerCarousel.tsx
'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/swrFetcher';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

type Banner = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  title?: string | null;
  href?: string | null;
};

export default function BannerCarousel() {
  const { data, error, isLoading } = useSWR<{ banners: Banner[] }>(
    '/api/banners',
    swrFetcher
  );

  if (error) return null;
  const banners = data?.banners || [];

  return (
    <div className="w-full">
      {isLoading && <div className="skeleton h-48 w-full rounded-2xl" />}

      {!isLoading && banners.length > 0 && (
        <div className="carousel w-full rounded-2xl overflow-hidden">
          {banners.map((b) => (
            <div id={`banner-${b.id}`} className="carousel-item w-full" key={b.id}>
              {b.href ? (
                <Link href={b.href} className="block w-full">
                  <SafeImage
                    src={b.image_url}
                    alt={b.alt_text || b.title || 'banner'}
                    width={1600}
                    height={600}
                    className="w-full object-cover max-h-[420px]"
                    // โหลดทันทีเฉพาะภาพแรกใน carousel (ปล่อยให้เบา)
                    priority={false}
                  />
                </Link>
              ) : (
                <SafeImage
                  src={b.image_url}
                  alt={b.alt_text || b.title || 'banner'}
                  width={1600}
                  height={600}
                  className="w-full object-cover max-h-[420px]"
                  priority={false}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 py-3">
          {banners.map((b, i) => (
            <a key={b.id} href={`#banner-${b.id}`} className="btn btn-xs">
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}