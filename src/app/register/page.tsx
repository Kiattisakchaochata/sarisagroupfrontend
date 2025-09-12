'use client';

import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-[70vh] py-10 md:py-14">
      <div className="mx-auto max-w-4xl px-4">
        {/* back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          กลับหน้าหลัก
        </Link>

        <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">
          ลงทะเบียน
        </h1>

        {/* card */}
        <div className="mt-6 rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-6 md:p-8 shadow-sm">
          <RegisterForm />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          การสมัครหมายถึงคุณยอมรับนโยบายความเป็นส่วนตัวของเรา
        </p>
      </div>
    </main>
  );
}