'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) ดึงรายการร้าน (เป็นหลัก)
        const storeResp = await apiFetch<StoreListResp>('/admin/stores');
        if (!mounted) return;
        setStores(storeResp.stores ?? []);

        // 2) พยายามดึง /admin/stats ถ้ามี (optional)
        try {
          const s = await apiFetch<AdminStats>('/admin/stats', { method: 'GET' });
          if (mounted) setStats(s);
        } catch {
          // ถ้าไม่มี /admin/stats → สร้าง stats แบบอนุมานจากลิสต์ร้าน
          if (!mounted) return;
          const derived = deriveStatsFromStores(storeResp.stores ?? []);
          setStats(derived);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // สร้างการ์ดร้านสำหรับแสดง (รองรับทั้งกรณีมี/ไม่มี stats API)
  const storeCards = useMemo(() => {
    if (stats?.stores?.length) return stats.stores;
    // ไม่มี stats → สร้างจาก stores
    return (stores ?? []).map((s) => {
      const views = s.visitorCounter?.total ?? 0;
      const avg =
        s.reviews && s.reviews.length
          ? s.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / s.reviews.length
          : undefined;
      return { id: s.id, name: s.name, views, avgRating: avg };
    });
  }, [stats, stores]);

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-8 text-white">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">แผงควบคุม</h1>
        <p className="text-gray-400">จัดการข้อมูลบนเว็บไซต์ Sarisagroup</p>
      </header>

      {/* การ์ดสรุป 4 ใบ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👤" label="ผู้ใช้งาน" value={loading ? '—' : (stats?.totalUsers ?? 0)} />
        <StatCard icon="🗂️" label="หมวดหมู่" value={loading ? '—' : (stats?.totalCategories ?? 0)} />
        <StatCard icon="🏪" label="ร้านทั้งหมด" value={loading ? '—' : (stats?.totalStores ?? 0)} />
        <StatCard icon="👁️" label="ผู้เข้าชมทั้งหมด" value={loading ? '—' : (stats?.totalViews ?? 0)} />
      </section>

      {/* การ์ดร้านค้า */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ร้านค้า</h2>
          <Link
            href="/admin/stores/new"
            className="rounded-full bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600"
          >
            + สร้างร้านค้าใหม่
          </Link>
        </div>

        {!loading && (storeCards?.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">
            ยังไม่มีร้านค้า — เริ่มสร้างร้านค้าแรกเพื่อแสดงการ์ดร้านค้าในหน้านี้
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(storeCards ?? []).map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------- Helpers ---------- */
function deriveStatsFromStores(stores: StoreRow[]): AdminStats {
  const totalStores = stores.length;
  const totalCategories = new Set(stores.map((s) => s.category_id).filter(Boolean)).size;
  const totalViews = stores.reduce((sum, s) => sum + (s.visitorCounter?.total ?? 0), 0);
  const storesForCards = stores.map((s) => {
    const avg =
      s.reviews && s.reviews.length
        ? s.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / s.reviews.length
        : undefined;
    return { id: s.id, name: s.name, views: s.visitorCounter?.total ?? 0, avgRating: avg };
  });

  return {
    totalUsers: 0, // ไม่มี endpoint ผู้ใช้ → ตั้ง 0 ไว้ก่อน
    totalCategories,
    totalStores,
    totalViews,
    stores: storesForCards,
  };
}

/* ---------------- Components ---------------- */

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-4 shadow-sm">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-2xl">{icon}</div>
      <div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-gray-300">{label}</div>
      </div>
    </div>
  );
}

function StoreCard({
  store,
}: {
  store: { id: string; name: string; views: number; avgRating?: number };
}) {
  return (
    <Link
      href={`/admin/stores/${store.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:shadow-md transition flex flex-col gap-2"
    >
      <div className="text-base font-semibold truncate">{store.name}</div>
      <div className="text-sm text-gray-300 flex items-center justify-between">
        <span>ผู้เข้าชม</span>
        <span className="font-semibold">{store.views.toLocaleString('th-TH')}</span>
      </div>
      <div className="text-sm text-gray-300 flex items-center justify-between">
        <span>คะแนนเฉลี่ย</span>
        <span className="font-semibold">
          {typeof store.avgRating === 'number' ? `${store.avgRating.toFixed(1)} / 5` : '-'}
        </span>
      </div>
    </Link>
  );
}