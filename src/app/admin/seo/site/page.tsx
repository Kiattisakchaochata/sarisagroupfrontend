// src/app/admin/seo/site/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Swal } from '@/lib/swal';
import OgPicker4 from '@/components/admin/OgPicker4';

type SiteSeo = {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: string; // รูปหลัก = ช่องที่ 1
  jsonld?: any;      // จะฝัง image[] ทั้งหมด
};

function AdminSeoSitePageInner() {
  const [form, setForm] = useState<SiteSeo>({});
  const [loading, setLoading] = useState(false);
  // เก็บรูป 4 ช่อง ให้เป็น controlled เสมอ
  const [ogList, setOgList] = useState<string[]>(['', '', '', '']);

  // โหลดค่าปัจจุบัน
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<SiteSeo>('/admin/seo/site');
        setForm(data || {});
        const imgs = [
          data?.og_image,
          ...(Array.isArray(data?.jsonld?.image) ? data!.jsonld.image : []),
        ].filter(Boolean) as string[];
        const four = Array.from(new Set(imgs)).slice(0, 4);
        setOgList([...four, '', '', '', ''].slice(0, 4));
      } catch {
        setOgList(['', '', '', '']);
      }
    })();
  }, []);

  // บันทึก
  async function onSave() {
    setLoading(true);
    try {
      const primary = ogList.find(Boolean) || form.og_image || '';
      const mergedJson =
        typeof form.jsonld === 'object' && form.jsonld ? { ...form.jsonld } : {};
      mergedJson.image = ogList.filter(Boolean);

      await apiFetch('/admin/seo/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: form.meta_title ?? '',
          meta_description: form.meta_description ?? '',
          keywords: form.keywords ?? '',
          og_image: primary,
          jsonld: mergedJson,
        }),
      });

      setForm((s) => ({ ...s, og_image: primary, jsonld: mergedJson }));
      Swal.fire({ icon: 'success', title: 'บันทึก Global SEO สำเร็จ', confirmButtonText: 'ตกลง' });
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: e?.message || 'ลองใหม่อีกครั้ง' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 md:px-6 py-10 text-white space-y-6">
      <h1 className="text-2xl font-semibold">Global SEO</h1>

      <Field label="Meta Title">
        <input
          className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
          value={form.meta_title ?? ''}
          onChange={(e) => setForm((s) => ({ ...s, meta_title: e.target.value }))}
        />
      </Field>

      <Field label="Meta Description">
        <textarea
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
          value={form.meta_description ?? ''}
          onChange={(e) => setForm((s) => ({ ...s, meta_description: e.target.value }))}
        />
      </Field>

      <Field label="Keywords (comma-separated)">
        <input
          className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
          value={form.keywords ?? ''}
          onChange={(e) => setForm((s) => ({ ...s, keywords: e.target.value }))}
        />
      </Field>

      {/* ✅ ช่องอัปโหลดสี่ช่อง (ช่องที่ 1 = รูปหลัก) */}
      <OgPicker4 label="OG Images (สูงสุด 4) • ช่องที่ 1 คือรูปหลัก" value={ogList} onChange={setOgList} />

      <Field label="JSON-LD (object)">
        <textarea
          rows={10}
          className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none font-mono text-sm"
          value={toShow(form.jsonld)}
          onChange={(e) =>
            setForm((s) => ({ ...s, jsonld: parseOrRaw(e.target.value) }))
          }
          placeholder={`ตัวอย่าง: {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sarisagroup",
  "url": "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}"
}`}
        />
      </Field>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onSave}
          disabled={loading}
          className="rounded-full bg-amber-500 text-white px-6 py-2.5 font-semibold disabled:opacity-60"
        >
          {loading ? 'กำลังบันทึก…' : 'บันทึก'}
        </button>
      </div>
    </main>
  );
}

export default function AdminSeoSitePage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-4xl px-4 md:px-6 py-10 text-white">กำลังโหลด...</div>}>
      <AdminSeoSitePageInner />
    </Suspense>
  );
}

/* ---------- UI helper ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm">{label}</label>
      {children}
    </div>
  );
}

/* ---------- utils ---------- */
function parseOrRaw(s: string) { try { return JSON.parse(s); } catch { return s; } }
function toShow(v: any) { return typeof v === 'string' ? v : (v ? JSON.stringify(v, null, 2) : ''); }