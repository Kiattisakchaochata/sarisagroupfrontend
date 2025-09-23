'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import StoreForm from '@/components/admin/store/StoreForm';

type Image = {
  id: string;
  image_url: string;
  order_number: number;
  alt_text?: string | null;
  menu_name?: string | null;
  price?: number | null;
  is_featured_home?: boolean;
  featured_order?: number | null;
  /** ✅ ใหม่: ให้/ไม่ให้รีวิว-ให้ดาวเมนูนี้ */
  allow_review?: boolean | null;
};

type StoreDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone?: string | null;
  is_active: boolean;
  category_id: string;
  meta_title?: string | null;
  meta_description?: string | null;
  cover_image?: string | null;
  images: Image[];
};

/** draft ต่อรูป เก็บทุกฟิลด์ที่แก้ไขได้ */
type ImageDraft = {
  menu_name: string;
  price: string;          // เก็บเป็น string เพื่อให้พิมพ์ลื่น แล้วค่อยแปลงตอนบันทึก
  is_featured_home: boolean;
  featured_order: string; // เก็บเป็น string เช่นกัน
  /** ✅ ใหม่ */
  allow_review: boolean;
};
type DraftMap = Record<string, ImageDraft>;

/** กรองสตริงให้เหลือเฉพาะตัวเลขและทศนิยม 1 จุด (กันราคาหายเพราะ NaN) */
const toNumberString = (s: string) =>
  s.replace(/[^\d.]/g, '').replace(/^(\d*\.\d*).*$/, '$1');

