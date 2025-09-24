'use client';

import Link from 'next/link';
import { useRef } from 'react';

export type FeaturedItem = {
  image_id: string;
  image_url: string;
  menu_name?: string | null;
  price?: number | null;
  store_id: string;
  store_name: string;
  store_slug: string;
  avg_rating?: number | null;
  rating_count?: number | null;
};

type Props = {
  items: FeaturedItem[];
  title?: string;
  hrefAll?: string;
  cardWidth?: number;
  cardHeight?: number;
  maxItems?: number;
  gapPx?: number;
};

export default function FeaturedGrid({
  items,
  title,
  hrefAll,
  cardWidth = 380,
  cardHeight = 500,
  maxItems = 10, // ✅ default 10
  gapPx = 16,
}: Props) {
  if (!items?.length) return null;

  const rows = items.slice(0, maxItems);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: dir * (cardWidth + gapPx),
      behavior: 'smooth',
    });
  };

  const storeName = rows[0]?.store_name ?? '';

  return (
    <section>
      <div className="section-header">
        <h2 className="section-title">{title ?? storeName}</h2>
        {hrefAll && (
          <a href={hrefAll} className="link-pill">
            ดูทั้งหมด
          </a>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scrollByCard(-1)}
          className="hidden md:flex absolute left-1.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
          aria-label="Previous"
        >
          ‹
        </button>

        <button
          onClick={() => scrollByCard(1)}
          className="hidden md:flex absolute right-1.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
          aria-label="Next"
        >
          ›
        </button>

        <div
          ref={trackRef}
          // ⬇️ เอา -mx-1 ออก และใส่ paddingRight ให้เท่าช่องว่างการ์ด เพื่อไม่ให้การ์ดสุดท้ายชิด/หลุดขอบ
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 [scrollbar-width:none]"
          style={{ gap: `${gapPx}px`, paddingRight: `${gapPx}px` }}  // ✅ กันชนขวา
        >
          {rows.map((it) => (
            <Link
              key={it.image_id}
              href={`/stores/${it.store_id}/featured`}
              className="snap-start flex-none overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300"
              style={{ width: cardWidth }}
            >
              {/* รูป + badge ดาว */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image_url}
                  alt={it.menu_name ?? storeName}
                  className="block w-full object-cover"
                  style={{ height: cardHeight, objectPosition: '50% 35%' }}
                />

                {/* ✅ Badge คะแนนเฉลี่ย */}
                {typeof it.avg_rating === 'number' && it.avg_rating > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.401 8.167L12 18.896l-7.335 3.867 1.401-8.167L.132 9.21l8.2-1.192L12 .587z"/>
                    </svg>
                    <span>{it.avg_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="px-4 py-3">
                <div className="text-[16px] font-semibold leading-snug text-gray-900 line-clamp-2">
                  {it.menu_name ?? ''}
                  {typeof it.price === 'number' ? ` • ${it.price} บาท` : ''}
                </div>
              </div>
            </Link>
          ))}

          {/* ✅ ตัวกันชนท้ายแทร็ก เพิ่มพื้นที่ว่างอีกชั้นกันภาพชนขอบขวา */}
          <div aria-hidden className="flex-none" style={{ width: `${gapPx}px` }} />
        </div>

        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}