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

// 🔹 เพิ่ม: รายการชนิดที่รองรับให้เลือกได้ (เหมือนหน้า Page SEO)
type SchemaType = string;
const KNOWN_TYPES = ['Restaurant','LocalBusiness','CafeOrCoffeeShop','HairSalon','CarWash','custom'] as const;

type SiteSeo = {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: string; // รูปหลัก = ช่องที่ 1
  jsonld?: any;      // จะฝัง image[] ทั้งหมด
};

// 🔹 เพิ่ม: helper เหมือนหน้า Page SEO
function normalizeUrl(u?: string) {
  if (!u) return '';
  return String(u).trim();
}
function buildLocalBusinessJsonLd(input: {
  type: SchemaType;
  name: string;
  url: string;
  telephone?: string;
  addressLine?: string;
  locality?: string;
  postalCode?: string;
  country?: string;
  servesCuisine?: string; // comma-separated
  priceRange?: string;
  images?: string[];
  sameAs?: string; // comma-separated
  description?: string;
}) {
  const cuisines = (input.servesCuisine || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const sameAs = (input.sameAs || '')
    .split(',')
    .map(s => normalizeUrl(s))
    .filter(Boolean);

  const addr: any =
    input.addressLine || input.locality || input.postalCode || input.country
      ? {
          '@type': 'PostalAddress',
          streetAddress: input.addressLine || undefined,
          addressLocality: input.locality || undefined,
          postalCode: input.postalCode || undefined,
          addressCountry: input.country || 'TH',
        }
      : undefined;

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': input.type,
    name: input.name,
    url: normalizeUrl(input.url),
    description: input.description || undefined,
    image: (input.images || []).filter(Boolean),
    telephone: input.telephone || undefined,
    address: addr,
    priceRange: input.priceRange || undefined,
    servesCuisine: cuisines.length ? cuisines : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  return data;
}
function extractBuilderFromJsonLd(j: any) {
  if (!j || typeof j !== 'object') return null;
  const addr = j.address || {};
  const serves = Array.isArray(j.servesCuisine) ? j.servesCuisine.join(', ') : (j.servesCuisine || '');
  const sameAs = Array.isArray(j.sameAs) ? j.sameAs.join(', ') : (j.sameAs || '');

  return {
    type: (j['@type'] as string) || 'LocalBusiness',
    name: j.name || '',
    url: j.url || '',
    telephone: j.telephone || '',
    addressLine: addr.streetAddress || '',
    locality: addr.addressLocality || '',
    postalCode: addr.postalCode || '',
    country: addr.addressCountry || 'TH',
    servesCuisine: serves,
    priceRange: j.priceRange || '',
    sameAs: sameAs,
    description: j.description || '',
  };
}

function AdminSeoSitePageInner() {
  const [form, setForm] = useState<SiteSeo>({});
  const [loading, setLoading] = useState(false);
  const [ogList, setOgList] = useState<string[]>(['', '', '', '']);

  // 🔹 เพิ่ม: state ของ Schema Builder
  const [builderEnabled, setBuilderEnabled] = useState(false);
  const [schemaType, setSchemaType] = useState<SchemaType>('Restaurant');
  const [customType, setCustomType] = useState('');
  const [builder, setBuilder] = useState({
    name: '',
    url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
    telephone: '',
    addressLine: '',
    locality: '',
    postalCode: '',
    country: 'TH',
    servesCuisine: '',
    priceRange: '',
    sameAs: '',
    description: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<SiteSeo>('/admin/seo/site');
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

        // 🔹 Prefill Builder จาก JSON-LD ถ้ามี
        const initial = extractBuilderFromJsonLd((data as any)?.jsonld);
        if (initial) {
          const t = initial.type || 'LocalBusiness';
          if ((KNOWN_TYPES as readonly string[]).includes(t as any)) {
            setSchemaType(t as SchemaType);
            setCustomType('');
          } else {
            setSchemaType('custom');
            setCustomType(t);
          }
          setBuilder(s => ({
            ...s,
            name: initial.name || (data.meta_title ?? ''),
            url: initial.url || (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
            telephone: initial.telephone,
            addressLine: initial.addressLine,
            locality: initial.locality,
            postalCode: initial.postalCode,
            country: initial.country || 'TH',
            servesCuisine: initial.servesCuisine,
            priceRange: initial.priceRange,
            sameAs: initial.sameAs,
            description: initial.description || (data.meta_description ?? ''),
          }));
          setBuilderEnabled(true); // โชว์แบบฟอร์มให้เห็นว่ามีข้อมูลอยู่แล้ว
        }
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
      const titleLen = (form.meta_title || '').length;
      if (titleLen > META_TITLE_MAX) errs.push(`Meta Title: ยาว ${titleLen} ตัวอักษร (เกินกำหนด ${META_TITLE_MAX})`);

      const descLen = (form.meta_description || '').length;
      if (descLen > META_DESC_MAX) errs.push(`Meta Description: ยาว ${descLen} ตัวอักษร (เกินกำหนด ${META_DESC_MAX})`);

      const normalized = normalizeKeywords(form.keywords);
      const kwLen = (normalized || '').length;
      if (kwLen > KEYWORDS_MAX) errs.push(`Keywords: ยาว ${kwLen} ตัวอักษร (เกินกำหนด ${KEYWORDS_MAX})`);

      const primaryLen = (primary || '').length;
      if (primaryLen > OG_IMAGE_MAX) errs.push(`OG Image URL: ยาว ${primaryLen} ตัวอักษร (เกินกำหนด ${OG_IMAGE_MAX})`);

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
              <div style="margin-top:8px;opacity:.85">โปรดแก้ไขตามรายการข้างต้นแล้วบันทึกอีกครั้ง</div>
            </div>
          `,
        });
        return;
      }

      const safeKeywords = normalized;

      // ---------- Build JSON-LD (อ้างอิงจากค่าที่ผู้ใช้เห็นในฟอร์ม) ----------
      const mergedJson = (typeof form.jsonld === 'object' && form.jsonld) ? { ...form.jsonld } : {};
      mergedJson['@context'] = 'https://schema.org';
      mergedJson['@type'] = mergedJson['@type'] || 'WebSite';
      mergedJson.name = form.meta_title || 'Sarisagroup';
      mergedJson.description = form.meta_description || '';
      mergedJson.url = siteUrl;
      mergedJson.image = ogList.filter(Boolean);
      if (safeKeywords) mergedJson.keywords = safeKeywords;

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

      await Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: hint });
    } finally {
      setLoading(false);
    }
  }

  const siteUrlBase = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

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

      {/* 🔹 เพิ่ม: Schema Builder (LocalBusiness / Restaurant) */}
      <div className="rounded-xl border border-white/10 p-3 space-y-3">
        <div className="flex items-center gap-3">
          <input
            id="builderEnabled"
            type="checkbox"
            checked={builderEnabled}
            onChange={(e) => setBuilderEnabled(e.target.checked)}
          />
          <label htmlFor="builderEnabled" className="text-sm font-semibold">
            เปิด Schema Builder (LocalBusiness / Restaurant)
          </label>
        </div>

        {builderEnabled && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <label className="text-sm">ประเภทธุรกิจ</label>
              <select
                value={schemaType}
                onChange={(e) => {
                  const v = e.target.value;
                  setSchemaType(v);
                  if (v !== 'custom') setCustomType('');
                }}
                className="rounded-md bg-[#1a1f27] border border-white/10 px-2 py-1"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="CafeOrCoffeeShop">CafeOrCoffeeShop</option>
                <option value="HairSalon">HairSalon</option>
                <option value="CarWash">CarWash</option>
                <option value="custom">Custom…</option>
              </select>

              {schemaType === 'custom' && (
                <input
                  type="text"
                  placeholder="ใส่ type เอง เช่น MyBusinessType"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="rounded-md bg-[#1a1f27] border border-white/10 px-2 py-1"
                />
              )}
            </div>

            <Field label="ชื่อธุรกิจ/ร้าน">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.name}
                onChange={(e) => setBuilder(s => ({ ...s, name: e.target.value }))} />
            </Field>
            <Field label="URL">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.url || siteUrlBase}
                onChange={(e) => setBuilder(s => ({ ...s, url: e.target.value }))} />
            </Field>
            <Field label="โทรศัพท์">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.telephone}
                onChange={(e) => setBuilder(s => ({ ...s, telephone: e.target.value }))} />
            </Field>
            <Field label="Price Range (เช่น ฿฿)">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.priceRange}
                onChange={(e) => setBuilder(s => ({ ...s, priceRange: e.target.value }))} />
            </Field>
            <Field label="Serves Cuisine (คั่นด้วย ,)">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.servesCuisine}
                onChange={(e) => setBuilder(s => ({ ...s, servesCuisine: e.target.value }))} />
            </Field>
            <Field label="ที่อยู่ (บรรทัด)">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.addressLine}
                onChange={(e) => setBuilder(s => ({ ...s, addressLine: e.target.value }))} />
            </Field>
            <Field label="อำเภอ/เมือง">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.locality}
                onChange={(e) => setBuilder(s => ({ ...s, locality: e.target.value }))} />
            </Field>
            <Field label="รหัสไปรษณีย์">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.postalCode}
                onChange={(e) => setBuilder(s => ({ ...s, postalCode: e.target.value }))} />
            </Field>
            <Field label="ประเทศ (เช่น TH)">
              <input className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.country}
                onChange={(e) => setBuilder(s => ({ ...s, country: e.target.value }))} />
            </Field>
            <Field label="ลิงก์ social (คั่นด้วย ,)">
              <textarea rows={3} className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.sameAs}
                onChange={(e) => setBuilder(s => ({ ...s, sameAs: e.target.value }))} />
            </Field>
            <Field label="คำอธิบาย (ถ้าต้องการ)">
              <textarea rows={3} className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={builder.description}
                onChange={(e) => setBuilder(s => ({ ...s, description: e.target.value }))} />
            </Field>

            <div className="sm:col-span-2">
              <button
                type="button"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                onClick={() => {
                  const finalType = (schemaType === 'custom' ? customType : schemaType).trim();
                  if (!finalType) {
                    Swal.fire({ icon: 'warning', title: 'กรุณาระบุประเภทธุรกิจ', text: 'ใส่ค่าในช่อง Custom ด้วยครับ' });
                    return;
                  }
                  const data = buildLocalBusinessJsonLd({
                    type: finalType,
                    name: builder.name || form.meta_title || 'Sarisagroup',
                    url: builder.url || siteUrlBase,
                    telephone: builder.telephone,
                    addressLine: builder.addressLine,
                    locality: builder.locality,
                    postalCode: builder.postalCode,
                    country: builder.country || 'TH',
                    servesCuisine: builder.servesCuisine,
                    priceRange: builder.priceRange,
                    sameAs: builder.sameAs,
                    description: builder.description || form.meta_description,
                    images: ogList.filter(Boolean),
                  });
                  const merged = { ...(typeof form.jsonld === 'object' ? form.jsonld : {}), ...data };
                  setForm(s => ({ ...s, jsonld: merged }));
                  Swal.fire({ icon: 'success', title: 'เติม JSON-LD สำเร็จ', timer: 1200, showConfirmButton: false });
                }}
              >
                เติม JSON-LD จากฟอร์ม
              </button>
              <div className="text-xs opacity-70 mt-2">รูปภาพจะใช้จาก “OG Images” ที่เลือกด้านบนโดยอัตโนมัติ</div>
            </div>
          </div>
        )}
      </div>

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