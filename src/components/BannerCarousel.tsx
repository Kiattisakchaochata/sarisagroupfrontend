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
  const firstId = banners[0]?.id;

  return (
    <div className="w-full">
      {/* Skeleton: สงวนพื้นที่เท่ากับอัตราส่วนรูป เพื่อลด CLS */}
      {isLoading && (
        <div className="w-full rounded-2xl overflow-hidden">
          <div className="skeleton w-full aspect-[16/6]" />
        </div>
      )}

      {!isLoading && banners.length > 0 && (
        <div className="carousel w-full rounded-2xl overflow-hidden">
          {banners.map((b, idx) => {
            const isFirst = b.id === firstId;
            const Img = (
              <SafeImage
                src={b.image_url}
                alt={b.alt_text || b.title || 'banner'}
                width={1600}
                height={600}
                className="w-full h-auto object-cover aspect-[16/6] max-h-[420px]"
                // ช่วย LCP ภาพแรก / ที่เหลือ lazy
                priority={isFirst}
                fetchPriority={isFirst ? 'high' : 'auto'}
                loading={isFirst ? 'eager' : 'lazy'}
                sizes="100vw"
                decoding="async"
              />
            );

            return (
              <div id={`banner-${b.id}`} className="carousel-item w-full" key={b.id}>
                {b.href ? (
                  // ถ้าเป็นลิงก์นอก ให้ prefetch={false} เพื่อไม่ดึงเกินจำเป็น
                  <Link
                    href={b.href}
                    className="block w-full"
                    prefetch={b.href.startsWith('/') ? undefined : false}
                  >
                    {Img}
                  </Link>
                ) : (
                  Img
                )}
              </div>
            );
          })}
        </div>
      )}

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 py-3">
          {banners.map((b, i) => (
            <a
              key={b.id}
              href={`#banner-${b.id}`}
              className="btn btn-xs"
              aria-label={`สไลด์ที่ ${i + 1}`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}