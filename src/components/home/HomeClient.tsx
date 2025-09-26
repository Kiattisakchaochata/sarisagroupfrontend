'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';

import ImpactStrip from '@/components/ImpactStrip';
import StoresLogoWall from '@/components/StoresLogoWall';
import FeaturedGrid, { type FeaturedItem } from '@/components/home/FeaturedGrid';
import { useHomepage } from '@/hooks/useHomepage';
import { apiFetch } from '@/lib/api';
import type { EventCard } from '@/components/swipers/EventsSwiper';

// ✅ โหลดฝั่ง client เท่านั้น เพื่อกัน SSR/hydration mismatch ในคอมโพเนนต์ลูก
const VideoGallery = dynamic(() => import('@/components/VideoGallery'), { ssr: false });
const EventsSwiper  = dynamic(() => import('@/components/swipers/EventsSwiper'), { ssr: false });

/** ให้ลูก render หลัง mount (เลี่ยง hydration แตกถ้าลูกมี hooks แปลก) */
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted ? <>{children}</> : null;
}

type FeaturedItemWithOrder = FeaturedItem & { featured_order?: number | null };
type FeaturedGroup = {
  store_id: string;
  store_slug: string;
  store_name: string;
  order: number;
  items: FeaturedItemWithOrder[];
};

const PER_STORE_MAX = 10;

export default function HomeClient() {
  // ⬇️ hooks ทั้งหมด “เรียกทุกครั้ง” ไม่มีเงื่อนไข → ลำดับคงที่
  const { data: home } = useHomepage();
  const [groups, setGroups] = useState<FeaturedGroup[]>([]);

  useEffect(() => {
    apiFetch<{ items: FeaturedItemWithOrder[] }>('/stores/home/featured')
      .then(({ items }) => {
        const map = new Map<string, FeaturedGroup>();
        items.forEach((it, idx) => {
          if (!map.has(it.store_id)) {
            map.set(it.store_id, {
              store_id: it.store_id,
              store_slug: it.store_slug,
              store_name: it.store_name,
              order: idx,
              items: [],
            });
          }
          map.get(it.store_id)!.items.push(it);
        });

        const groupsArr = Array.from(map.values()).map((g) => {
          const sorted = [...g.items].sort((a, b) => {
            const aa = a.featured_order ?? Number.MAX_SAFE_INTEGER;
            const bb = b.featured_order ?? Number.MAX_SAFE_INTEGER;
            return aa - bb;
          });
          return { ...g, items: sorted.slice(0, PER_STORE_MAX) };
        });

        groupsArr.sort((a, b) => a.order - b.order);
        setGroups(groupsArr);
      })
      .catch(() => setGroups([]));
  }, []);

  const rowOf = (k: string) => home?.rows?.find((r: any) => r.kind === k && r.visible);
  const rowVideos = rowOf('videos');
  const rowEvents = rowOf('events');
  const rowNetwork = rowOf('network');

  // โลโก้เครือ
  const logoItems =
    Array.isArray(home?.storesMini) && home!.storesMini.length > 0
      ? home!.storesMini.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug ?? s.id,
          logo_url: s.logo ?? s.logo_url ?? s.cover_image ?? null,
          contain: !!s.contain,
        }))
      : [
          { id: 'mock-1', name: 'S-WASH', slug: 's-wash', logo_url: '/images/mock/brand-a.png', contain: false },
          { id: 'mock-2', name: 'SARI CHA', slug: 'sari-cha', logo_url: '/images/mock/brand-b.png', contain: true },
          { id: 'mock-3', name: 'SARISA SALON', slug: 'sarisa-salon', logo_url: '/images/mock/brand-c.png', contain: true },
          { id: 'mock-4', name: 'ครัวคุณ…', slug: 'krua', logo_url: '/images/mock/brand-d.png', contain: true },
        ];

  // Events (hook นี้เรียกทุกครั้ง ไม่อยู่ใน if)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
  const { data: eventsData } = useSWR<{ events: EventCard[] }>(
    `${API_BASE}/api/events?active=1&take=12`,
    async (url: string) => {
      const res = await fetch(url, { credentials: 'include' });
      const ctype = res.headers.get('content-type') || '';
      if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
      if (!ctype.includes('application/json')) throw new Error('Expected JSON');
      return res.json();
    },
    { revalidateOnFocus: false }
  );

  const events: EventCard[] = eventsData?.events?.length
    ? eventsData.events
    : [
        { id: 'e1', title: 'งานเปิดตัวสาขาใหม่', cover_image: '/images/mock/event-1.jpg', date: '2025-08-01', location: 'ขอนแก่น' },
        { id: 'e2', title: 'Workshop ล้างรถรักษ์โลก', cover_image: '/images/mock/event-2.jpg', date: '2025-09-15', location: 'มหาสารคาม' },
        { id: 'e3', title: 'เวิร์กช็อปชุมชน', cover_image: '/images/mock/event-3.jpg', date: '2025-10-12', location: 'กาฬสินธุ์' },
      ];

  return (
    <main className="container mx-auto max-w-7xl px-4 md:px-6 space-y-12 md:space-y-16">
      {/* hero */}
      <section className="relative mt-8 md:mt-14">
        <div className="text-center space-y-3">
          <h1 className="text-[22px] md:text-4xl leading-tight font-semibold tracking-tight text-gray-900">
            {home?.hero?.title ?? (
              <>
                ธุรกิจเพื่อชุมชน <span className="font-bold">– ขาดทุนไม่ว่า เสียชื่อไม่ได้</span>
              </>
            )}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {home?.hero?.subtitle ??
              'ร้านอาหาร • คาเฟ่ • เสริมสวย • คาร์แคร์ ฯลฯ — เน้นคุณภาพ รสชาติอร่อย ใช้พลังงานทดแทน และช่วยสร้างงานในท้องถิ่น'}
          </p>
        </div>
        <div className="mt-6 md:mt-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5" />
        </div>
      </section>

      {/* รูปเด่นต่อร้าน */}
      {groups.map((g) => (
        <FeaturedGrid
          key={g.store_id}
          items={g.items}
          title={g.store_name}
          hrefAll={`/stores/${g.store_id}/featured`}
          cardWidth={400}
          cardHeight={450}
          maxItems={PER_STORE_MAX}
          gapPx={16}
        />
      ))}

      <ImpactStrip />

      {/* โลโก้เครือ */}
      <StoresLogoWall items={logoItems} title={rowNetwork?.title ?? 'ร้านในเครือของเรา'} />

      {/* วิดีโอ */}
      <section>
        <div className="section-header">
          <h2 className="section-title">{rowVideos?.title ?? 'วิดีโอรีวิว'}</h2>
          <a href={rowVideos?.ctaHref ?? '/videos/reviews'} className="link-pill">
            {rowVideos?.ctaText ?? 'ดูทั้งหมด'}
          </a>
        </div>
        <ClientOnly>
          <VideoGallery />
        </ClientOnly>
      </section>

      {/* กิจกรรม */}
      <section>
        <div className="section-header">
          <h2 className="section-title">{rowEvents?.title ?? 'กิจกรรม'}</h2>
          <a href={rowEvents?.ctaHref ?? '/events'} className="link-pill">
            {rowEvents?.ctaText ?? 'ดูทั้งหมด'}
          </a>
        </div>
        <ClientOnly>
          <EventsSwiper items={events} />
        </ClientOnly>
      </section>
    </main>
  );
}