'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { swalLoading, swalSuccess, swalError, swalConfirmDelete, Swal } from '@/lib/swal';

/* ----------------------------- types ----------------------------- */
type EventRow = {
  id: string;
  store_id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  cover_image?: string | null;
  is_active: boolean;
  store?: { name?: string };
};

type StoreMini = { id: string; name: string };

/* ----------------------------- UI bits ----------------------------- */
function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-gray-300">{label}</span>
      {children}
    </label>
  );
}

/* ============================ PAGE ============================ */
export default function AdminEventsPage() {
  const { data, mutate, isLoading } = useSWR<{ events: EventRow[] }>(
    '/admin/events?take=500',
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false }
  );

  const { data: storesData } = useSWR<{ stores: StoreMini[] }>(
    '/admin/stores?active=1&take=1000&select=id,name',
    (url) =>
      apiFetch(url, { method: 'GET' }).then((r) => {
        if (Array.isArray(r?.items)) return { stores: r.items.map((s: any) => ({ id: s.id, name: s.name })) };
        if (Array.isArray(r?.stores)) return r;
        return { stores: [] as StoreMini[] };
      })
  );
  const stores = storesData?.stores ?? [];

  /* form state */
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState<Partial<EventRow>>({
    store_id: '',
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    cover_image: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editing) {
      setForm({ store_id: '', title: '', description: '', start_at: '', end_at: '', cover_image: '', is_active: true });
    } else {
      setForm({
        store_id: editing.store_id,
        title: editing.title ?? '',
        description: editing.description ?? '',
        start_at: editing.start_at ? editing.start_at.slice(0, 10) : '',
        end_at: editing.end_at ? editing.end_at.slice(0, 10) : '',
        cover_image: editing.cover_image ?? '',
        is_active: !!editing.is_active,
      });
    }
  }, [editing]);

  const canSave = useMemo(
    () => !!form.store_id && !!form.title?.trim() && !!form.start_at && !saving,
    [form, saving]
  );
  const onChange = (patch: Partial<EventRow>) => setForm((s) => ({ ...s, ...patch }));

  /* อัปโหลดรูป -> /api/admin/images */
 // อัปโหลดรูป
