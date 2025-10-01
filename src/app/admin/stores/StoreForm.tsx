// src/app/admin/stores/StoreForm.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Category = { id: string; name: string; slug: string };

export type StoreFormValue = {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone?: string;
  category_id: string;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
};

/* ====== เพิ่มคอนสแตนต์ขีดจำกัดตาม Prisma schema ======
   name: VarChar(120)
   slug: VarChar(160)
   phone: VarChar(50)
   meta_title: VarChar(255)
   (description/address/meta_description เป็น Text ไม่กำหนดความยาว) */
const NAME_MAX = 120;
const SLUG_MAX = 160;
const PHONE_MAX = 50;
const META_TITLE_MAX = 255;

/* helper: ตัดช่องว่าง/HTML entities ออกจากข้อความ error Prisma แล้วย่อยสาเหตุ */
function prettifyPrismaTooLongMessage(raw: string): string | null {
  if (!raw) return null;
  const s = raw
    .replace(/&nbsp;?/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // จับ pattern ว่า value ยาวเกิน + ระบุ column
  if (/too long for the column/i.test(s)) {
    // พยายามดึงชื่อคอลัมน์ออกมา
    const m = s.match(/column:\s*([a-zA-Z_]+)/i);
    const col = (m?.[1] || '').toLowerCase();

    // map ชื่อคอลัมน์ → label และ max ที่เรารู้
    const map: Record<string, { label: string; max?: number }> = {
      name: { label: 'ชื่อร้าน', max: NAME_MAX },
      slug: { label: 'Slug (URL)', max: SLUG_MAX },
      phone: { label: 'โทรศัพท์', max: PHONE_MAX },
      meta_title: { label: 'Meta Title', max: META_TITLE_MAX },
    };
    const info = map[col];

    if (info) {
      const limitText = info.max ? ` (สูงสุด ${info.max} ตัวอักษร)` : '';
      return `ค่าที่กรอกในฟิลด์ “${info.label}” ยาวเกินกำหนด${limitText}`;
    }
    // ถ้าไม่รู้ field ก็ให้ข้อความกลาง ๆ
    return 'ค่าที่กรอกยาวเกินชนิดข้อมูลที่กำหนดในระบบ (โปรดลดความยาวของข้อความ)';
  }
  return null;
}

export default function StoreForm({
  mode,
  storeId,
  initial,
}: {
  mode: 'create' | 'edit';
  storeId?: string;
  initial?: Partial<StoreFormValue> & { cover_image?: string | null };
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<File | null>(null);

  const [form, setForm] = useState<StoreFormValue>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    category_id: initial?.category_id ?? '',
    is_active: initial?.is_active ?? true,
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
  });

  const [slugErr, setSlugErr] = useState<string>('');
  const slugRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ categories: Category[] }>(
          '/admin/categories',
          { method: 'GET' }
        );
        setCategories(res.categories ?? []);
      } catch {/* ignore */}
    })();
  }, []);

  const canSubmit = useMemo(
    () => form.name && form.slug && form.address && form.category_id,
    [form]
  );

  function isSlugDuplicateError(err: unknown): boolean {
    const msg =
      (err as any)?.message?.toString?.() ??
      (typeof err === 'string' ? err : '');
    return /unique constraint|already exists|duplicate/i.test(msg) &&
      /(stores_slug_key|slug)/i.test(msg);
  }

  /* ===================== Inline Popup (ไม่พึ่ง lib อื่น) ===================== */
  // ใส่ CSS ครั้งเดียว
  const ensurePopupCss = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('inline-popup-css')) return;
    const s = document.createElement('style');
    s.id = 'inline-popup-css';
    s.textContent = `
      #inline-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:2147483647}
      #inline-popup{background:#fff;border-radius:16px;min-width:300px;max-width:92vw;padding:22px 20px;box-shadow:0 10px 30px rgba(0,0,0,.25);text-align:center}
      #inline-popup h3{font-size:18px;margin:10px 0 4px 0;color:#111;font-weight:700}
      #inline-popup p{font-size:14px;margin:4px 0 0 0;color:#444}
      #inline-popup .btn{margin-top:16px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:8px 16px;font-weight:600;cursor:pointer}
      #inline-popup .row{display:flex;align-items:center;justify-content:center;gap:8px}
      #inline-popup .spinner{width:18px;height:18px;border:3px solid #e5e7eb;border-top-color:#0ea5e9;border-radius:999px;animation:spin .9s linear infinite}
      #inline-popup .icon{font-size:26px}
      @keyframes spin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(s);
  };

  const closePopup = () => {
    const el = document.getElementById('inline-popup-overlay');
    if (el) el.remove();
  };

  const openLoadingPopup = (title = 'กำลังบันทึก...', text = 'กรุณารอสักครู่') => {
    ensurePopupCss();
    closePopup();
    const wrap = document.createElement('div');
    wrap.id = 'inline-popup-overlay';
    wrap.innerHTML = `
      <div id="inline-popup">
        <div class="row"><div class="spinner"></div><h3 style="margin:0">${title}</h3></div>
        <p>${text}</p>
      </div>
    `;
    document.body.appendChild(wrap);
  };

  const openResultPopup = (ok: boolean, title: string, text?: string) => {
    ensurePopupCss();
    closePopup();
    const wrap = document.createElement('div');
    wrap.id = 'inline-popup-overlay';
    wrap.innerHTML = `
      <div id="inline-popup">
        <div class="icon">${ok ? '✅' : '❌'}</div>
        <h3>${title}</h3>
        ${text ? `<p>${text}</p>` : ''}
        <button id="inline-popup-ok" class="btn">ตกลง</button>
      </div>
    `;
    document.body.appendChild(wrap);
    document.getElementById('inline-popup-ok')?.addEventListener('click', closePopup);
  };
  /* ===================================================================== */

  // ให้ browser เพนต์ popup ให้เสร็จก่อนเริ่มงานหนัก
  const waitForPaint = () =>
    new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  // ตรวจความยาวฝั่ง FE ก่อนส่ง (กันเคสยาวเกินจน Prisma ตีกลับ)
  function validateLengths(): string[] {
    const errs: string[] = [];
    const nameLen = (form.name || '').length;
    const slugLen = (form.slug || '').length;
    const phoneLen = (form.phone || '').length;
    const titleLen = (form.meta_title || '').length;

    if (nameLen > NAME_MAX) errs.push(`ชื่อร้าน: ยาว ${nameLen} ตัวอักษร (เกิน ${NAME_MAX})`);
    if (slugLen > SLUG_MAX) errs.push(`Slug (URL): ยาว ${slugLen} ตัวอักษร (เกิน ${SLUG_MAX})`);
    if (phoneLen > PHONE_MAX) errs.push(`โทรศัพท์: ยาว ${phoneLen} ตัวอักษร (เกิน ${PHONE_MAX})`);
    if (titleLen > META_TITLE_MAX) errs.push(`Meta Title: ยาว ${titleLen} ตัวอักษร (เกิน ${META_TITLE_MAX})`);

    return errs;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !canSubmit) return;
    setLoading(true);
    setSlugErr('');

    // ถ้ามีฟิลด์ใดยาวเกิน → แจ้งทันทีพร้อมปุ่ม OK
    const lengthErrs = validateLengths();
    if (lengthErrs.length > 0) {
      openResultPopup(
        false,
        'บันทึกไม่สำเร็จ',
        `มีฟิลด์ที่เกินเงื่อนไข:\n• ${lengthErrs.join('\n• ')}`
      );
      setLoading(false);
      return;
    }

    // เด้งโหลดดิ้งทันที
    openLoadingPopup();
    await waitForPaint();

    try {
      let savedId = storeId;

      if (mode === 'create') {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
        if (cover) fd.append('cover', cover);
        const res = await apiFetch<{ id: string }>(
          '/admin/stores',
          { method: 'POST', body: fd }
        );
        savedId = res.id;
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
        await apiFetch(`/admin/stores/${storeId}`, { method: 'PATCH', body: fd });
        if (cover) {
          const fdc = new FormData();
          fdc.append('cover', cover);
          await apiFetch(`/admin/stores/cover/${storeId}`, { method: 'PATCH', body: fdc });
        }
      }

      // แสดงผลสำเร็จ พร้อมปุ่มตกลง
      openResultPopup(true, 'บันทึกสำเร็จ');
      // ไปหน้า detail หลังผู้ใช้กดตกลง
      const okBtn = () => {
        document.getElementById('inline-popup-ok')?.removeEventListener('click', okBtn);
        router.replace(`/admin/stores/${savedId}`);
        router.refresh();
      };
      document.getElementById('inline-popup-ok')?.addEventListener('click', okBtn);
    } catch (e: any) {
      // ข้อความพื้นฐานจาก error
      let msg = e?.message?.toString?.() || 'บันทึกไม่สำเร็จ';

      // ระบุว่า slug ซ้ำ
      if (isSlugDuplicateError(e)) {
        msg = 'Slug นี้ถูกใช้งานแล้ว โปรดเปลี่ยนเป็นค่าอื่น';
        setSlugErr(msg);
        slugRef.current?.focus();
      }

      // ถ้าเป็น Prisma too-long ให้แปลเป็นข้อความอ่านง่าย
      const prismaNice = prettifyPrismaTooLongMessage(msg);
      if (prismaNice) msg = prismaNice;

      // network/timeout/500 กรณีทั่วไป
      const low = msg.toLowerCase();
      if (!prismaNice) {
        if (low.includes('network')) msg = 'การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
        else if (low.includes('timeout')) msg = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        else if (low.includes('500')) msg = 'เซิร์ฟเวอร์เกิดข้อผิดพลาดภายใน (500) กรุณาลองใหม่ภายหลัง';
      }

      // แสดงผลไม่สำเร็จ พร้อมปุ่มตกลง
      openResultPopup(false, 'บันทึกไม่สำเร็จ', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">ชื่อร้าน</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            required
          />
          {form.name.length > NAME_MAX && (
            <p className="mt-1 text-xs text-red-400">ยาวเกิน {NAME_MAX} ตัวอักษร</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Slug (URL)</label>
          <input
            ref={slugRef}
            value={form.slug}
            onChange={e =>
              setForm(f => ({ ...f, slug: e.target.value.trim().toLowerCase() }))
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            required
            aria-invalid={!!slugErr}
          />
          {slugErr ? (
            <p className="mt-1 text-xs text-red-400">{slugErr}</p>
          ) : form.slug.length > SLUG_MAX ? (
            <p className="mt-1 text-xs text-red-400">ยาวเกิน {SLUG_MAX} ตัวอักษร</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">คำอธิบาย</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
          rows={3}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">ที่อยู่</label>
          <input
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">โทรศัพท์</label>
          <input
            value={form.phone ?? ''}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
          />
          {(form.phone ?? '').length > PHONE_MAX && (
            <p className="mt-1 text-xs text-red-400">ยาวเกิน {PHONE_MAX} ตัวอักษร</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">หมวดหมู่</label>
          <select
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            required
          >
            <option value="">— เลือกหมวดหมู่ —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">สถานะ</label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
          />
          <span className="text-sm">{form.is_active ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Meta Title</label>
          <input
            value={form.meta_title ?? ''}
            onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
          />
          {(form.meta_title ?? '').length > META_TITLE_MAX && (
            <p className="mt-1 text-xs text-red-400">ยาวเกิน {META_TITLE_MAX} ตัวอักษร</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Meta Description</label>
          <input
            value={form.meta_description ?? ''}
            onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">รูปปก (Cover)</label>
        <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] ?? null)} />
        {initial?.cover_image && (
          <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-white w/full max-w-xs">
            <div className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initial.cover_image}
                alt="cover"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="rounded-full bg-amber-500 text-white px-5 py-2.5 font-semibold disabled:opacity-60"
        >
          {loading ? 'กำลังบันทึก...' : (mode === 'create' ? 'สร้างร้านค้า' : 'บันทึกการเปลี่ยนแปลง')}
        </button>
      </div>
    </form>
  );
}