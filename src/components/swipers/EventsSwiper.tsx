'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import Image from 'next/image'

export type EventCard = {
  id: string
  title: string
  cover_image: string
  date?: string
  href?: string
  location?: string
}

export default function EventsSwiper({
  items,
  imageClass = 'h-48', // ปรับความสูงภาพแต่ละการ์ดได้
}: {
  items: EventCard[]
  imageClass?: string
}) {
  if (!items?.length) return null

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        spaceBetween={16}
        breakpoints={{
          320: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
        className="py-2"
      >
        {items.map((ev) => (
          <SwiperSlide key={ev.id}>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
              <figure className="relative">
                <Image
                  src={ev.cover_image}
                  alt={ev.title}
                  width={800}
                  height={500}
                  className={`${imageClass} w-full object-cover`}
                />
                {ev.date ? (
                  <div className="badge badge-primary absolute left-3 top-3">
                    {new Date(ev.date).toLocaleDateString('th-TH')}
                  </div>
                ) : null}
              </figure>
              <div className="card-body">
                <h3 className="card-title text-base md:text-lg">{ev.title}</h3>
                {ev.location ? <p className="text-sm opacity-70">{ev.location}</p> : null}
                <div className="card-actions justify-end">
                  {ev.href ? <a className="btn btn-sm btn-primary" href={ev.href}>ดูรายละเอียด</a> : null}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}