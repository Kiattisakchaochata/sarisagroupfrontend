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
  date?: string;      // ISO หรือ string ทั่วไปก็ได้
  location?: string;
};

/* ฟอร์แมตวันที่ → ตัวอย่าง “5 พ.ย. 2025” (ไม่มีเวลา) */
function formatThaiDate(d?: string) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return ''; // กัน string ที่พาร์สไม่ได้
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(dt);
}

export default function EventsSwiper({ items }: { items: EventCard[] }) {
  // ทำ key ให้ unique เสมอ
  const seen = new Set<string>();
  const slides = (items || []).map((ev, index) => {
    let k = (ev.id ?? index).toString();
    if (seen.has(k)) k = `${k}__${index}`;
    seen.add(k);
    return { ...ev, _key: k };
  });

  if (!slides.length) return null;

  return (
    <section className="my-10">
      <Swiper
        className="events-swiper"
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        spaceBetween={18}
        slidesPerView={1.06}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 22 },
        }}
        loop={slides.length > 3}
      >
        {slides.map((ev) => (
          <SwiperSlide key={ev._key}>
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

              {/* เนื้อหาด้านล่าง: เว้นที่เยอะขึ้น และตัดเวลาออก */}
              <div className="p-4 md:p-5">
                <h3 className="text-base md:text-lg font-semibold leading-snug">
                  {ev.title}
                </h3>

                {(ev.date || ev.location) && (
                  <p className="mt-1 text-sm text-slate-600">
                    {[
                      formatThaiDate(ev.date), // ✅ ไม่มีเวลา
                      ev.location,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ปรับตำแหน่งจุดเลื่อน (pagination) ให้อยู่ล่างสุด ไม่ทับการ์ด */}
      <style jsx global>{`
        .events-swiper .swiper-pagination {
          position: static;
          margin-top: 14px;
        }
        .events-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d1d5db; /* slate-300 */
          opacity: 1;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .events-swiper .swiper-pagination-bullet-active {
          background: #4f46e5; /* indigo-600 */
          transform: scale(1.15);
        }
      `}</style>
    </section>
  );
}