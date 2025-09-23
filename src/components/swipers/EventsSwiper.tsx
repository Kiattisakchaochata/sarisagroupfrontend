'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';

export type EventCard = {
  id?: string | number;
  title: string;
  cover_image: string;
  date?: string;      // ไม่แสดงผล
  location?: string;  // ไม่แสดงผล
};

export default function EventsSwiper({ items }: { items: EventCard[] }) {
  const base = Array.isArray(items) ? items : [];

  // ✅ ให้แน่ใจว่ามีสไลด์พอ (8 ใบขึ้นไป) จะได้วนลูปไม่สะดุด
  const MIN_SLIDES = 8;
  const repeat = base.length > 0 ? Math.ceil(MIN_SLIDES / base.length) : 0;

  const duplicated = repeat > 1
    ? Array.from({ length: repeat }, (_, r) =>
        base.map((ev, i) => ({
          ...ev,
          _dupKey: `${ev.id ?? i}-${r}`,
        }))
      ).flat()
    : base.map((ev, i) => ({ ...ev, _dupKey: `${ev.id ?? i}-0` }));

  if (!duplicated.length) return null;

  return (
    <section className="my-10">
      <Swiper
        className="events-swiper"
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={800}
        spaceBetween={18}
        slidesPerView={1.06}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 22 },
        }}
        loop={true}
        onBeforeInit={(swiper) => {
          swiper.params.loopedSlides = 3;
          swiper.params.loopAdditionalSlides = 3;
        }}
      >
        {duplicated.map((ev) => (
          <SwiperSlide key={ev._dupKey}>
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-lg">
              <figure className="relative">
                <Image
                  src={ev.cover_image}
                  alt={ev.title}
                  width={1600}
                  height={1066}
                  className="h-60 w-full object-cover md:h-64"
                  unoptimized
                />
              </figure>
              <div className="p-4 md:p-5">
                <h3 className="text-base md:text-lg font-semibold leading-snug">
                  {ev.title}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .events-swiper .swiper-pagination {
          position: static;
          margin-top: 14px;
        }
        .events-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d1d5db;
          opacity: 1;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .events-swiper .swiper-pagination-bullet-active {
          background: #f59e0b;
          transform: scale(1.15);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18);
        }
      `}</style>
    </section>
  );
}