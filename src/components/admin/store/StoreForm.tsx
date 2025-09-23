'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

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
  cover_image?: string; // URL ของรูปเดิม (ถ้ามี)
};

type Props = {
  mode?: 'create' | 'edit';
  storeId?: string;   // ต้องมีเมื่อ mode === 'edit'
  initial?: Initial;  // ค่าจาก backend ที่โหลดมา
};

export default function StoreForm({ mode = 'create', storeId, initial }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<Initial>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    category_id: initial?.category_id ?? '', // ไม่บังคับส่งก็ได้ ฝั่ง BE มี fallback ให้แล้ว
    is_active: initial?.is_active ?? true,
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    cover_image: initial?.cover_image, // เก็บไว้เพื่อแสดงพรีวิวรูปเดิม
  });
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ ซิงก์ค่าเมื่อ initial เปลี่ยน (ตอนหน้าแก้ไขโหลดเสร็จ)
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
    });
    setCover(null); // รีเซ็ตไฟล์ใหม่ ถ้าเปิดหน้าแก้ไขหลายครั้ง
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
      const payload = {
        ...form,
        slug: cleanSlug(form.slug || form.name),
      };

      Object.entries(payload).forEach(([k, v]) => {
        // boolean → string ให้ชัดเจน
        fd.append(k, typeof v === 'boolean' ? String(v) : (v ?? ''));
      });
      if (cover) fd.append('cover', cover);

      if (mode === 'edit') {
        if (!storeId) throw new Error('missing storeId for edit mode');
        await apiFetch(`/admin/stores/${storeId}`, { method: 'PATCH', body: fd });
      } else {
        await apiFetch('/admin/stores', { method: 'POST', body: fd });
      }

      // กลับ Dashboard และ refresh
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(`❌ บันทึกไม่สำเร็จ: ${err?.message || 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ พรีวิวรูป: ถ้าเลือกไฟล์ใหม่ใช้ไฟล์นั้น, ไม่งั้นใช้ cover_image เดิม
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt="cover preview"
              className="w-full max-w-xs rounded-xl border border-white/10"
            />
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