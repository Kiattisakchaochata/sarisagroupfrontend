// src/app/admin/homepage/featured/page.tsx
'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';

type AdminImageRow = {
  image_id: string;
  image_url: string;
  menu_name?: string | null;
  price?: number | null;
  featured_order?: number | null;
};

type Group = {
  store_id: string;
  store_slug: string;
  store_name: string;
  store_order: number;
  items: AdminImageRow[];
};

export default function FeaturedAdminPage() {
  const { success, error } = useToast();

  // ✅ ชี้ไปที่ admin API เท่านั้น (apiFetch ของคุณจะเติม /api ให้อัตโนมัติ)
  const { data, mutate, isLoading } = useSWR<{ groups: Group[] }>(
    '/admin/stores/home/featured',
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false, dedupingInterval: 3000 },
  );

  const groups: Group[] =
    (data?.groups ?? [])
      .slice()
      .sort((a, b) => (a.store_order ?? 999999) - (b.store_order ?? 999999));

  const onUpdate = async (imageId: string, payload: any) => {
    try {
      await apiFetch(`/admin/stores/images/${imageId}`, {
        method: 'PATCH',
        body: payload,
      });
      success('อัปเดตแล้ว');
      await mutate();
    } catch {
      error('อัปเดตไม่สำเร็จ');
    }
  };

  const onUnfeature = (id: string) =>
    onUpdate(id, { is_featured_home: false, featured_order: null });

  const onBulkNormalize = async () => {
    try {
      for (const g of groups) {
        await Promise.all(
          g.items.map((it, idx) =>
            apiFetch(`/admin/stores/images/${it.image_id}`, {
              method: 'PATCH',
              body: { featured_order: idx + 1 },
            }),
          ),
        );
      }
      success('จัดลำดับ 1..N ต่อร้านเรียบร้อย');
      await mutate();
    } catch {
      error('จัดลำดับไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Featured Stores</h1>
          <p className="text-sm text-gray-400">รูปการ์ด/เมนูที่แสดงบนหน้าแรก</p>
        </div>
        <button
          onClick={onBulkNormalize}
          className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
        >
          จัดลำดับ 1..N (แยกร้าน)
        </button>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
          กำลังโหลด...
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">
          ยังไม่มีรูปที่ถูกทำเป็น Featured
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.store_id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{g.store_name}</div>
                  <Link
                    href={`/stores/${g.store_slug}`}
                    target="_blank"
                    className="text-sm text-gray-400 underline underline-offset-2"
                  >
                    {g.store_slug}
                  </Link>
                </div>
                <div className="text-sm text-gray-400">รวม {g.items.length} รูป</div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-left">
                    <tr>
                      <th className="px-3 py-2 w-20">รูป</th>
                      <th className="px-3 py-2">เมนู</th>
                      <th className="px-3 py-2 text-right">ราคา</th>
                      <th className="px-3 py-2 text-center w-28">ลำดับ</th>
                      <th className="px-3 py-2 text-right w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((r) => (
                      <tr key={r.image_id} className="odd:bg-white/[0.02]">
                        <td className="px-3 py-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.image_url}
                            alt=""
                            className="h-14 w-14 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            defaultValue={r.menu_name ?? ''}
                            className="w-full rounded bg-white/10 px-2 py-1"
                            onBlur={(e) => onUpdate(r.image_id, { menu_name: e.target.value })}
                            placeholder="ชื่อเมนู"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            defaultValue={r.price ?? ''}
                            className="w-24 rounded bg-white/10 px-2 py-1 text-right"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              onUpdate(r.image_id, { price: v === '' ? null : Number(v) });
                            }}
                            placeholder="ราคา"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            defaultValue={r.featured_order ?? ''}
                            className="w-20 rounded bg-white/10 px-2 py-1 text-center"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              onUpdate(r.image_id, {
                                featured_order: v === '' ? null : Number(v),
                              });
                            }}
                            placeholder="#"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => onUnfeature(r.image_id)}
                            className="rounded bg-red-600/80 hover:bg-red-700 px-2 py-1"
                            title="เอาออกจากหน้าแรก"
                          >
                            Unfeature
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}