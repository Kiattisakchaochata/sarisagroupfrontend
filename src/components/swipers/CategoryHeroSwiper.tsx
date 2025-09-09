'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';

type BannerItem = {
  id: string;
  image_url: string;
  alt: string;
  href?: string;
};

export default function CategoryHeroSwiper({
  title,
  items,
  cardRatio = 'pt-[133%]',
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
      {title ? (
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
      ) : null}

      <Swiper
        modules={[Pagination, Autoplay]}
        className="category-rail"
        style={{ overflow: 'hidden' }}
        onBeforeInit={(swiper: SwiperCore) => {
          // bind external pagination element (no ts-ignore)
          const el = pagRef.current;
          if (el) {
            // Swiper types allow partial overwrite
            (swiper.params.pagination as any) = { el, clickable: true };
          }
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
          640:  { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        centeredSlides={false}
        watchOverflow
      >
        {items.map((b) => (
          <SwiperSlide key={b.id}>
            <div className="rounded-xl overflow-hidden shadow-md bg-base-100">
              <div className={`relative w-full ${cardRatio}`}>
                <Image
                  src={b.image_url}
                  alt={b.alt}
                  fill
                  className="absolute inset-0 object-cover"
                  sizes="(min-width:1024px) 32vw, (min-width:640px) 45vw, 90vw"
                  unoptimized
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div ref={pagRef} className="cat-pagination" />
    </section>
  );
}