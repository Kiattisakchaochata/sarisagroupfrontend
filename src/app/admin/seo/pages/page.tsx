'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import OgPicker4 from '@/components/admin/OgPicker4';
import { Swal } from '@/lib/swal';

type PageSeo = {
  id: string;
  path: string;
  title?: string;
  description?: string;
  og_image?: string;
  jsonld?: any;
  noindex: boolean;
  updated_at: string;
};

export default function AdminSeoPagesPage() {
  const [rows, setRows] = useState<PageSeo[]>([]);
  const [editing, setEditing] = useState<Partial<PageSeo> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string>('');

  const refresh = async () => {
    setLoadErr('');
    try {
      const res = await apiFetch<{ pages: PageSeo[] }>('/admin/seo/pages');
      setRows(res.pages ?? []);
    } catch (e: any) {
      setLoadErr(e?.message || 'โหลดข้อมูลไม่สำเร็จ');
    }
  };

  useEffect(() => { refresh(); }, []);

  const startNew = () => setEditing({ path: '' });

  // บันทึก (upsert)
  const onSave = async (payload: {
    id?: string;
    path: string;
    title: string;
    description: string;
    og_image: string;
    noindex: boolean;
    jsonld: any;
  }): Promise<boolean> => {
    if (!payload.path) throw new Error('โปรดระบุ path');
    if (loading) return false;

    setLoading(true);
    try {
      const body = {
        id: payload.id,
        path: normPath(payload.path),
        title: payload.title ?? '',
        description: payload.description ?? '',
        og_image: payload.og_image ?? '',
        noindex: !!payload.noindex,
        jsonld: safeJson(payload.jsonld) || {},
      };

      await apiFetch('/admin/seo/page', {
        method: 'POST', // BE รองรับ PUT/POST/PATCH แล้ว
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await refresh();
      return true;
    } catch (e: any) {
      throw new Error(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: 'ลบรายการนี้?',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(r => r.isConfirmed);
    if (!ok) return;

    try {
      await apiFetch(`/admin/seo/page/${id}`, { method: 'DELETE' });
      await refresh();
      Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: e?.message || '' });
    }
  };

  const sorted = useMemo(
    () => rows.slice().sort((a, b) => a.path.localeCompare(b.path)),
    [rows]
  );

  return (
    <Suspense fallback={<div className="container mx-auto max-w-5xl px-4 md:px-6 py-10 text-white">กำลังโหลด…</div>}>
      <main className="container mx-auto max-w-5xl px-4 md:px-6 py-10 text-white space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Page SEO</h1>
          <button onClick={startNew} className="rounded-full bg-amber-500 text-white px-5 py-2.5 font-semibold">
            + สร้าง
          </button>
        </div>

        {loadErr && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 p-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">โหลดข้อมูลไม่สำเร็จ</div>
              <div className="text-sm opacity-90 break-all">{loadErr}</div>
              <div className="text-xs mt-1 opacity-70">
                ตรวจสอบว่า backend มี route <code>/api/admin/seo/pages</code> แล้ว
                frontend เรียกผ่าน <code>apiFetch('/admin/seo/pages')</code>
              </div>
            </div>
            <button onClick={refresh} className="shrink-0 rounded-full bg-red-500/20 hover:bg-red-500/30 px-3 py-1 text-sm">
              ลองใหม่
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#111418] shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-300">
                  <th className="p-3">Path</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Noindex</th>
                  <th className="p-3 w-36"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="p-3 font-mono">{r.path}</td>
                    <td className="p-3">{r.title || '-'}</td>
                    <td className="p-3">{r.noindex ? '✅' : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing({ ...r, jsonld: safeJson(r.jsonld) })}
                          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="px-3 py-1 rounded-full bg-red-600/80 hover:bg-red-600"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && !loadErr && (
                  <tr><td className="p-4 text-gray-400" colSpan={4}>ยังไม่มีข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editing && (
          <EditModal
            editing={editing}
            setEditing={setEditing}
            onSave={onSave}
          />
        )}
      </main>
    </Suspense>
  );
}

// ทำ path ให้มาตรฐาน: มี / นำหน้า และไม่มี / ท้าย (ยกเว้นหน้า /)
function normPath(p: string) {
  if (!p) return '/';
  let s = String(p).trim();
  if (!s.startsWith('/')) s = '/' + s;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

/* ---------- Modal ---------- */
function EditModal({
  editing,
  setEditing,
  onSave,
}: {
  editing: Partial<PageSeo>;
  setEditing: (v: any) => void;
  onSave: (payload: {
    id?: string;
    path: string;
    title: string;
    description: string;
    og_image: string;
    noindex: boolean;
    jsonld: any;
  }) => Promise<boolean>;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [form, setForm] = useState({
    path: editing.path ?? '',
    title: editing.title ?? '',
    description: editing.description ?? '',
    noindex: !!editing.noindex,
    jsonld: editing.jsonld ?? {},
  });

  const [ogList, setOgList] = useState<string[]>(['', '', '', '']);
  const [btnLoading, setBtnLoading] = useState(false);
  const [jsonldTouched, setJsonldTouched] = useState(false);

  useEffect(() => {
  const fromJson = Array.isArray((editing as any)?.jsonld?.image)
    ? ((editing as any).jsonld.image as string[])
    : [];
  const base = [editing.og_image, ...fromJson].filter(Boolean) as string[];
  const uniq = Array.from(new Set(base)).slice(0, 4);

  setOgList([...uniq, '', '', '', ''].slice(0, 4));
  setForm({
    path: editing.path ?? '',
    title: editing.title ?? '',
    description: editing.description ?? '',
    noindex: !!editing.noindex,
    jsonld: editing.jsonld ?? {},
  });

  // reset touch flag ทุกครั้งที่เปิด modal รายการใหม่
  setJsonldTouched(false);
}, [editing]);
useEffect(() => {
  if (jsonldTouched) return; // ผู้ใช้แก้ JSON-LD เองแล้ว ไม่ซิงก์ทับ

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const p = normPath(form.path);

  const base: any = (typeof form.jsonld === 'object' && form.jsonld) ? { ...form.jsonld } : {};
  base['@context'] = 'https://schema.org';
  base['@type'] = base['@type'] || 'WebPage';
  base.url = `${siteUrl}${p}`;
  base.name = form.title || 'Sarisagroup';
  base.description = form.description || '';
  base.image = ogList.filter(Boolean);

  // ✅ อัปเดตก็ต่อเมื่อค่าเปลี่ยนจริง ๆ
  if (!deepEqual(base, form.jsonld)) {
    setForm((s) => ({ ...s, jsonld: base }));
  }
}, [form.title, form.description, form.path, ogList, jsonldTouched]);

  const saveWithImages = async () => {
  const primary = ogList.find(Boolean) || editing.og_image || '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const p = normPath(form.path);

  const merged: any = (typeof form.jsonld === 'object' && form.jsonld) ? { ...form.jsonld } : {};
  merged['@context'] = 'https://schema.org';
  merged['@type'] = merged['@type'] || 'WebPage';
  merged.url = `${siteUrl}${p}`;
  merged.name = form.title || 'Sarisagroup';
  merged.description = form.description || '';      // บังคับอัปเดตจากฟอร์ม
  merged.image = ogList.filter(Boolean);            // บังคับอัปเดตจากตัวเลือกภาพ

  setBtnLoading(true);
  Swal.fire({ title: 'กำลังบันทึก…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const ok = await onSave({
      id: editing.id,
      path: form.path,
      title: form.title,
      description: form.description,
      og_image: primary,
      noindex: !!form.noindex,
      jsonld: merged,
    });

    Swal.close();
    if (ok) {
      await Swal.fire({ icon: 'success', title: 'บันทึก Page SEO สำเร็จ', confirmButtonText: 'ตกลง' });
      setEditing(null);
    }
  } catch (e: any) {
    Swal.close();
    await Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: e?.message || 'ลองใหม่อีกครั้ง' });
  } finally {
    setBtnLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1115] shadow-2xl">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold">{editing?.id ? 'แก้ไข' : 'สร้าง'} Page SEO</h2>
        </div>

        <div className="px-6 pb-6 mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Path (เช่น /about, /stores/abc)" value={form.path} onChange={(v) => setForm((s) => ({ ...s, path: v }))} />
          <Input label="Title" value={form.title} onChange={(v) => setForm((s) => ({ ...s, title: v }))} />
          <TextArea rows={4} label="Description" value={form.description} onChange={(v) => setForm((s) => ({ ...s, description: v }))} />

          <OgPicker4 label="OG Images (สูงสุด 4)" value={ogList} onChange={setOgList} />

          <div className="flex items-center gap-2">
            <input id="noindex" type="checkbox" checked={!!form.noindex} onChange={(e) => setForm((s) => ({ ...s, noindex: e.target.checked }))} />
            <label htmlFor="noindex" className="text-sm">noindex</label>
          </div>

          <JsonArea
  label="JSON-LD (object)"
  placeholder={`ตัวอย่าง: {
"@context": "https://schema.org",
"@type": "WebPage",
"name": "ชื่อหน้า",
"url": "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/your-path"
}`}
  value={form.jsonld}
  onChange={(v) => {
    setJsonldTouched(true);            // ★ mark ว่าผู้ใช้แก้เองแล้ว
    setForm((s) => ({ ...s, jsonld: v }));
  }}
/>
        </div>

        <div className="sticky bottom-0 bg-[#0f1115] px-6 pb-6 pt-3 rounded-b-2xl flex justify-end gap-2">
          <button onClick={() => setEditing(null)} className="rounded-full px-4 py-2 bg-white/10 hover:bg-white/15">ยกเลิก</button>
          <button onClick={saveWithImages} disabled={btnLoading} className="rounded-full px-5 py-2 bg-amber-500 text-white font-semibold disabled:opacity-60">
            {btnLoading ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Inputs & utils ---------- */
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none" />
    </div>
  );
}
function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none" />
    </div>
  );
}
function JsonArea({ label, value, onChange, placeholder }: { label: string; value: any; onChange: (v: any) => void; placeholder?: string }) {
  const [raw, setRaw] = useState<string>(() => (value ? JSON.stringify(value, null, 2) : ''));
  useEffect(() => { setRaw(value ? JSON.stringify(value, null, 2) : ''); }, [value]);
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <textarea
  rows={10}
  value={raw}
  placeholder={placeholder}
  onChange={(e) => {
    const text = e.target.value;
    setRaw(text);
    try {
      const obj = JSON.parse(text);
      onChange(obj);          // ✔ เก็บเป็น object เมื่อ JSON valid
    } catch {
      onChange(value);        // ✔ ถ้าไม่ valid คงค่า object เดิมไว้ (ไม่เขียนทับเป็น string)
    }
  }}
  className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none font-mono text-sm"
/>
    </div>
  );
}
function parseOrRaw(s: string) { try { return JSON.parse(s); } catch { return s; } }
function safeJson(j: any) { if (!j) return null; if (typeof j === 'object') return j; try { return JSON.parse(String(j)); } catch { return null; } }
function deepEqual(a: any, b: any) {
  try { 
    return JSON.stringify(a) === JSON.stringify(b); 
  } catch { 
    return a === b; 
  }
}