async function handleUpload(file: File) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    await swalError('อัปโหลดไม่สำเร็จ', 'กรุณาเลือกรูปภาพเท่านั้น');
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    await swalError('อัปโหลดไม่สำเร็จ', 'ไฟล์ใหญ่เกิน 8MB');
    return;
  }

  setUploading(true);
  swalLoading('กำลังอัปโหลดรูป…'); // อย่า await
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('collection', 'events');

    // ใช้ BASE เดียวกับฝั่ง backend (ตั้งไว้ใน env)
    const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/admin/images`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });

    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    const json = ct.includes('application/json') ? JSON.parse(text) : (() => { try { return JSON.parse(text); } catch { return null; } })();

    if (!res.ok) {
      const msg = json?.message || json?.error || text || 'upload failed';
      throw new Error(msg);
    }

    const url =
      json?.image?.image_url ||
      json?.image_url ||
      json?.url ||
      json?.secure_url ||
      '';

    if (!url) throw new Error('อัปโหลดไม่สำเร็จ');

    onChange({ cover_image: url });
    await swalSuccess('อัปโหลดสำเร็จ');
  } catch (e: any) {
    await swalError('อัปโหลดไม่สำเร็จ', e?.message || 'ลองใหม่อีกครั้ง');
  } finally {
    setUploading(false);
    if (Swal.isLoading()) Swal.close();
  }
}

// บันทึก (สร้าง)
const createEvent = async () => {
  setSaving(true);
  swalLoading('กำลังบันทึก…'); // อย่า await
  try {
    await apiFetch('/admin/events', {
      method: 'POST',
      body: {
        store_id: form.store_id,
        title: (form.title || '').trim(),
        description: (form.description || '').trim(),
        start_at: form.start_at,
        end_at: form.end_at || null,
        cover_image: (form.cover_image || '').trim() || null,
        is_active: !!form.is_active,
      },
    });
    setEditing(null);
    await mutate();
    await swalSuccess('บันทึกสำเร็จ');
  } catch (e: any) {
    await swalError('บันทึกไม่สำเร็จ', e?.message || 'ลองใหม่อีกครั้ง');
  } finally {
    setSaving(false);
    if (Swal.isLoading()) Swal.close();
  }
};

// บันทึก (แก้ไข)
const updateEvent = async () => {
  if (!editing?.id) return;
  setSaving(true);
  swalLoading('กำลังบันทึก…'); // อย่า await
  try {
    await apiFetch(`/admin/events/${editing.id}`, {
      method: 'PATCH',
      body: {
        store_id: form.store_id,
        title: (form.title || '').trim(),
        description: (form.description || '').trim(),
        start_at: form.start_at,
        end_at: form.end_at || null,
        cover_image: (form.cover_image || '').trim() || null,
        is_active: !!form.is_active,
      },
    });
    setEditing(null);
    await mutate();
    await swalSuccess('บันทึกสำเร็จ');
  } catch (e: any) {
    await swalError('บันทึกไม่สำเร็จ', e?.message || 'ลองใหม่อีกครั้ง');
  } finally {
    setSaving(false);
    if (Swal.isLoading()) Swal.close();
  }
};

// ลบ
const onDelete = async (id: string, name: string) => {
  const ok = (await swalConfirmDelete(`ต้องการลบ “${name}” หรือไม่`)).isConfirmed;
  if (!ok) return;

  swalLoading('กำลังลบ…'); // อย่า await
  try {
    await apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
    await mutate();
    await swalSuccess('ลบสำเร็จ');
  } catch (e: any) {
    await swalError('ลบไม่สำเร็จ', e?.message || 'ลองใหม่อีกครั้ง');
  } finally {
    if (Swal.isLoading()) Swal.close();
  }
};

  const rows = data?.events ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">จัดการกิจกรรม (Events)</h1>
          <p className="text-sm text-gray-400">กิจกรรมจะแสดงเป็นสไลด์บนหน้าแรก</p>
        </div>
        <button
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
          onClick={() => setEditing({} as any)}
        >
          + เพิ่มกิจกรรม
        </button>
      </header>

      {/* ---------- Preview แบบสไลด์ (scroll-snap) ---------- */}
      {rows.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="mb-3 text-sm font-medium text-slate-200">พรีวิวการ์ด (เลื่อนดูได้)</div>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-4 snap-x snap-mandatory">
              {rows.map((r) => (
                <div key={r.id} className="min-w-[280px] md:min-w-[360px] snap-start">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.cover_image || '/images/placeholder.png'} alt={r.title}
                      className="h-40 w-full object-cover md:h-48"
                    />
                    <div className="p-3 md:p-4">
                      <div className="font-semibold leading-snug">{r.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- ฟอร์ม ---------- */}
      {editing !== null && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 space-y-4">
          <div className="text-lg font-medium">{editing?.id ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputRow label="เลือกร้าน (แสดงชื่อร้านใต้การ์ดเป็น location)">
              <select
                value={form.store_id || ''}
                onChange={(e) => onChange({ store_id: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
              >
                <option value="">— เลือกร้าน —</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </InputRow>

            <InputRow label="ชื่อกิจกรรม">
              <input
                value={form.title || ''}
                onChange={(e) => onChange({ title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                placeholder="เช่น งานเปิดตัวสาขาใหม่"
              />
            </InputRow>

            <InputRow label="เริ่ม (วันที่)">
              <input
                type="date"
                value={form.start_at || ''}
                onChange={(e) => onChange({ start_at: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
              />
            </InputRow>

            <InputRow label="สิ้นสุด (ไม่บังคับ)">
              <input
                type="date"
                value={form.end_at || ''}
                onChange={(e) => onChange({ end_at: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
              />
            </InputRow>

            {/* รูปหน้าปก */}
            <div className="grid gap-3">
              <InputRow label="รูปหน้าปก (URL)">
                <input
                  value={form.cover_image || ''}
                  onChange={(e) => onChange({ cover_image: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  placeholder="https://…"
                />
              </InputRow>

              <div className="grid gap-2">
                <span className="text-sm text-gray-300">หรืออัปโหลดรูป</span>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    className="block w-full text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-100 hover:file:bg-white/20"
                  />
                  {uploading && <span className="text-xs text-slate-300">กำลังอัปโหลด…</span>}
                </div>

                {form.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover_image} alt="preview" className="mt-1 h-28 w-44 rounded object-cover ring-1 ring-white/10" />
                ) : (
                  <div className="mt-1 h-28 w-44 grid place-items-center rounded bg-white/5 text-xs text-slate-400 ring-1 ring-white/10">
                    preview
                  </div>
                )}
              </div>
            </div>

            <InputRow label="สถานะ">
              <select
                value={form.is_active ? '1' : '0'}
                onChange={(e) => onChange({ is_active: e.target.value === '1' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </InputRow>

            <InputRow label="รายละเอียด (ไม่บังคับ)">
              <textarea
                value={form.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                placeholder="รายละเอียดกิจกรรมเพิ่มเติม"
              />
            </InputRow>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm" onClick={() => setEditing(null)} disabled={saving}>
              ยกเลิก
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm ${canSave ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white/10 opacity-60'}`}
              onClick={editing?.id ? updateEvent : createEvent}
              disabled={!canSave}
            >
              {saving ? 'กำลังบันทึก…' : editing?.id ? 'บันทึกการแก้ไข' : 'บันทึก'}
            </button>
          </div>
        </section>
      )}

      {/* ---------- ตารางรายการ ---------- */}
      <section className="rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-3 py-2 text-left">Cover</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Store</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-3 py-3">กำลังโหลด…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-3">ยังไม่มีกิจกรรม</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-3 py-2">
                      {r.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover_image} alt={r.title} className="h-12 w-20 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-20 grid place-items-center bg-white/10 rounded text-xs opacity-70">no image</div>
                      )}
                    </td>
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2">{r.store?.name ?? '-'}</td>
                    <td className="px-3 py-2">{r.start_at?.slice(0, 10)}</td>
                    <td className="px-3 py-2">{r.end_at?.slice(0, 10) ?? '-'}</td>
                    <td className="px-3 py-2">{r.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button className="rounded bg-white/10 hover:bg-white/20 px-3 py-1" onClick={() => setEditing(r)}>แก้ไข</button>
                        <button className="rounded bg-red-600/80 hover:bg-red-700 px-3 py-1" onClick={() => onDelete(r.id, r.title)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}