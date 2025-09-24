'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Contact = {
  id?: string;
  store_name?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  messenger?: string;
  line?: string;
  address?: string;
  map_iframe?: string;
  is_active?: boolean;
  order_number?: number;
};

function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = raw.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: 'include' });
  const t = await r.text();
  if (!r.ok) throw new Error(t || 'fetch failed');
  return t ? JSON.parse(t) : {};
};

// รองรับหลายโดเมนของ Google Maps + เติม output=embed ให้อัตโนมัติ
function toIframe(input?: string) {
  const v = (input || '').trim();
  if (!v) return '';

  if (/^<iframe/i.test(v)) return v;

  const isGoogleMapUrl =
    /google\.[^/]+\/maps/i.test(v) ||
    /maps\.google\./i.test(v) ||
    /maps\.app\.goo\.gl/i.test(v) ||
    /goo\.gl\/maps/i.test(v) ||
    /g\.page\//i.test(v);

  if (isGoogleMapUrl) {
    let src = v;
    if (!/\/embed/i.test(src) && !/[?&]output=embed/i.test(src)) {
      src += (src.includes('?') ? '&' : '?') + 'output=embed';
    }
    return `<iframe src="${src.replace(/"/g, '&quot;')}" width="100%" height="280" style="border:0" loading="lazy" allowfullscreen="" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }

  return '';
}

/* ---------- SweetAlert2 helpers ---------- */
const showLoading = (title: string) => {
  void Swal.fire({
    title,
    html: 'กรุณารอสักครู่…',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
};
const showSuccess = (title: string) =>
  Swal.fire({ icon: 'success', title, timer: 1300, showConfirmButton: false });
const showError = (title: string, text = 'โปรดลองใหม่อีกครั้ง') =>
  Swal.fire({ icon: 'error', title, text });
const askConfirm = (title: string, text?: string) =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#dc2626',
  });

export default function AdminContactsPage() {
  const API = getApiBase();

  // โหลดรายการทั้งหมด
  const { data, isLoading, mutate } = useSWR<{ contacts: Contact[] }>(
    `${API}/admin/contacts`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const list = useMemo<Contact[]>(() => data?.contacts || [], [data?.contacts]);

  // selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo<Contact | undefined>(
    () => list.find((c) => c.id === selectedId),
    [list, selectedId]
  );

  // form state
  const [form, setForm] = useState<Contact>({});
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [q, setQ] = useState('');

  // auto-select แถวแรกเมื่อโหลด
  useEffect(() => {
    if (!selectedId && list.length) setSelectedId(list[0].id!);
  }, [list, selectedId]);

  // sync form ตาม selection
  useEffect(() => {
    setForm(selected || {});
  }, [selected]);

  // ค้นหา
  const filtered = useMemo(
    () =>
      q.trim()
        ? list.filter((c) =>
            (c.store_name || '').toLowerCase().includes(q.trim().toLowerCase())
          )
        : list,
    [list, q]
  );

  // ตรวจว่าแก้ไขหรือไม่
  const isDirty = useMemo(() => {
    if (!selected) return false;
    return JSON.stringify(form) !== JSON.stringify(selected);
  }, [form, selected]);

  // change handlers
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    if (type === 'checkbox') {
      setForm((s) => ({ ...s, [name]: checked }));
    } else if (type === 'number') {
      setForm((s) => ({ ...s, [name]: value === '' ? undefined : Number(value) }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  // เพิ่มรายการ
  const onCreate = async () => {
    try {
      setCreating(true);
      showLoading('กำลังเพิ่มรายการ…');
      const r = await fetch(`${API}/admin/contacts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: 'ร้านใหม่',
          is_active: true,
          order_number: (list.at(-1)?.order_number ?? 0) + 1,
        }),
      });
      const t = await r.text();
      if (!r.ok) throw new Error(t);
      const j = t ? JSON.parse(t) : {};
      await mutate();
      setSelectedId(j?.contact?.id || j?.id);
      await showSuccess('เพิ่มร้านแล้ว');
    } catch (e) {
      console.error(e);
      await showError('เพิ่มไม่สำเร็จ');
    } finally {
      setCreating(false);
      Swal.close();
    }
  };

  // บันทึก
  const onSave = async () => {
    if (!form?.id) return;
    try {
      setSaving(true);
      showLoading('กำลังบันทึก…');
      const r = await fetch(`${API}/admin/contacts/${form.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const t = await r.text();
      if (!r.ok) throw new Error(t);
      await mutate();
      await showSuccess('บันทึกแล้ว');
    } catch (e) {
      console.error(e);
      await showError('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
      Swal.close();
    }
  };

  // ลบ
  const onDelete = async () => {
    if (!selected?.id) return;
    const r = await askConfirm('ลบรายการนี้หรือไม่?');
    if (!r.isConfirmed) return;

    try {
      setDeleting(true);
      showLoading('กำลังลบ…');
      const res = await fetch(`${API}/admin/contacts/${selected.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const t = await res.text();
      if (!res.ok) throw new Error(t);
      await mutate();
      setSelectedId(null);
      await showSuccess('ลบแล้ว');
    } catch (e) {
      console.error(e);
      await showError('ลบไม่สำเร็จ');
    } finally {
      setDeleting(false);
      Swal.close();
    }
  };

  const iframeHtml = useMemo(() => toIframe(form.map_iframe), [form.map_iframe]);

  return (
    <div className="space-y-6">
      {/* ดัน z-index ของ SweetAlert2 ให้ทับ UI อื่น ๆ */}
      <style jsx global>{`
        .swal2-container { z-index: 99999 !important; }
      `}</style>

      {/* Header */}
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">ติดต่อเรา (หลายร้าน)</h1>
          <p className="text-sm text-slate-400">
            เพิ่ม/ลบ/แก้ไขข้อมูลติดต่อได้มากกว่าหนึ่งร้าน
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCreate}
            disabled={creating}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            + เพิ่มร้าน
          </button>
          <button
            onClick={onSave}
            disabled={saving || !isDirty || !form?.id}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold text-white transition',
              saving || !isDirty
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600',
            ].join(' ')}
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar รายการร้าน */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาร้าน…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-slate-500">กำลังโหลด…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-slate-500">ไม่มีรายการ</div>
            ) : (
              <ul className="max-h-[70vh] overflow-auto divide-y divide-slate-100">
                {filtered.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelectedId(c.id!)}
                        className={[
                          'w-full text-left px-3 py-2',
                          active ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <div className="font-medium truncate text-slate-900">
                          {c.store_name || '— ไม่มีชื่อ —'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {c.phone || '—'} · {c.email || '—'}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            onClick={onDelete}
            disabled={!selected || deleting}
            className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            ลบรายการที่เลือก
          </button>
        </aside>

        {/* ฟอร์มแก้ไข */}
        <section className="lg:col-span-8 xl:col-span-9">
          {selected ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* คอลัมน์ซ้าย 2 ช่อง */}
              <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      ชื่อร้าน
                    </label>
                    <input
                      name="store_name"
                      value={form.store_name || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="เช่น ร้านคุณจี๊ด"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      name="phone"
                      value={form.phone || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="02-xxx-xxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      Facebook Page URL
                    </label>
                    <input
                      name="facebook"
                      value={form.facebook || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="https://www.facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      Messenger Link
                    </label>
                    <input
                      name="messenger"
                      value={form.messenger || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="https://m.me/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      LINE (ID หรือ Link)
                    </label>
                    <input
                      name="line"
                      value={form.line || ''}
                      onChange={onChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="line://ti/p/~your-id หรือ https://page.line.me/xxxx"
                    />
                  </div>
                </div>

                {/* ที่อยู่ + แผนที่ */}
                <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      ที่อยู่
                    </label>
                    <textarea
                      name="address"
                      value={form.address || ''}
                      onChange={onChange}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 placeholder-slate-500"
                      placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900">
                      Google Maps (วาง &lt;iframe&gt; หรือ URL)
                    </label>
                    <textarea
                      name="map_iframe"
                      value={form.map_iframe || ''}
                      onChange={onChange}
                      rows={5}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs bg-white text-slate-800 placeholder-slate-500"
                      placeholder='<iframe src="..."></iframe> หรือ https://www.google.com/maps/...'
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      ใส่ URL ของ Google Maps ได้ ระบบจะสร้าง iframe ให้อัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ขวา: สถานะ/ลำดับ + พรีวิว */}
              <aside className="xl:col-span-1 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-900 font-semibold mb-3">การแสดงผล</div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-900 whitespace-nowrap">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={!!form.is_active}
                        onChange={onChange}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      แสดงบนหน้าเว็บ
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <label htmlFor="order_number" className="text-sm text-slate-900 whitespace-nowrap">
                        ลำดับ
                      </label>
                      <input
                        id="order_number"
                        type="number"
                        name="order_number"
                        min={1}
                        step={1}
                        value={form.order_number ?? 1}
                        onChange={(e) => {
                          const n = e.target.value === '' ? 1 : Math.max(1, Math.floor(Number(e.target.value)));
                          setForm((s) => ({ ...s, order_number: n }));
                        }}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-slate-900 font-medium text-right bg-white focus:ring-2 focus:ring-amber-300"
                        title="เลขลำดับเริ่มที่ 1; ถ้าไปชนกับรายการอื่น ระบบจะสลับให้อัตโนมัติ"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold mb-2 text-slate-900">พรีวิวสรุป</div>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-slate-600">ชื่อร้าน:</span> <span className="text-slate-900 font-medium">{form.store_name || '—'}</span></div>
                    <div><span className="text-slate-600">โทร:</span> <span className="text-slate-900 font-medium">{form.phone || '—'}</span></div>
                    <div><span className="text-slate-600">อีเมล:</span> <span className="text-slate-900 font-medium">{form.email || '—'}</span></div>
                    <div className="truncate"><span className="text-slate-600">Facebook:</span> <span className="text-slate-900 font-medium">{form.facebook || '—'}</span></div>
                    <div className="truncate"><span className="text-slate-600">Messenger:</span> <span className="text-slate-900 font-medium">{form.messenger || '—'}</span></div>
                    <div className="truncate"><span className="text-slate-600">LINE:</span> <span className="text-slate-900 font-medium">{form.line || '—'}</span></div>
                  </div>
                  <div className="mt-3 text-sm">
                    <div className="text-slate-600 mb-1">ที่อยู่:</div>
                    <div className="whitespace-pre-wrap text-slate-900 font-medium">{form.address || '—'}</div>
                  </div>
                </div>

                
              </aside>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              ยังไม่ได้เลือกข้อมูลติดต่อ โปรดเพิ่มหรือเลือกรายการทางซ้าย
            </div>
          )}
        </section>
      </div>
    </div>
  );
}