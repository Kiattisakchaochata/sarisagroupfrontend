'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
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
  // การ์ดแนวตั้งขนาดเล็กลง
  cardRatio = 'pt-[133%]', // 4:3  (ปรับเป็น pt-[120%] ให้เตี้ยลง หรือ pt-[150%] ให้สูงขึ้น)
  // เลื่อนช้าลง ให้สบายตา
  speed = 600,              // ความเร็ว transition
}: {
  title: string;
  items: BannerItem[];
  cardRatio?: string;
  speed?: number;
}) {
  const pagRef = useRef<HTMLDivElement | null>(null);

  if (!items?.length) return null;

  return (
    <section className="my-10 overflow-x-hidden"> {/* กันทั้งหน้าเลื่อนไปทางข้าง */}
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        className="category-rail"
        // ❌ เอา overflow: visible ออก เพื่อป้องกันเพจเลื่อนทั้งหน้า
        style={{ overflow: 'hidden' }}
        // ✅ ผูก pagination ไป element ภายนอกตั้งแต่ต้น → ไม่สร้าง div ภายใน
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.pagination = {
            el: pagRef.current,
            clickable: true,
          };
        }}
        // ✅ autoplay แบบ “ช้า ๆ” และไม่หยุดเมื่อแตะ
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={speed}
        // ✅ หมุนวนเพื่อไม่ให้ “ดีดกลับ” ตอนสุดท้าย
        loop={true}
        // ✅ จำกัด gesture ให้เป็นแนวนอน แยกจาก scroll ของเพจ
        // (ค่าเริ่มต้นของ Swiper ก็โอเคอยู่ แต่เสริมเพื่อกันกระตุก/ดึงทั้งเพจ)
        allowTouchMove={true}
        resistanceRatio={0}              // ลดแรงดีด
        touchStartPreventDefault={true}
        passiveListeners={false}
        // ขนาดการ์ด
        slidesPerView={2}
        spaceBetween={16}
        breakpoints={{
          640:  { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        centeredSlides={false}
        // ถ้าจำนวนรูปไม่พอ ให้ Swiper ปรับตัว ไม่ก่อปัญหาเลื่อน
        watchOverflow={true}
      >
        {items.map((b) => (
          <SwiperSlide key={b.id}>
            <div className="rounded-xl overflow-hidden shadow-md bg-base-100">
              {/* กล่องสัดส่วนแนวตั้ง */}
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

      {/* ✅ จุดอยู่นอก Swiper → ไม่ทับรูป และไม่มี div pagination ภายในอีกต่อไป */}
      <div ref={pagRef} className="cat-pagination" />
    </section>
  );
}