// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // TODO: call your API here
      // await fetch('/api/auth/register', { method:'POST', body: JSON.stringify({ name, email, password }) })
      alert('สมัครสมาชิกสำเร็จ (ตัวอย่าง)'); // ลบได้เมื่อเชื่อม API จริง
    } catch {
      setError('สมัครไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">สมัครสมาชิก</h1>
      <p className="text-gray-600 mb-6">สร้างบัญชีเพื่อเริ่มต้นใช้งาน</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm text-gray-700">ชื่อ</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="ชื่อของคุณ"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-gray-700">อีเมล</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm text-gray-700">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full px-4 py-2.5 bg-black text-white font-medium hover:bg-black/90 disabled:opacity-60"
        >
          {submitting ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
        </button>

        <div className="text-sm text-gray-600 text-center">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="underline hover:no-underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </form>
    </main>
  );
}