// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // ตรวจรูปแบบอีเมลแบบเบา ๆ
  const isEmailValid = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  function cleanErrorMessage(input: string): string {
    // เอาเฉพาะบรรทัดแรก กัน stack trace
    let msg = String(input || '').split('\n')[0];

    // ล้าง HTML/nbsp/พาธไฟล์/ช่องว่างซ้ำ และนำหน้า "Error:"
    msg = msg
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/file:\/\/\/.*?\)/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^Error:\s*/i, '')
      .trim();

    const m = msg.toLowerCase();

    // ----- mapping รายกรณี -----
    if (/unauthorized|401/.test(m)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';

    // อีเมลไม่ถูกต้อง (ไทย/อังกฤษ)
    if (/(email|อีเมล).*(invalid|ไม่ถูกต้อง|ผิดรูปแบบ)/i.test(msg)) {
      return 'อีเมลไม่ถูกต้อง';
    }

    // รหัสผ่านไม่ถูกต้อง (ไทย/อังกฤษ)
    if (
      /(password|รหัสผ่าน)/i.test(msg) &&
      /(invalid|incorrect|wrong|ผิด|ไม่ถูก)/i.test(msg)
    ) {
      return 'รหัสผ่านไม่ถูกต้อง';
    }

    // credential ผิดแบบรวม ๆ
    if (/invalid\s+credentials|email.*password.*(incorrect|invalid)/i.test(m)) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }

    // ไม่พบบัญชีผู้ใช้
    if (/(user|account|email).*(not.*found|ไม่มี|ไม่พบ)/i.test(m)) {
      return 'ไม่พบบัญชีผู้ใช้';
    }

    // ข้อความกำกวมที่มักจะมาจาก 400
    if (/bad request|invalid request/i.test(m)) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }

    // เน็ต/เซิร์ฟเวอร์ล่ม
    if (/failed to fetch|network|ecconn|timeout/i.test(m)) {
      return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบ Backend';
    }

    return msg || 'เข้าสู่ระบบไม่สำเร็จ';
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // ✅ ตรวจอีเมลก่อนยิง API
    if (!isEmailValid(email)) {
      error('อีเมลไม่ถูกต้อง');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      success('เข้าสู่ระบบสำเร็จ');
      setTimeout(() => {
        router.replace('/');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      let pretty = cleanErrorMessage(raw);

      // ✅ ถ้าแบ็กเอนด์ตอบกำกวม ให้เดาตามอินพุตผู้ใช้
      if (
        pretty === 'เข้าสู่ระบบไม่สำเร็จ' ||
        pretty === 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      ) {
        // อีเมลถูกรูปแบบแล้ว → มักเป็นรหัสผ่านที่ผิด
        pretty = isEmailValid(email) ? 'รหัสผ่านไม่ถูกต้อง' : 'อีเมลไม่ถูกต้อง';
      }

      error(pretty);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">อีเมล</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 font-semibold text-white shadow hover:from-amber-500 hover:to-amber-600 disabled:opacity-60"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}