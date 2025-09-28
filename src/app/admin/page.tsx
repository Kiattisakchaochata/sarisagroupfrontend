// src/app/admin/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
// ⛔️ ลบ: import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type StoreRow = {
  id: string;
  name: string;
  cover_image?: string | null;
  address?: string | null;
  order_number?: number | null;
  category_id?: string | null;
  reviews?: { rating: number }[];
  visitorCounter?: { total: number } | null;
};

type StoreListResp = { stores: StoreRow[] };

type AdminStats = {
  totalUsers: number;
  totalCategories: number;
  totalStores: number;
  totalViews: number;
  stores: {
    id: string;
    name: string;
    views: number;
    avgRating?: number;
  }[];
};
// ⬇️ วางต่อจาก type AdminStats
type VisitorStats = {
  totalVisitors: number;
};

function AdminPageInner() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<VisitorStats | null>(null);

  useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      // 1) ดึงรายการร้าน (ใช้สำหรับ derive รวมผู้เข้าชม ถ้าไม่มี /admin/stats)
      const storeResp = await apiFetch<StoreListResp>('/admin/stores');
      if (!mounted) return;
      setStores(storeResp.stores ?? []);

      // 2) พยายามดึง /admin/stats ถ้ามี (optional)
      try {
        const s = await apiFetch<AdminStats>('/admin/stats', { method: 'GET' });
        if (mounted) setStats(s);
      } catch {
        if (!mounted) return;
        const derived = deriveStatsFromStores(storeResp.stores ?? []);
        setStats(derived);
      }

      // ⬇️ เพิ่ม: ดึงผู้เข้าชมรวมจาก /visitor/stats
      try {
        const v = await apiFetch<VisitorStats>('/visitor/stats', { method: 'GET' });
        if (mounted) setVisitor(v);
      } catch { /* ignore */ }

    } finally {
      if (mounted) setLoading(false);
    }
  })();
  return () => { mounted = false; };
}, []);

  // ⛔️ ลบ: const storeCards = useMemo(...)

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-8 text-white">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">แผงควบคุม</h1>
        <p className="text-gray-400">จัดการข้อมูลบนเว็บไซต์ Sarisagroup</p>
      </header>

      {/* การ์ดสรุปผู้เข้าชมรวมแบบไฮไลต์ (เหลือใบเดียวตามที่ต้องการ) */}
      <section className="grid grid-cols-1 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(147,51,234,0.9) 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(currentColor 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)',
              backgroundPosition: '0 0, 10px 10px',
              backgroundSize: '20px 20px',
              color: 'rgba(255,255,255,0.35)',
            }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-white/90 text-sm font-medium">ผู้เข้าชมทั้งหมด</div>
              <div className="mt-2 text-5xl sm:text-6xl font-extrabold text-white drop-shadow">
                {loading ? '—' : ((visitor?.totalVisitors ?? stats?.totalViews ?? 0).toLocaleString('th-TH'))}
              </div>
            </div>
            <div className="text-5xl sm:text-6xl">👁️</div>
          </div>
        </div>
      </section>

      {/* ⛔️ ลบทั้งบล็อก “ร้านค้า” ออก */}
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10 text-white">
          กำลังโหลด...
        </main>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}

/* ---------- Helpers ---------- */
function deriveStatsFromStores(stores: StoreRow[]): AdminStats {
  const totalStores = stores.length;
  const totalCategories = new Set(stores.map((s) => s.category_id).filter(Boolean)).size;
  const totalViews = stores.reduce((sum, s) => sum + (s.visitorCounter?.total ?? 0), 0);

  // ถึงแม้เราจะไม่แสดงการ์ดร้านค้าแล้ว แต่คงรูปแบบเดิมไว้เผื่อใช้ในอนาคต
  const storesForCards = stores.map((s, i) => {
    const avg =
      s.reviews && s.reviews.length
        ? s.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / s.reviews.length
        : undefined;
    return { id: s.id ?? `store-${i}`, name: s.name, views: s.visitorCounter?.total ?? 0, avgRating: avg };
  });

  return {
    totalUsers: 0,
    totalCategories,
    totalStores,
    totalViews,
    stores: storesForCards,
  };
}

/* ---------------- Components ---------------- */
// ⛔️ ลบคอมโพเนนต์ StoreCard ออกทั้งหมด (ไม่ถูกใช้งานแล้ว)