export default function EditStorePage() {
  const { id } = useParams<{ id: string }>();
  const { error } = useToast();

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // ----- DRAFT STATE -----
  const [draft, setDraft] = useState<DraftMap>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const initDraft = (images: Image[]) => {
    const d: DraftMap = {};
    images.forEach((im) => {
      d[im.id] = {
        menu_name: im.menu_name ?? '',
        price: im.price != null ? String(im.price) : '',
        is_featured_home: !!im.is_featured_home,
        featured_order: im.featured_order != null ? String(im.featured_order) : '',
        /** ✅ อ่านค่าจากแบ็กเอนด์ */
        allow_review: !!im.allow_review,
      };
    });
    setDraft(d);
    setDirtyIds(new Set());
  };

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiFetch<StoreDetail>(`/admin/stores/${id}`, { method: 'GET' });
      setStore(res);
      initDraft(res.images ?? []);
    } catch {
      error('โหลดข้อมูลร้านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ====== 🔒 Lock scroll ระหว่างเปิด SweetAlert2 (กันหน้าเด้ง) ======
  const scrollYRef = useRef(0);

  const lockScroll = () => {
    if (typeof window === 'undefined') return;
    scrollYRef.current = window.scrollY;
    document.documentElement.style.scrollBehavior = 'auto';
    const b = document.body;
    b.style.position = 'fixed';
    b.style.top = `-${scrollYRef.current}px`;
    b.style.left = '0';
    b.style.right = '0';
    b.style.width = '100%';
  };

  const unlockScroll = () => {
    if (typeof window === 'undefined') return;
    const b = document.body;
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.width = '';
    window.scrollTo(0, scrollYRef.current);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = '';
    });
  };

  // ตั้งค่า base ของ SweetAlert2
  const Modal = Swal.mixin({
    heightAuto: false,
    scrollbarPadding: false,
    returnFocus: false,
  });

  // ===== คงตำแหน่งสกรอลล์หลัง reload data =====
  const withScrollPreserve = async (fn: () => Promise<void>) => {
    if (typeof window === 'undefined') {
      await fn();
      return;
    }
    const x = window.scrollX;
    const y = window.scrollY;
    await fn();
    requestAnimationFrame(() => {
      window.scrollTo(x, y);
      setTimeout(() => window.scrollTo(x, y), 0);
    });
  };

  // ===== Upload images =====
  const onAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !id) return;
    setAdding(true);

    // เปิด loading โดยไม่ await เพื่อไม่ให้ค้าง flow
    Modal.fire({
      title: 'กำลังอัปโหลดรูป…',
      text: `เลือกไว้ ${files.length} ไฟล์`,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: lockScroll,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      await apiFetch(`/admin/stores/${id}/images`, { method: 'POST', body: fd });

      await withScrollPreserve(load);

      Swal.close();
      await Modal.fire({
        icon: 'success',
        title: 'อัปโหลดสำเร็จ',
        text: `เพิ่มรูปแล้ว ${files.length} ไฟล์`,
        timer: 1400,
        showConfirmButton: false,
        didClose: unlockScroll,
      });
    } catch {
      Swal.close();
      await Modal.fire({
        icon: 'error',
        title: 'อัปโหลดไม่สำเร็จ',
        text: 'โปรดลองใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
        didClose: unlockScroll,
      });
    } finally {
      setAdding(false);
    }
  };

  // ===== Delete image =====
  const onDeleteImage = async (imageId: string) => {
    const r = await Modal.fire({
      icon: 'warning',
      title: 'ลบรูปนี้?',
      text: 'คุณต้องการลบรูปภาพนี้ออกจากร้านค้าใช่หรือไม่',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#DC2626',
      focusCancel: true,
      willOpen: lockScroll,
    });
    if (!r.isConfirmed) {
      unlockScroll();
      return;
    }

    Modal.fire({
      title: 'กำลังลบ…',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await apiFetch(`/admin/stores/images/${imageId}`, { method: 'DELETE' });
      setStore((s) => (s ? { ...s, images: s.images.filter((i) => i.id !== imageId) } : s));

      setDraft((d) => {
        const nd = { ...d };
        delete nd[imageId];
        return nd;
      });
      setDirtyIds((ds) => {
        const n = new Set(ds);
        n.delete(imageId);
        return n;
      });

      Swal.close();
      await Modal.fire({
        icon: 'success',
        title: 'ลบแล้ว',
        timer: 1200,
        showConfirmButton: false,
        didClose: unlockScroll,
      });
    } catch {
      Swal.close();
      await Modal.fire({
        icon: 'error',
        title: 'ลบไม่สำเร็จ',
        text: 'โปรดลองใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
        didClose: unlockScroll,
      });
    }
  };

  // ====== แก้ไขค่าใน draft ======
  const setField = (idImg: string, patch: Partial<ImageDraft>) => {
    const normalized: Partial<ImageDraft> = { ...patch };
    // กรองราคาให้เหลือตัวเลข/ทศนิยม เพื่อกัน NaN
    if (typeof patch.price === 'string') {
      normalized.price = toNumberString(patch.price);
    }
    setDraft((d) => ({
      ...d,
      [idImg]: {
        ...(d[idImg] ?? { menu_name: '', price: '', is_featured_home: false, featured_order: '', allow_review: false }),
        ...normalized,
      },
    }));
    setDirtyIds((s) => new Set(s).add(idImg));
  };

  // ====== บันทึกการเปลี่ยนแปลงทั้งหมด (bulk) ======
  const saveAllChanges = async () => {
    if (!store) return;

    const items = store.images
      .map((im) => {
        if (!dirtyIds.has(im.id)) return null;
        const d = draft[im.id];
        if (!d) return null;

        const rawPrice = d.price.trim();
        const priceNum = rawPrice === '' ? null : Number(rawPrice);
        const orderNum = d.featured_order.trim() === '' ? null : Number(d.featured_order);

        const changed =
          (im.menu_name ?? '') !== d.menu_name ||
          (im.price ?? null) !== (isNaN(priceNum as any) ? null : priceNum) ||
          (!!im.is_featured_home) !== d.is_featured_home ||
          (im.featured_order ?? null) !== (isNaN(orderNum as any) ? null : orderNum) ||
          /** ✅ ตรวจ allow_review ด้วย */
          (!!im.allow_review) !== d.allow_review;

        if (!changed) return null;

        return {
          id: im.id,
          menu_name: d.menu_name,
          price: isNaN(priceNum as any) ? null : priceNum,
          is_featured_home: d.is_featured_home,
          featured_order: isNaN(orderNum as any) ? null : orderNum,
          /** ✅ ส่งไปที่ bulk */
          allow_review: d.allow_review,
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        menu_name: string;
        price: number | null;
        is_featured_home: boolean;
        featured_order: number | null;
        allow_review: boolean;
      }>;

    if (items.length === 0) {
      await Modal.fire({
        icon: 'info',
        title: 'ไม่มีรายการเปลี่ยนแปลง',
        timer: 1200,
        showConfirmButton: false,
        willOpen: lockScroll,
        didClose: unlockScroll,
      });
      return;
    }

    Modal.fire({
      title: 'กำลังบันทึกการเปลี่ยนแปลง…',
      html: `อัปเดต ${items.length} รายการ`,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: lockScroll,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ใช้ bulk ถ้ามี endpoint; ไม่มีก็ fallback ทีละรายการ
      let ok = true;
      try {
        await apiFetch(`/admin/stores/images/bulk`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          /** ✅ backend รองรับทั้ง images และ items; ส่ง items ตามของเดิม */
          body: JSON.stringify({ items }),
        });
      } catch {
        await Promise.all(
          items.map((it) =>
            apiFetch(`/admin/stores/images/${it.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                menu_name: it.menu_name,
                price: it.price,
                is_featured_home: it.is_featured_home,
                featured_order: it.featured_order,
                /** ✅ ส่ง allow_review ใน fallback */
                allow_review: it.allow_review,
              }),
            }).catch(() => (ok = false))
          )
        );
        if (!ok) throw new Error('some_failed');
      }

      await withScrollPreserve(load);
      setDirtyIds(new Set());

      Swal.close();
      await Modal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
        didClose: unlockScroll,
      });
    } catch {
      Swal.close();
      await Modal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'โปรดลองใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
        didClose: unlockScroll,
      });
    }
  };

  const dirtyCount = dirtyIds.size;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
        กำลังโหลด...
      </div>
    );
  }
  if (!store) return <div className="text-red-300">ไม่พบร้าน</div>;

  return (
    <div className="space-y-8">
      {/* ฟอร์มข้อมูลหลัก */}
      <StoreForm
        mode="edit"
        storeId={store.id}
        initial={{
          name: store.name,
          slug: store.slug,
          description: store.description,
          address: store.address,
          phone: store.phone ?? undefined,
          category_id: store.category_id,
          is_active: store.is_active,
          meta_title: store.meta_title ?? '',
          meta_description: store.meta_description ?? '',
          cover_image: store.cover_image ?? undefined,
        }}
      />

      {/* แถบบันทึก (ลอยด้านล่างเมื่อมีการแก้ไข) */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="rounded-full bg-emerald-600 text-white shadow-lg px-4 py-2 flex items-center gap-3">
            <span className="text-sm">มีการเปลี่ยนแปลง {dirtyCount} รายการ</span>
            <button
              onClick={saveAllChanges}
              className="rounded-full bg-white text-emerald-700 px-4 py-1.5 text-sm font-semibold hover:bg-white/90"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      )}

      {/* แกลเลอรีรูปภาพ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">รูปภาพในร้าน</h2>
          <label className="inline-flex bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm cursor-pointer">
            {adding ? 'กำลังอัปโหลด...' : '+ เพิ่มรูป (อัพโหลดได้ครั้งละ 5 รูป)'}
            <input type="file" accept="image/*" multiple onChange={(e) => onAddImages(e.target.files)} className="hidden" />
          </label>
        </div>

        {store.images.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">ยังไม่มีรูปในแกลเลอรี</div>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {store.images
              .slice()
              .sort((a, b) => a.order_number - b.order_number)
              .map((img) => {
                const d = draft[img.id] ?? { menu_name: '', price: '', is_featured_home: false, featured_order: '', allow_review: false };
                return (
                  <li key={img.id} className="rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.image_url} alt={img.alt_text ?? ''} className="w-full h-40 object-cover" />
                    <div className="p-2 space-y-2 text-sm">
                      <input
                        className="w-full rounded bg-white/10 px-2 py-1"
                        value={d.menu_name}
                        placeholder="ชื่อเมนู"
                        onChange={(e) => setField(img.id, { menu_name: e.target.value })}
                      />

                      {/* ราคา + หน่วย บาท */}
                      <div className="relative">
                        <input
                          className="w-full rounded bg-white/10 px-2 py-1 pr-12"
                          value={d.price}
                          inputMode="decimal"
                          placeholder="ราคา"
                          onChange={(e) => setField(img.id, { price: e.target.value })}
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-300">
                          บาท
                        </span>
                      </div>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!d.is_featured_home}
                          onChange={(e) => setField(img.id, { is_featured_home: e.target.checked })}
                        />
                        Featured บนหน้าแรก
                      </label>

                      <input
                        className="w-full rounded bg-white/10 px-2 py-1"
                        value={d.featured_order}
                        placeholder="ลำดับหน้าแรก"
                        onChange={(e) => setField(img.id, { featured_order: e.target.value })}
                      />

                      {/* ✅ Checkbox อนุญาตรีวิว/ให้ดาว */}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!d.allow_review}
                          onChange={(e) => setField(img.id, { allow_review: e.target.checked })}
                        />
                        อนุญาตให้รีวิว/ให้ดาว เมนูนี้
                      </label>

                      <button
                        onClick={() => onDeleteImage(img.id)}
                        className="w-full bg-red-600/80 hover:bg-red-700 rounded px-2 py-1"
                      >
                        ลบ
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}