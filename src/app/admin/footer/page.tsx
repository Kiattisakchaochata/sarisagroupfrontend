'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import 'sweetalert2/dist/sweetalert2.min.css';

type FooterLink = { label: string; href: string };
type Socials = { facebook?: string; instagram?: string; tiktok?: string; line?: string; youtube?: string };
type FooterLocation = { label: string; href: string };   // พิกัดร้าน (Google Maps)
type FooterHour = { label: string; time: string };       // เวลาเปิด–ปิด

type FooterDto = {
  about_text?: string;
  address?: string;
  phone?: string;
  email?: string;
  socials?: Socials;
  links?: FooterLink[];
  locations?: FooterLocation[];
  hours?: FooterHour[];
};

export default function AdminFooterPage() {
  const { data, mutate, isLoading } = useSWR<{ footer: FooterDto }>(
    '/admin/footer',
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false }
  );

  const [saving, setSaving] = useState(false);

  const f = useMemo<FooterDto>(() => {
    const ft = data?.footer ?? {};
    return {
      about_text: ft.about_text ?? '',
      address: ft.address ?? '',
      phone: ft.phone ?? '',
      email: ft.email ?? '',
      socials: {
        facebook: ft.socials?.facebook ?? '',
        instagram: ft.socials?.instagram ?? '',
        tiktok: ft.socials?.tiktok ?? '',
        line: ft.socials?.line ?? '',
        youtube: ft.socials?.youtube ?? '',
      },
      links: Array.isArray(ft.links) ? ft.links : [],
      locations: Array.isArray(ft.locations) ? ft.locations : [],
      hours: Array.isArray(ft.hours) ? ft.hours : [],
    };
  }, [data]);

  const [form, setForm] = useState<FooterDto>(f);
  // sync กับข้อมูลโหลดเสร็จ
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(
    () => setForm(f),
    [
      f.about_text,
      f.address,
      f.phone,
      f.email,
      JSON.stringify(f.socials),
      JSON.stringify(f.links),
      JSON.stringify(f.locations),
      JSON.stringify(f.hours),
    ]
  );

  const onChange = (patch: Partial<FooterDto>) => setForm((s) => ({ ...s, ...patch }));
  const onSoc = (k: keyof Socials, v: string) =>
    setForm((s) => ({ ...s, socials: { ...(s.socials ?? {}), [k]: v } }));

  // links
  const setLink = (idx: number, key: 'label' | 'href', v: string) =>
    setForm((s) => {
      const next = [...(s.links ?? [])];
      next[idx] = { ...(next[idx] ?? { label: '', href: '' }), [key]: v };
      return { ...s, links: next };
    });
  const addLink = () => setForm((s) => ({ ...s, links: [...(s.links ?? []), { label: '', href: '' }] }));
  const rmLink = (idx: number) => setForm((s) => ({ ...s, links: (s.links ?? []).filter((_, i) => i !== idx) }));

  // locations
  const setLocation = (idx: number, key: 'label' | 'href', v: string) =>
    setForm((s) => {
      const next = [...(s.locations ?? [])];
      next[idx] = { ...(next[idx] ?? { label: '', href: '' }), [key]: v };
      return { ...s, locations: next };
    });
  const addLocation = () => setForm((s) => ({ ...s, locations: [...(s.locations ?? []), { label: '', href: '' }] }));
  const rmLocation = (idx: number) => setForm((s) => ({ ...s, locations: (s.locations ?? []).filter((_, i) => i !== idx) }));

  // hours
  const setHour = (idx: number, key: 'label' | 'time', v: string) =>
    setForm((s) => {
      const next = [...(s.hours ?? [])];
      next[idx] = { ...(next[idx] ?? { label: '', time: '' }), [key]: v };
      return { ...s, hours: next };
    });
  const addHour = () => setForm((s) => ({ ...s, hours: [...(s.hours ?? []), { label: '', time: '' }] }));
  const rmHour = (idx: number) => setForm((s) => ({ ...s, hours: (s.hours ?? []).filter((_, i) => i !== idx) }));

  const canSave = useMemo(() => !saving, [saving]);

  const save = async () => {
  if (saving) return;

  setSaving(true);

  // แสดงโหลด (ไม่ await)
  Swal.fire({
    title: 'กำลังบันทึก…',
    text: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await apiFetch('/admin/footer', { method: 'PATCH', body: form });
    await mutate();

    // ปิดโหลดก่อน แล้วค่อยโชว์ success
    Swal.close();
    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ!',
      text: 'บันทึกฟุตเตอร์เรียบร้อยแล้ว',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#4F46E5',
      timer: 1800,
      timerProgressBar: true,
    });
  } catch (err) {
    // ปิดโหลดก่อน แล้วค่อยโชว์ error
    Swal.close();
    await Swal.fire({
      icon: 'error',
      title: 'บันทึกไม่สำเร็จ',
      text: 'ลองใหม่อีกครั้งหรือตรวจสอบการเชื่อมต่อ',
      confirmButtonText: 'ปิด',
    });
    console.error('Save footer error:', err);
  } finally {
    setSaving(false);
  }
};

  if (isLoading && !data) {
    return <div className="text-sm text-slate-300">กำลังโหลด…</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">ตั้งค่า Footer</h1>
        <p className="text-sm text-gray-400">จัดการข้อมูลฟุตเตอร์ที่จะไปแสดงในหน้าแรก</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 space-y-5">
        {/* About */}
        <div>
          <label className="block text-sm mb-1">About (ข้อความสั้นๆ)</label>
          <textarea
            value={form.about_text ?? ''}
            onChange={(e) => onChange({ about_text: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            rows={3}
            placeholder="ทำธุรกิจเพื่อชุมชนอย่างยั่งยืน – ขาดทุนไม่ว่า เสียชื่อไม่ได้"
          />
        </div>

        {/* Address/Phone/Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">ที่อยู่</label>
            <input
              value={form.address ?? ''}
              onChange={(e) => onChange({ address: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">เบอร์โทร</label>
            <input
              value={form.phone ?? ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">อีเมล</label>
            <input
              value={form.email ?? ''}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
            />
          </div>
        </div>

        {/* Socials */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Facebook</label>
            <input value={form.socials?.facebook ?? ''} onChange={(e) => onSoc('facebook', e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Instagram</label>
            <input value={form.socials?.instagram ?? ''} onChange={(e) => onSoc('instagram', e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">TikTok</label>
            <input value={form.socials?.tiktok ?? ''} onChange={(e) => onSoc('tiktok', e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">LINE</label>
            <input value={form.socials?.line ?? ''} onChange={(e) => onSoc('line', e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">YouTube</label>
            <input value={form.socials?.youtube ?? ''} onChange={(e) => onSoc('youtube', e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none" />
          </div>
        </div>

        {/* Footer links */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm">ลิงก์ฟุตเตอร์</label>
            <button type="button" onClick={addLink} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm">+ เพิ่มลิงก์</button>
          </div>
          <div className="mt-2 space-y-2">
            {(form.links ?? []).map((lnk, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  placeholder="label"
                  value={lnk.label}
                  onChange={(e) => setLink(i, 'label', e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                />
                <input
                  placeholder="https://…"
                  value={lnk.href}
                  onChange={(e) => setLink(i, 'href', e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                />
                <button type="button" onClick={() => rmLink(i)} className="rounded-lg bg-red-600/80 hover:bg-red-700 px-3 py-2 text-sm">ลบ</button>
              </div>
            ))}
          </div>
        </div>

        {/* Locations & Hours */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Locations */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm">พิกัดร้าน (Google Maps)</label>
              <button type="button" onClick={addLocation} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm">+ เพิ่มพิกัด</button>
            </div>
            <div className="mt-2 space-y-2">
              {(form.locations ?? []).map((loc, i) => (
                <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    placeholder="เช่น 🍜 ร้านอาหาร"
                    value={loc.label}
                    onChange={(e) => setLocation(i, 'label', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                  <input
                    placeholder="https://maps.google.com/…"
                    value={loc.href}
                    onChange={(e) => setLocation(i, 'href', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                  <button type="button" onClick={() => rmLocation(i)} className="rounded-lg bg-red-600/80 hover:bg-red-700 px-3 py-2 text-sm">ลบ</button>
                </div>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm">เวลาเปิด–ปิด</label>
              <button type="button" onClick={addHour} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm">+ เพิ่มเวลา</button>
            </div>
            <div className="mt-2 space-y-2">
              {(form.hours ?? []).map((h, i) => (
                <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    placeholder="เช่น ร้าน สาริชา คาเฟ่ / 🚗 คาร์แคร์"
                    value={h.label}
                    onChange={(e) => setHour(i, 'label', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                  <input
                    placeholder="เช่น 09.00น. - 20.00น."
                    value={h.time}
                    onChange={(e) => setHour(i, 'time', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                  <button type="button" onClick={() => rmHour(i)} className="rounded-lg bg-red-600/80 hover:bg-red-700 px-3 py-2 text-sm">ลบ</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className={`rounded-lg px-4 py-2 text-sm ${canSave ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white/10 opacity-60'}`}
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </section>
    </div>
  );
}