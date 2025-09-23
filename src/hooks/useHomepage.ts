'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/api';

export type HomePayload = {
  hero: { title: string; subtitle: string; showSearch?: boolean };
  missionsSubtitle?: string;
  missions: { id: string; title: string }[];
  rows: any[];
  storesMini: any[];
  updatedAt: string;
};

const FALLBACK: HomePayload = {
  hero: {
    title: 'ธุรกิจเพื่อชุมชน – ขาดทุนไม่ว่า เสียชื่อไม่ได้',
    subtitle:
      'ร้านอาหาร • คาเฟ่ • เสริมสวย • คาร์แคร์ ฯลฯ — เน้นคุณภาพ รสชาติอร่อย ใช้พลังงานทดแทน และช่วยสร้างงานในท้องถิ่น',
    showSearch: false,
  },
  missionsSubtitle:
    'เรายืนหยัดเรื่องคุณภาพ ความจริงใจ และผลลัพธ์ที่ดีต่อท้องถิ่น — ขับเคลื่อนโดยพลังงานทางเลือกและความรับผิดชอบต่อสิ่งแวดล้อม',
  missions: [
    { id: 'm1', title: 'สร้างงานในชุมชนจริงจัง' },
    { id: 'm2', title: 'ตั้งใจเปิดโอกาสการจ้างงานท้องถิ่น' },
    { id: 'm3', title: 'พลังงานทดแทน ลดคาร์บอน' },
    { id: 'm4', title: 'เลือกเทคโนโลยีที่เป็นมิตรต่อสิ่งแวดล้อม' },
    { id: 'm5', title: 'คุณภาพมาก่อน' },
    { id: 'm6', title: '“ขาดทุนไม่ว่า เสียชื่อไม่ได้”' },
  ],
  rows: [],
  storesMini: [],
  updatedAt: new Date().toISOString(),
};

type RawHomepage =
  | {
      id?: string;
      hero_title?: string | null;
      hero_subtitle?: string | null;
      missions?:
        | Array<{ id?: string; title?: string | null } | string>
        | { subtitle?: string | null; items?: Array<{ id?: string; title?: string | null } | string> }
        | null;
      missions_subtitle?: string | boolean | null; // 👈 เพิ่มรองรับฟิลด์นี้
      rows?: any[] | null;
      updated_at?: string;
      storesMini?: any[] | null;
    }
  | {
      // UI-ready
      hero?: any;
      missions?: any;            // อาจเป็น array หรือ { items, subtitle }
      missionsSubtitle?: string;
      rows?: any;
      storesMini?: any;
      updatedAt?: string;
    }
  | null;

function toArrayMissions(missions: any): { id: string; title: string }[] {
  if (!missions) return [];
  if (!Array.isArray(missions) && typeof missions === 'object' && Array.isArray(missions.items)) {
    missions = missions.items;
  }
  if (!Array.isArray(missions)) return [];
  return missions
    .map((m: any, i: number) => {
      if (typeof m === 'string') {
        const t = m.trim();
        return t ? { id: `m-${i + 1}`, title: t } : null;
      }
      if (m && typeof m === 'object') {
        const t = (m.title ?? '').toString().trim();
        if (!t) return null;
        return { id: m.id ?? `m-${i + 1}`, title: t };
      }
      return null;
    })
    .filter(Boolean) as { id: string; title: string }[];
}

function normalize(raw: RawHomepage | undefined): HomePayload {
  if (!raw) return FALLBACK;

  // ✅ UI-ready (ยอมรับทั้ง array และ object{items})
  if (raw && typeof raw === 'object' && 'hero' in raw) {
    const rr = raw as any;
    const missions = toArrayMissions(rr.missions);
    return {
      hero: {
        title: rr.hero?.title ?? FALLBACK.hero.title,
        subtitle: rr.hero?.subtitle ?? FALLBACK.hero.subtitle,
        showSearch: !!rr.hero?.showSearch,
      },
      missionsSubtitle:
        (typeof rr.missionsSubtitle === 'string' && rr.missionsSubtitle) ||
        (rr.missions && typeof rr.missions === 'object' && rr.missions.subtitle) ||
        FALLBACK.missionsSubtitle,
      missions: missions.length ? missions : FALLBACK.missions,
      rows: Array.isArray(rr.rows) ? rr.rows : [],
      storesMini: Array.isArray(rr.storesMini) ? rr.storesMini : [],
      updatedAt: typeof rr.updatedAt === 'string' ? rr.updatedAt : new Date().toISOString(),
    };
  }

  // 🧱 raw จาก DB
  const r = raw as any;
  const heroTitle = (typeof r.hero_title === 'string' && r.hero_title) || FALLBACK.hero.title;
  const heroSubtitle = (typeof r.hero_subtitle === 'string' && r.hero_subtitle) || FALLBACK.hero.subtitle;

  const missionsSubtitle =
    (typeof r.missions_subtitle === 'string' && r.missions_subtitle) ||
    (r?.missions && typeof r.missions === 'object' && !Array.isArray(r.missions) && (r.missions.subtitle ?? '')) ||
    '';

  const missions = toArrayMissions(r.missions);

  return {
    hero: { title: heroTitle, subtitle: heroSubtitle, showSearch: false },
    missionsSubtitle: missionsSubtitle || FALLBACK.missionsSubtitle,
    missions: missions.length ? missions : FALLBACK.missions,
    rows: Array.isArray(r.rows) ? r.rows : [],
    storesMini: Array.isArray(r.storesMini) ? r.storesMini : [],
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

export function useHomepage() {
  const { data, error, isLoading, mutate } = useSWR<RawHomepage>(
    '/homepage',
    (url) => apiFetch(url).catch(() => null),
    { revalidateOnFocus: false, shouldRetryOnError: false, dedupingInterval: 1500 }
  );

  return {
    data: normalize(data ?? undefined),
    error,
    isLoading,
    mutate,
  };
}