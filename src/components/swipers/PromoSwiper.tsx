// 'use client'
// import useSWR from 'swr'
// import { Swiper, SwiperSlide } from 'swiper/react'
// import { Navigation, Pagination, Autoplay } from 'swiper/modules'
// import Image from 'next/image'
// import Link from 'next/link'
// import { apiBase, fetcher } from '@/lib/swrFetcher'

// type Banner = {
//   id: string
//   title?: string | null
//   alt_text?: string | null
//   image_url: string
//   href?: string | null
//   order: number
// }

// export default function PromoSwiper({ heightClass = 'promo-slide-img' }: { heightClass?: string }) {
//   const { data, error, isLoading } = useSWR<{ banners: Banner[] }>(
//     `${apiBase}/api/banners`,
//     fetcher
//   )
//   if (error) return <div className="alert alert-error">โหลดแบนเนอร์ไม่สำเร็จ</div>
//   if (isLoading) return <div className="skeleton h-48 w-full" />

//   const banners = data?.banners ?? []

//   return (
//     <div className="w-full">
//       <Swiper
//         modules={[Navigation, Pagination, Autoplay]}
//         navigation
//         pagination={{ clickable: true }}
//         autoplay={{ delay: 3500, disableOnInteraction: false }}
//         loop
//         className="rounded-2xl shadow-xl"
//       >
//         {banners.map((b) => {
//           const img = (
//             <Image
//               src={b.image_url}
//               alt={b.alt_text || b.title || 'banner'}
//               width={1600}
//               height={700}
//               className={`${heightClass} w-full object-cover`}
//               priority
//             />
//           )
//           return (
//             <SwiperSlide key={b.id}>
//               {b.href ? <Link href={b.href} className="block">{img}</Link> : img}
//             </SwiperSlide>
//           )
//         })}
//       </Swiper>
//     </div>
//   )
// }