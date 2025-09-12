// src/components/swipers/CategoryHeroSwiper.tsx
'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';

// ✅ ใช้ type ของ PaginationOptions เพื่อเลี่ยง any
import type { PaginationOptions } from 'swiper/types';

type BannerItem = {
  id: string;
  image_url: string;
  alt: string;
  href?: string;
};

// ✅ สร้าง type เสริมสำหรับ Swiper instance ที่เราต้องการแก้ params.pagination
type SwiperWithPagination = {
  params: {
    pagination?: PaginationOptions | boolean;
  };
};

export default function CategoryHeroSwiper({
  title,
  items,
  cardRatio = 'pt-[133%]', // 4:3
  speed = 600,
}: {
  title: string;
  items: BannerItem[];
  cardRatio?: string;
  speed?: number;
}) {
  const pagRef = useRef<HTMLDivElement | null>(null);

  if (!items?.length) return null;

  return (
    <section className="my-10 overflow-x-hidden">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        className="category-rail"
        style={{ overflow: 'hidden' }}
        onBeforeInit={(swiper) => {
          // ✅ cast เฉพาะส่วนที่ต้องการ โดยไม่ใช้ any
          const s = swiper as unknown as SwiperWithPagination;
          const paginationOpts: PaginationOptions = {
            el: pagRef.current ?? undefined,
            clickable: true,
          };
          s.params.pagination = paginationOpts;
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={speed}
        loop
        allowTouchMove
        resistanceRatio={0}
        touchStartPreventDefault
        passiveListeners={false}
        slidesPerView={2}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        centeredSlides={false}
        watchOverflow
      >
        {items.map((b, idx) => (
          <SwiperSlide key={b.id}>
            <div className="rounded-xl overflow-hidden shadow-md bg-base-100">
              <div className={`relative w-full ${cardRatio}`}>
                <Image
                  src={b.image_url}
                  alt={b.alt}
                  fill
                  className="absolute inset-0 object-cover"
                  sizes="(min-width:1024px) 32vw, (min-width:640px) 45vw, 90vw"
                  // 👇 ทำให้รูปแรกของสไลด์เป็น LCP-friendly
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  // หมายเหตุ: คง unoptimized ตามของเดิมไว้ (ถ้าอยากใช้ pipeline ของ Next ค่อยเอาออกภายหลัง)
                  unoptimized
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* pagination อยู่นอก Swiper → ไม่ทับรูป */}
      <div ref={pagRef} className="cat-pagination" />
    </section>
  );
}