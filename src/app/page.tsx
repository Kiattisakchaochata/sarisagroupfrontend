// src/app/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ImpactStrip from '@/components/ImpactStrip'
import VideoGallery from '@/components/VideoGallery'
import PromoSwiper from '@/components/swipers/PromoSwiper'
import EventsSwiper, { type EventCard } from '@/components/swipers/EventsSwiper'
import JsonLd from '@/components/JsonLd'
import CategoryHeroSwiper from '@/components/swipers/CategoryHeroSwiper'
import { bannerGroups } from '@/data/bannerGroups'

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // === SEO JSON-LD ===
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'Sarisagroup',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sarisagroup',
    url: siteUrl,
    logo: `${siteUrl}/apple-touch-icon.png`,
  }

  // === Mock Events ===
  const mockEvents: EventCard[] = [
    { id: 'e1', title: 'งานเปิดตัวสาขาใหม่', cover_image: '/images/mock/event-1.jpg', date: '2025-08-01T09:00:00Z', location: 'ขอนแก่น' },
    { id: 'e2', title: 'Workshop ล้างรถรักษ์โลก', cover_image: '/images/mock/event-2.jpg', date: '2025-09-15T10:00:00Z', location: 'มหาสารคาม' },
    { id: 'e2', title: 'Workshop ล้างรถรักษ์โลก', cover_image: '/images/mock/event-3.jpg', date: '2025-09-15T10:00:00Z', location: 'มหาสารคาม' },
    { id: 'e2', title: 'Workshop ล้างรถรักษ์โลก', cover_image: '/images/mock/event-4.jpg', date: '2025-09-15T10:00:00Z', location: 'มหาสารคาม' },
  ]

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={orgJsonLd} />

      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 md:px-6 space-y-12 md:space-y-16">
        {/* ===== Hero Section (copy + promo) ===== */}
        <section className="relative mt-8 md:mt-14">
          <div className="text-center space-y-3">
            <h1 className="text-[22px] md:text-4xl leading-tight font-semibold tracking-tight text-gray-900">
              ธุรกิจเพื่อชุมชน <span className="font-bold">– ขาดทุนไม่ว่า เสียชื่อไม่ได้</span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              ร้านอาหาร • คาเฟ่ • เสริมสวย • คาร์แคร์ ฯลฯ — เน้นคุณภาพ รสชาติอร่อย
              ใช้พลังงานทดแทน และช่วยสร้างงานในท้องถิ่น
            </p>
          </div>

          {/* Banner (ดูโปร่ง สายตาไม่หนัก) */}
          <div className="mt-6 md:mt-8">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
              <PromoSwiper />
            </div>
          </div>
        </section>

        {/* ===== หมวดหลักแบบสไลด์แนวตั้ง ===== */}
        <section>
          <div className="section-header">
            <h2 className="section-title">🍜 ร้านอาหารเด่น</h2>
            <a href="/categories/food" className="link-pill">ดูทั้งหมด</a>
          </div>
          <CategoryHeroSwiper title="" items={bannerGroups.food} cardRatio="pt-[125%]" speed={12000} />
        </section>

        <section>
          <div className="section-header">
            <h2 className="section-title">☕ คาเฟ่ & เครื่องดื่ม</h2>
            <a href="/categories/cafe" className="link-pill">ดูทั้งหมด</a>
          </div>
          <CategoryHeroSwiper title="" items={bannerGroups.cafe} cardRatio="pt-[125%]" speed={12000} />
        </section>

        <section>
          <div className="section-header">
            <h2 className="section-title">💄 ร้านเสริมสวย</h2>
            <a href="/categories/beauty" className="link-pill">ดูทั้งหมด</a>
          </div>
          <CategoryHeroSwiper title="" items={bannerGroups.beauty} cardRatio="pt-[125%]" speed={12000} />
        </section>

        <section>
          <div className="section-header">
            <h2 className="section-title">🚗 คาร์แคร์ & คาเฟ่</h2>
            <a href="/categories/carcare" className="link-pill">ดูทั้งหมด</a>
          </div>
          <CategoryHeroSwiper title="" items={bannerGroups.carcare} cardRatio="pt-[125%]" speed={12000} />
        </section>

        {/* ===== แถบข้อความ Impact / จุดยืนของแบรนด์ ===== */}
        <ImpactStrip />

        {/* ===== วิดีโอรีวิว (คงเหลืออันเดียว) ===== */}
        <section>
          <div className="section-header">
            <h2 className="section-title">วิดีโอรีวิว</h2>
            <a href="/videos/reviews" className="link-pill">ดูทั้งหมด</a>
          </div>
          {/* ไม่ส่งพร็อพซ้ำหัวข้อแล้ว */}
          <VideoGallery />
        </section>

        {/* ===== กิจกรรมของเรา ===== */}
        <section>
          <div className="section-header">
            <h2 className="section-title">กิจกรรม</h2>
            <a href="/events" className="link-pill">ดูทั้งหมด</a>
          </div>
          <EventsSwiper items={mockEvents} />
        </section>
      </main>

      <Footer />
    </>
  )
}