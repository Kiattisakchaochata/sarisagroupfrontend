'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { apiFetch } from '@/lib/api';
// ถ้าอยากยังใช้ toast ควบคู่กันอยู่ก็ได้ แต่ไม่จำเป็นแล้ว
// import { useToast } from '@/components/ui/ToastProvider';

type StoreLite = {
  id: string;
  name: string;
  slug: string;
  avg_rating: number;
  review_count: number;
  is_active: boolean;
  category?: { name: string };
  visitorCounter?: { total: number };
  cover_image?: string | null;
};

export default function AdminStoresPage() {
  // const { success, error } = useToast();
  const [stores, setStores] = useState<StoreLite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ stores: StoreLite[] }>('/admin/stores', { method: 'GET' });
      setStores(res.stores || []);
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'โหลดรายการร้านค้าไม่สำเร็จ',
        text: 'โปรดลองใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string, name: string) => {
    // 1) ยืนยันการลบ
    const r = await Swal.fire({
      icon: 'warning',
      title: 'ลบร้านค้านี้?',
      text: name ? `คุณกำลังจะลบ “${name}”` : '',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#DC2626', // red-600
      focusCancel: true,
    });
    if (!r.isConfirmed) return;

    // 2) แสดงโหลด
    Swal.fire({
      title: 'กำลังลบ…',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await apiFetch(`/admin/stores/${id}`, { method: 'DELETE' });
      setStores((s) => s.filter((x) => x.id !== id));

      // ปิดโหลด -> success
      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'ลบแล้ว',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      // success('ลบแล้ว'); // ถ้าจะยิง toast ซ้ำด้วยก็ได้
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'ลบไม่สำเร็จ',
        text: 'โปรดลองอีกครั้งหรือตรวจสอบการเชื่อมต่อ',
        confirmButtonText: 'ปิด',
      });
      // error('ลบไม่สำเร็จ');
      console.error('delete store error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">ร้านค้า</h1>
        <Link
          href="/admin/stores/new"
          className="rounded-full bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600"
        >
          + สร้างร้านค้าใหม่
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
          กำลังโหลด...
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">
          ยังไม่มีร้านค้า
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((s) => {
            const publicHref = `/stores/${s.slug || s.id}`; // ✅ เพิ่มลิงก์หน้าร้าน (ไม่แตะ logic อื่น)
            return (
              <li key={s.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="aspect-[16/9] bg-black/10">
                  {s.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.cover_image} alt={s.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{s.name}</div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {s.is_active ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 truncate">{s.category?.name ?? '-'}</div>
                  <div className="text-sm text-gray-300">
                    ⭐ {s.avg_rating?.toFixed(1) ?? '0.0'} • {s.review_count ?? 0} รีวิว • 👁️{' '}
                    {s.visitorCounter?.total ?? 0}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {/* ✅ ปุ่มดูหน้าร้าน (public) — เปิดแท็บใหม่ */}
                    <a
                      href={`/stores/${s.id}/featured`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                      title="เปิดหน้าร้าน (แท็บใหม่)"
                    >
                      ดูหน้าร้าน
                    </a>
                    <Link
                      href={`/admin/stores/${s.id}`}
                      className="px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => onDelete(s.id, s.name)}
                      className="px-3 py-1.5 bg-red-600/80 rounded-lg text-sm hover:bg-red-700"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}