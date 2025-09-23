'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import { parseVideoUrl } from '@/lib/videoUrl';
import Swal from 'sweetalert2';

type Video = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url?: string | null;
  order_number: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  store_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type StoreMini = { id: string; name: string };

/* ---------------- helpers ---------------- */
function isYouTubeUrl(url = ''): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return h.includes('youtube.com') || h.includes('youtu.be');
  } catch {
    return false;
  }
}
function guessYouTubeId(url = ''): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/(embed|shorts)\/([^/?#]+)/);
    if (m?.[2]) return m[2];
  } catch {}
  return null;
}
function guessYouTubeThumb(url = ''): string | null {
  const id = guessYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-gray-300">{label}</span>
      {children}
    </label>
  );
}

/** ---------------- Pretty confirm dialog ---------------- */
function ConfirmDialog({
  open,
  title = 'ยืนยันการทำรายการ',
  message,
  confirmText = 'ลบ',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0f1623] text-white shadow-2xl ring-1 ring-white/10">
        <div className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold">{title}</h3>
          {message && <p className="mt-2 text-sm text-slate-300">{message}</p>}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
/** -------------------------------------------------------- */

export default function AdminVideosPage() {
  const { data, mutate, isLoading } = useSWR<{ videos: Video[]; total: number }>(
    '/admin/videos?take=500',
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false, dedupingInterval: 1500 }
  );

  const { data: storeListData } = useSWR<{ stores: StoreMini[] }>(
    '/admin/stores?active=1&take=1000&select=id,name',
    (url) =>
      apiFetch(url, { method: 'GET' }).then((r) => {
        if (Array.isArray(r?.items)) {
          return { stores: r.items.map((s: any) => ({ id: s.id, name: s.name })) };
        }
        if (Array.isArray(r?.stores)) return r;
        return { stores: [] as StoreMini[] };
      }),
    { revalidateOnFocus: false, dedupingInterval: 3000 }
  );

  const stores = storeListData?.stores ?? [];

  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<Partial<Video>>({
    title: '',
    youtube_url: '',
    thumbnail_url: '',
    order_number: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    store_id: '',
  });
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });

  /* ---------- อัปโหลดรูปหน้าปก ---------- */
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onClickPickFile = () => fileInputRef.current?.click();

  const extractImageUrl = (json: any): string | undefined =>
    json?.image?.image_url || json?.image_url || json?.url || json?.location || json?.secure_url || undefined;

  const uploadCover = async (file: File) => {
  setUploadingCover(true);

  // เปิด loading แต่ "ไม่ await"
  Swal.fire({
    title: 'กำลังอัปโหลด…',
    html: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/admin/images`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const ctype = res.headers.get('content-type') || '';
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload failed: ${res.status} ${txt.slice(0, 200)}`);
    }

    const json = ctype.includes('application/json') ? await res.json() : {};
    const url =
      json?.image?.image_url ||
      json?.image_url ||
      json?.url ||
      json?.location ||
      json?.secure_url ||
      undefined;

    if (!url) throw new Error('Response ไม่มี image_url');

    setForm((s) => ({ ...s, thumbnail_url: url }));

    // ปิด loading แล้วโชว์สำเร็จ
    Swal.close();
    await Swal.fire({
      icon: 'success',
      title: 'อัปโหลดสำเร็จ',
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (e: any) {
    // ปิด loading แล้วแจ้ง error
    Swal.close();
    await Swal.fire({
      icon: 'error',
      title: 'อัปโหลดไม่สำเร็จ',
      text: e?.message || 'ลองใหม่อีกครั้ง',
    });
  } finally {
    setUploadingCover(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};
  /* -------------------------------------- */

  useEffect(() => {
    if (!editing) {
      setForm({
        title: '',
        youtube_url: '',
        thumbnail_url: '',
        order_number: 0,
        is_active: true,
        start_date: '',
        end_date: '',
        store_id: '',
      });
    } else {
      setForm({
        title: editing.title ?? '',
        youtube_url: editing.youtube_url ?? '',
        thumbnail_url: editing.thumbnail_url ?? '',
        order_number: editing.order_number ?? 0,
        is_active: !!editing.is_active,
        start_date: editing.start_date ? editing.start_date.slice(0, 10) : '',
        end_date: editing.end_date ? editing.end_date.slice(0, 10) : '',
        store_id: editing.store_id ?? '',
      });
    }
  }, [editing]);

  const onChange = (patch: Partial<Video>) => setForm((s) => ({ ...s, ...patch }));

  const canSave = useMemo(() => {
    return !!form.title?.trim() && !!form.youtube_url?.trim() && !saving;
  }, [form, saving]);

  const isYT = isYouTubeUrl(form.youtube_url || '');

  const onAutoThumb = () => {
    const t = guessYouTubeThumb(form.youtube_url || '');
    if (t) onChange({ thumbnail_url: t });
  };

  const createVideo = async () => {
  setSaving(true);
  try {
    // ✅ ตรวจและ normalize ลิงก์
    const parsed = parseVideoUrl((form.youtube_url || '').trim());
    if (!parsed) {
      throw new Error('ลิงก์วิดีโอไม่ถูกต้อง (รองรับ YouTube/TikTok)');
    }

    await apiFetch('/admin/videos', {
      method: 'POST',
      body: {
        title: (form.title || '').trim(),
        youtube_url: parsed.url,                          // ใช้ URL ที่ normalize แล้ว
        platform: parsed.kind,                            // ใส่ได้ถ้า backend รองรับ (ไม่รองรับลบบรรทัดนี้)
        thumbnail_url: (form.thumbnail_url || '').trim() || undefined,
        order_number: Number(form.order_number) || 0,
        is_active: !!form.is_active,
        start_date: form.start_date ? new Date(form.start_date) : null,
        end_date: form.end_date ? new Date(form.end_date) : null,
        store_id: form.store_id || null,
      },
    });
    setEditing(null);
    await mutate();
  } finally {
    setSaving(false);
  }
};

  const updateVideo = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/videos/${editing.id}`, {
        method: 'PATCH',
        body: {
          title: (form.title || '').trim(),
          youtube_url: (form.youtube_url || '').trim(),
          thumbnail_url: (form.thumbnail_url || '').trim() || null,
          order_number: Number(form.order_number) || 0,
          is_active: !!form.is_active,
          start_date: form.start_date ? new Date(form.start_date) : null,
          end_date: form.end_date ? new Date(form.end_date) : null,
          store_id: form.store_id || null,
        },
      });
      setEditing(null);
      await mutate();
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (v: Video) => setConfirmState({ open: true, id: v.id, name: v.title });

  const confirmDelete = async () => {
    const id = confirmState.id!;
    setConfirmState({ open: false });
    await apiFetch(`/admin/videos/${id}`, { method: 'DELETE' });
    await mutate();
  };

  const videos = data?.videos ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">จัดการวิดีโอ (YouTube/TikTok)</h1>
          <p className="text-sm text-gray-400">เพิ่ม/แก้ไขวิดีโอที่จะแสดงบนหน้าแรกและหน้าอื่น ๆ</p>
        </div>
        <button
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
          onClick={() => setEditing({} as any)}
        >
          + เพิ่มวิดีโอ
        </button>
      </header>

      {/* ฟอร์ม */}
      {editing !== null && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ซ้าย: เนื้อหา */}
            <div className="space-y-4">
              <div className="text-lg font-medium">รายละเอียดวิดีโอ</div>

              <InputRow label="Title">
                <input
                  value={form.title || ''}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="w-full rounded bg-white/10 px-3 py-2"
                  placeholder="เช่น รีวิวร้าน…"
                />
              </InputRow>

              <InputRow label="Video URL (รองรับ YouTube / TikTok)">
                <div className="flex gap-2">
                  <input
                    value={form.youtube_url || ''}
                    onChange={(e) => onChange({ youtube_url: e.target.value })}
                    className="w-full rounded bg-white/10 px-3 py-2"
                    placeholder="https://youtu.be/... หรือ https://www.tiktok.com/@user/video/..."
                  />
                  <button
                    type="button"
                    className="rounded bg-white/10 px-3 text-sm hover:bg-white/20 disabled:opacity-50"
                    onClick={onAutoThumb}
                    title="เดา Thumbnail อัตโนมัติจาก YouTube (ใช้ได้เฉพาะลิงก์ YouTube)"
                    disabled={!isYT}
                  >
                    เดา Thumb
                  </button>
                </div>
              </InputRow>

              {/* Cover URL + อัปโหลด + พรีวิว (object-contain ไม่ครอป) */}
              <InputRow label="Cover (Thumbnail) URL">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={form.thumbnail_url || ''}
                      onChange={(e) => onChange({ thumbnail_url: e.target.value })}
                      className="w-full rounded bg-white/10 px-3 py-2"
                      placeholder="วาง URL รูป หรือกดอัปโหลด"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.currentTarget.files?.[0];
                        if (f) uploadCover(f);
                      }}
                    />
                    <button
                      type="button"
                      className="rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50"
                      onClick={onClickPickFile}
                      disabled={uploadingCover}
                      title="อัปโหลดรูปหน้าปกจากเครื่อง"
                    >
                      {uploadingCover ? 'กำลังอัปโหลด…' : 'อัปโหลดรูป'}
                    </button>
                  </div>

                  {!isYT && (form.youtube_url || '').trim() !== '' && (
                    <p className="text-xs text-gray-400">
                      * ลิงก์เป็น TikTok — แนะนำให้อัปโหลดหรือวาง URL รูปหน้าปกเองเพื่อให้เห็นรูปบนหน้าแรก
                    </p>
                  )}

                  {(form.thumbnail_url || '').trim() !== '' && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.thumbnail_url!}
                        alt="thumbnail preview"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </InputRow>
            </div>

            {/* ขวา: การตั้งค่า */}
            <div className="space-y-4">
              <div className="text-lg font-medium">การตั้งค่าแสดงผล</div>

              <InputRow label="ลำดับ (order)">
                <input
                  type="number"
                  value={form.order_number ?? 0}
                  onChange={(e) => onChange({ order_number: Number(e.target.value) })}
                  className="w-full rounded bg-white/10 px-3 py-2"
                />
              </InputRow>

              <InputRow label="สถานะการแสดงผล">
                <select
                  value={form.is_active ? '1' : '0'}
                  onChange={(e) => onChange({ is_active: e.target.value === '1' })}
                  className="w-full rounded bg-white/10 px-3 py-2"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </InputRow>

              <InputRow label="ผูกร้าน (ถ้ามี)">
                <select
                  value={form.store_id || ''}
                  onChange={(e) => onChange({ store_id: e.target.value || '' })}
                  className="w-full rounded bg-white/10 px-3 py-2"
                >
                  <option value="">— ไม่ผูกกับร้าน —</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </InputRow>

              <div className="grid grid-cols-2 gap-3">
                <InputRow label="เริ่มแสดง (ไม่ใส่ = เริ่มเลย)">
                  <input
                    type="date"
                    value={form.start_date || ''}
                    onChange={(e) => onChange({ start_date: e.target.value })}
                    className="w-full rounded bg-white/10 px-3 py-2"
                  />
                </InputRow>
                <InputRow label="สิ้นสุดแสดง (ไม่ใส่ = ไม่มีกำหนด)">
                  <input
                    type="date"
                    value={form.end_date || ''}
                    onChange={(e) => onChange({ end_date: e.target.value })}
                    className="w-full rounded bg-white/10 px-3 py-2"
                  />
                </InputRow>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm ${
                canSave ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white/10 opacity-60'
              }`}
              onClick={editing?.id ? updateVideo : createVideo}
              disabled={!canSave}
            >
              {saving ? 'กำลังบันทึก…' : editing?.id ? 'บันทึกการแก้ไข' : 'บันทึก'}
            </button>
          </div>
        </section>
      )}

      {/* ตารางรายการ */}
      <section className="rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-3 py-2 text-left">Thumbnail</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">URL</th>
                <th className="px-3 py-2 text-left">Store</th>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-3 py-3" colSpan={7}>
                    กำลังโหลด…
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td className="px-3 py-3" colSpan={7}>
                    ยังไม่มีวิดีโอ
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr key={v.id} className="border-t border-white/10">
                    <td className="px-3 py-2">
                      {v.thumbnail_url ? (
                        // ✅ เปลี่ยนเป็น object-contain ให้รูปแนวตั้งไม่ถูกครอป
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.thumbnail_url}
                          alt={v.title}
                          className="h-12 w-20 rounded object-contain bg-white/10"
                        />
                      ) : (
                        <div className="h-12 w-20 grid place-items-center bg-white/10 rounded text-xs opacity-70">
                          no image
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">{v.title}</td>
                    <td className="px-3 py-2 max-w-[260px] truncate">
                      <a
                        href={v.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline opacity-90 hover:opacity-100"
                      >
                        {v.youtube_url}
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      {v.store_id ? stores.find((s) => s.id === v.store_id)?.name ?? v.store_id : '-'}
                    </td>
                    <td className="px-3 py-2">{v.order_number}</td>
                    <td className="px-3 py-2">{v.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="rounded bg-white/10 hover:bg-white/20 px-3 py-1"
                          onClick={() => setEditing(v)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="rounded bg-red-600/80 hover:bg-red-700 px-3 py-1"
                          onClick={() => setConfirmState({ open: true, id: v.id, name: v.title })}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDialog
        open={confirmState.open}
        title="ลบวิดีโอ?"
        message={`ต้องการลบ “${confirmState.name ?? ''}” หรือไม่`}
        confirmText="ลบวิดีโอ"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          const id = confirmState.id!;
          setConfirmState({ open: false });
          await apiFetch(`/admin/videos/${id}`, { method: 'DELETE' });
          await mutate();
        }}
        onCancel={() => setConfirmState({ open: false })}
      />
    </div>
  );
}