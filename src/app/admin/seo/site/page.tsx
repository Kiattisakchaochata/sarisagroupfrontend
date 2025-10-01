'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Swal } from '@/lib/swal';
import OgPicker4 from '@/components/admin/OgPicker4';

const META_TITLE_MAX = 255;
const META_DESC_MAX  = 512;
const KEYWORDS_MAX   = 512; // ให้ตรงกับฝั่ง BE
const OG_IMAGE_MAX   = 512;

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
  const [ogList, setOgList] = useState<string[]>(['', '', '', '']);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<SiteSeo>('/admin/seo/site');
        // ✅ ดึงค่า keywords จาก jsonld ด้วย
        setForm({
          ...data,
          keywords: data?.keywords || (data as any)?.jsonld?.keywords || '',
        });

        const imgs = [
          data?.og_image,
          ...(Array.isArray((data as any)?.jsonld?.image) ? (data as any).jsonld.image : []),
        ].filter(Boolean) as string[];
        const four = Array.from(new Set(imgs)).slice(0, 4);
        setOgList([...four, '', '', '', ''].slice(0, 4));
      } catch {
        setOgList(['', '', '', '']);
      }
    })();
  }, []);

  async function onSave() {
    setLoading(true);
    try {
      const primary = ogList.find(Boolean) || form.og_image || '';
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

      // ---------- Validate หลายช่องก่อนยิง API ----------
      const errs: string[] = [];

      // 1) Meta Title
      const titleLen = (form.meta_title || '').length;
      if (titleLen > META_TITLE_MAX) {
        errs.push(`Meta Title: ยาว ${titleLen} ตัวอักษร (เกินกำหนด ${META_TITLE_MAX})`);
      }

      // 2) Meta Description
      const descLen = (form.meta_description || '').length;
      if (descLen > META_DESC_MAX) {
        errs.push(`Meta Description: ยาว ${descLen} ตัวอักษร (เกินกำหนด ${META_DESC_MAX})`);
      }

      // 3) Keywords (normalize ก่อนวัดความยาว)
      const normalized = normalizeKeywords(form.keywords);
      const kwLen = (normalized || '').length;
      if (kwLen > KEYWORDS_MAX) {
        errs.push(`Keywords: ยาว ${kwLen} ตัวอักษร (เกินกำหนด ${KEYWORDS_MAX})`);
      }

      // 4) OG Image (URL หลักช่องที่ 1 ที่จะส่งขึ้นฟิลด์ og_image)
      const primaryLen = (primary || '').length;
      if (primaryLen > OG_IMAGE_MAX) {
        errs.push(`OG Image URL: ยาว ${primaryLen} ตัวอักษร (เกินกำหนด ${OG_IMAGE_MAX})`);
      }

      if (errs.length > 0) {
        await Swal.fire({
          icon: 'error',
          title: 'บันทึกไม่สำเร็จ',
          html: `
            <div style="text-align:left">
              <div>มีฟิลด์ที่เกินเงื่อนไข:</div>
              <ul style="margin-top:6px;padding-left:18px;">
                ${errs.map(e => `<li>${e}</li>`).join('')}
              </ul>
              <div style="margin-top:8px;opacity:.85">
                โปรดแก้ไขตามรายการข้างต้นแล้วบันทึกอีกครั้ง
              </div>
            </div>
          `,
        });
        return; // ⛔️ ไม่ยิง API ถ้ายังไม่ผ่าน validation
      }

      const safeKeywords = normalized; // ผ่านแล้ว ไม่ต้อง clamp เพิ่ม

      // ---------- Build JSON-LD ----------
      const mergedJson = (typeof form.jsonld === 'object' && form.jsonld) ? { ...form.jsonld } : {};
      mergedJson['@context'] = 'https://schema.org';
      mergedJson['@type'] = mergedJson['@type'] || 'WebSite';
      mergedJson.name = form.meta_title || 'Sarisagroup';
      mergedJson.description = form.meta_description || '';
      mergedJson.url = siteUrl;
      mergedJson.image = ogList.filter(Boolean);
      if (safeKeywords) mergedJson.keywords = safeKeywords; // ✅ sync ลง JSON-LD

      // ---------- Call API ----------
      await apiFetch('/admin/seo/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: form.meta_title ?? '',
          meta_description: form.meta_description ?? '',
          keywords: safeKeywords,
          og_image: primary,
          jsonld: mergedJson,
        }),
      });

      setForm((s) => ({ ...s, og_image: primary, jsonld: mergedJson, keywords: safeKeywords }));
      await Swal.fire({ icon: 'success', title: 'บันทึก Global SEO สำเร็จ', confirmButtonText: 'ตกลง' });
    } catch (e: any) {
      // ✅ อธิบายเหตุผลให้ชัดเจน (fallback จาก BE)
      const status = e?.status ?? e?.code ?? '';
      const raw = (e?.message || e?.error || '').toString();

      let hint = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      if (
        raw.includes('KEYWORDS_TOO_LONG') ||
        raw.toLowerCase().includes('too long') ||
        raw.includes(String(KEYWORDS_MAX))
      ) {
        hint = `บันทึกไม่สำเร็จ: คำหลัก (Keywords) ยาวเกินกำหนด — ใส่ได้สูงสุด ${KEYWORDS_MAX} ตัวอักษร (รวมเครื่องหมายจุลภาคและช่องว่าง)`;
      } else if (status === 401 || raw.toLowerCase().includes('unauthorized')) {
        hint = 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่';
      } else if (status === 413 || raw.toLowerCase().includes('payload too large')) {
        hint = 'ข้อมูลที่ส่งมีขนาดใหญ่เกินไป';
      }

      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: hint,
      });
    } finally {
      // ✅ สำคัญ: ปิดสถานะโหลดไม่ให้ปุ่มค้าง/ต้องรีเฟรช
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

      <OgPicker4 label="OG Images (สูงสุด 4) • ช่องที่ 1 คือรูปหลัก" value={ogList} onChange={setOgList} />

      <Field label="JSON-LD (object)">
        <textarea
          rows={10}
          className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none font-mono text-sm"
          value={toShow(form.jsonld)}
          onChange={(e) =>
            setForm((s) => ({ ...s, jsonld: parseOrRaw(e.target.value) }))
          }
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm">{label}</label>
      {children}
    </div>
  );
}

function parseOrRaw(s: string) { try { return JSON.parse(s); } catch { return s; } }
function toShow(v: any) { return typeof v === 'string' ? v : (v ? JSON.stringify(v, null, 2) : ''); }

/* คง normalizeKeywords ฝั่ง FE ไว้เพื่อ reuse */
function normalizeKeywords(v?: string) {
  if (!v) return '';
  const arr = String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return arr.join(', ');
}