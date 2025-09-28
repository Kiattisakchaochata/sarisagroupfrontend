'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Initial = {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  category_id?: string;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  cover_image?: string;                // URL รูปเดิม (ถ้ามี)
  image_fit?: 'cover' | 'contain';     // ค่าที่บันทึกไว้ใน DB
};

type Props = {
  mode?: 'create' | 'edit';
  storeId?: string;   // ต้องมีเมื่อ mode === 'edit'
  initial?: Initial;  // ค่าจาก backend ที่โหลดมา
};

export default function StoreForm({ mode = 'create', storeId, initial }: Props) {
  const [form, setForm] = useState<Initial>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    category_id: initial?.category_id ?? '',
    is_active: initial?.is_active ?? true,
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    cover_image: initial?.cover_image,
    image_fit: initial?.image_fit ?? 'contain',
  });

  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // โหมดแสดงพรีวิว cover: contain/cover
  const [coverContain, setCoverContain] = useState<boolean>(
    (initial?.image_fit ?? 'contain') !== 'cover'
  );

  // ซิงก์ค่าเมื่อ initial เปลี่ยน
  useEffect(() => {
    if (!initial) return;
    setForm({
      name: initial.name ?? '',
      slug: initial.slug ?? '',
      description: initial.description ?? '',
      address: initial.address ?? '',
      phone: initial.phone ?? '',
      category_id: initial.category_id ?? '',
      is_active: initial.is_active ?? true,
      meta_title: initial.meta_title ?? '',
      meta_description: initial.meta_description ?? '',
      cover_image: initial.cover_image,
      image_fit: initial.image_fit ?? 'contain',
    });
    setCover(null);
    setCoverContain((initial.image_fit ?? 'contain') !== 'cover');
  }, [initial]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const cleanSlug = (raw: string) =>
    (raw || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const fd = new FormData();
      const payload: Initial = {
        ...form,
        slug: cleanSlug(form.slug || form.name),
        image_fit: coverContain ? 'contain' : 'cover',
      };

      Object.entries(payload).forEach(([k, v]) => {
        fd.append(k, typeof v === 'boolean' ? String(v) : (v ?? ''));
      });
      if (cover) fd.append('cover', cover);

      // ✅ บังคับเซ็ต image_fit ทุกครั้ง
      fd.set('image_fit', coverContain ? 'contain' : 'cover');

      if (mode === 'edit') {
    if (!storeId) throw new Error('missing storeId for edit mode');
    await apiFetch(`/admin/stores/${storeId}`, { method: 'PATCH', body: fd });
  } else {
    await apiFetch('/admin/stores', { method: 'POST', body: fd });
  }

  // ✅ ใช้ SweetAlert แบบ success
  await Swal.fire({
    icon: 'success',
    title: 'บันทึกสำเร็จ',
    timer: 1300,
    timerProgressBar: true,
    showConfirmButton: false,
  });

} catch (err: any) {
  // ❌ ใช้ SweetAlert แบบ error
  await Swal.fire({
    icon: 'error',
    title: 'บันทึกไม่สำเร็จ',
    text: err?.message || 'โปรดลองใหม่อีกครั้ง',
    confirmButtonText: 'ตกลง',
  });
} finally {
  setLoading(false);
}
  };

  // ✅ พรีวิวรูป
  const coverPreview = useMemo(() => {
    if (cover) return URL.createObjectURL(cover);
    if (form.cover_image) return form.cover_image;
    return '';
  }, [cover, form.cover_image]);

  const box =
    'w-full rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-amber-400/40';
  const boxArea =
    'w-full min-h-[120px] rounded-lg border border-white/20 bg-white/[0.06] px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-amber-400/40';

  return (
    <form onSubmit={onSubmit} className="max-w-5xl space-y-8">
      <header>
        <h2 className="text-2xl font-semibold">
          {mode === 'edit' ? 'แก้ไขร้านค้า' : 'สร้างร้านค้าใหม่'}
        </h2>
      </header>

      {/* ชื่อ + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-1 block text-sm text-slate-200">ชื่อร้าน</label>
          <input
            className={box}
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="เช่น ครัวคุณจี๊ด"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-200">Slug (URL)</label>
          <input
            className={box}
            name="slug"
            value={form.slug}
            onChange={onChange}
            placeholder="เช่น khaomun-kai-jedang"
            required
          />
        </div>
      </div>

      {/* คำอธิบาย */}
      <div>
        <label className="mb-1 block text-sm text-slate-200">คำอธิบาย</label>
        <textarea
          className={boxArea}
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="ข้อความอธิบายร้านโดยย่อ"
        />
      </div>

      {/* ที่อยู่ + โทรศัพท์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-1 block text-sm text-slate-200">ที่อยู่</label>
          <input
            className={box}
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="ที่อยู่ของร้าน"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-200">โทรศัพท์</label>
          <input
            className={box}
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="เช่น 08x-xxx-xxxx"
          />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-1 block text-sm text-slate-200">Meta Title</label>
          <input
            className={box}
            name="meta_title"
            value={form.meta_title}
            onChange={onChange}
            placeholder="SEO Title"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-200">Meta Description</label>
          <input
            className={box}
            name="meta_description"
            value={form.meta_description}
            onChange={onChange}
            placeholder="SEO Description"
          />
        </div>
      </div>

      {/* รูปปก + พรีวิว */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label className="mb-2 block text-sm text-slate-200">รูปปก (Cover)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className="block text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/20"
          />
          <p className="mt-2 text-xs text-slate-400">
            {cover ? 'แสดงพรีวิวรูปใหม่ด้านขวา' : 'ถ้าไม่อัปโหลด จะคงรูปเดิมไว้'}
          </p>
        </div>

        {coverPreview ? (
          <div>
            <div className="mb-2 text-sm text-slate-200">พรีวิว</div>
            <div className="rounded-xl overflow-hidden bg-white border border-white/10">
              <div className="relative w-full max-w-xs aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className={`absolute inset-0 h-full w-full ${coverContain ? 'object-contain' : 'object-cover'}`}
                />
              </div>
            </div>

            {/* สวิตช์สลับ contain/cover */}
            <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={coverContain}
                onChange={(e) => setCoverContain(e.target.checked)}
              />
              แสดงแบบ <code>object-contain</code>
            </label>
          </div>
        ) : null}
      </div>

      {/* สถานะ */}
      <label className="flex items-center gap-2 text-slate-200">
        <input
          type="checkbox"
          checked={!!form.is_active}
          onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
          className="h-4 w-4 accent-amber-400"
        />
        Active
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-60"
      >
        {loading ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'สร้างร้านค้า'}
      </button>
    </form>
  );
}