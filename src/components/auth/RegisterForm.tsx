'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      setLoading(true);
      await register(name, email, password);

      await Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ!',
        text: 'กรุณาเข้าสู่ระบบ',
        confirmButtonText: 'ไปเข้าสู่ระบบ',
        confirmButtonColor: '#f59e0b',
      });

      router.push('/login');
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : '';
      // แปลข้อความ error ให้เป็นภาษาไทยที่เข้าใจง่าย
      let msg = 'สมัครสมาชิกไม่สำเร็จ';
      if (/อีเมล/.test(rawMsg) || /email/i.test(rawMsg)) {
        msg = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (/Failed to fetch|NetworkError|ERR_CONNECTION/i.test(rawMsg)) {
        msg = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการรัน Backend (พอร์ต 8877)';
      } else if (rawMsg) {
        msg = rawMsg;
      }

      await Swal.fire({
        icon: 'error',
        title: 'สมัครสมาชิกไม่สำเร็จ',
        text: msg,
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-2xl mx-auto
        bg-white/95 backdrop-blur
        p-8 md:p-10 rounded-2xl
        shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        space-y-6
      "
      autoComplete="off"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">ลงทะเบียน</h2>
        <p className="text-slate-600 text-sm md:text-base">
          สร้างบัญชีเพื่อร่วมรีวิวและให้ดาวร้านในเครือของเรา
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-700 mb-1">ชื่อ-นามสกุล</label>
          <input
            type="text"
            name="name"
            required
            placeholder="ชื่อ-นามสกุล"
            className="
              w-full rounded-xl border border-slate-200 px-4 py-3
              bg-white
              focus:outline-none focus:ring-2 focus:ring-amber-400
            "
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1">อีเมล</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="
              w-full rounded-xl border border-slate-200 px-4 py-3
              bg-white
              focus:outline-none focus:ring-2 focus:ring-amber-400
            "
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1">รหัสผ่าน</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            className="
              w-full rounded-xl border border-slate-200 px-4 py-3
              bg-white
              focus:outline-none focus:ring-2 focus:ring-amber-400
            "
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-slate-500">อย่างน้อย 8 ตัวอักษร</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-xl
          bg-gradient-to-r from-amber-400 to-amber-500
          text-white font-semibold
          shadow-[0_10px_20px_rgba(245,158,11,0.35)]
          hover:from-amber-500 hover:to-amber-600
          active:from-amber-600 active:to-amber-700
          transition disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading ? 'กำลังสมัคร...' : 'สร้างบัญชี'}
      </button>

      <p className="text-center text-sm text-slate-600">
        มีบัญชีอยู่แล้ว?{' '}
        <a href="/login" className="text-amber-600 font-semibold hover:underline">
          เข้าสู่ระบบ
        </a>
      </p>
    </form>
  );
}