// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ✅ เพิ่ม state คุมการเปิด/ปิดรหัส
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    setOk(null);
    setErr(null);

    const oldTrim = oldPw.trim();
    const newTrim = newPw.trim();

    if (newTrim.length < 8) {
      setErr('รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877'}/api/auth/change-password`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword: oldTrim, newPassword: newTrim }),
        }
      );

      const text = await res.text();

      if (!res.ok) {
        let msg = '';
        try {
          const j = text ? JSON.parse(text) : {};
          msg = String(j.message || '');
        } catch {
          msg = text;
        }

        msg = msg
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();

        if (/old.*(wrong|invalid)|รหัสผ่านเดิม/i.test(msg)) {
          msg = 'รหัสผ่านเดิมไม่ถูกต้อง';
        }
        if (!msg) msg = 'เปลี่ยนรหัสผ่านไม่สำเร็จ';

        throw new Error(msg);
      }

      setOk('เปลี่ยนรหัสผ่านเรียบร้อย');
      setOldPw('');
      setNewPw('');
    } catch (e) {
      const raw = (e as Error)?.message || '';
      const pretty =
        raw
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim() || 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
      setErr(pretty);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">โปรไฟล์</h2>
        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <div><span className="font-medium">ชื่อ: </span>{user?.name || '-'}</div>
          <div><span className="font-medium">อีเมล: </span>{user?.email || '-'}</div>
          <div><span className="font-medium">สิทธิ์: </span>{user?.role || '-'}</div>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">เปลี่ยนรหัสผ่าน</h3>

        {ok && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-800">
            {ok}
          </div>
        )}
        {err && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-800">
            {err}
          </div>
        )}

        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่านเดิม</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-200"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showOld ? 'ซ่อนรหัสผ่านเดิม' : 'แสดงรหัสผ่านเดิม'}
                title={showOld ? 'ซ่อน' : 'แสดง'}
              >
                {showOld ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-200"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showNew ? 'ซ่อนรหัสผ่านใหม่' : 'แสดงรหัสผ่านใหม่'}
                title={showNew ? 'ซ่อน' : 'แสดง'}
              >
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">อย่างน้อย 8 ตัวอักษร</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 font-semibold text-white shadow hover:from-amber-500 hover:to-amber-600 disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก…' : 'บันทึก'}
            </button>

            <Link
              href="/"
              className="rounded-full bg-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-300 transition"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}