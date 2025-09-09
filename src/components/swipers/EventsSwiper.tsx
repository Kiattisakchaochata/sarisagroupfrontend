'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';

export type EventCard = {
  id?: string | number;       // อนุญาตไม่มี id ได้
  title: string;
  cover_image: string;
  date?: string;
  location?: string;
};

export default function EventsSwiper({ items }: { items: EventCard[] }) {
  // สร้าง key ให้ unique เสมอ แม้ id จะซ้ำหรือว่าง
  const seen = new Set<string>();
  const slides = (items || []).map((ev, index) => {
    let k = (ev.id ?? index).toString();
    if (seen.has(k)) k = `${k}__${index}`; // กันซ้ำด้วย index
    seen.add(k);
    return { ...ev, _key: k };
  });

  if (!slides.length) return null;

  return (
    <section className="my-10">

      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        spaceBetween={16}
        slidesPerView={1.1}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        loop={slides.length > 3} // กันดีดกลับเมื่อรายการน้อย
      >
        {slides.map((ev) => (
          <SwiperSlide key={ev._key}>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
              <figure className="relative">
                <Image
                  src={ev.cover_image}
                  alt={ev.title}
                  width={1200}
                  height={800}
                  className="h-56 w-full object-cover"
                  unoptimized
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-base">{ev.title}</h3>
                {(ev.date || ev.location) && (
                  <p className="text-sm text-base-content/70">
                    {[ev.date, ev.location].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}