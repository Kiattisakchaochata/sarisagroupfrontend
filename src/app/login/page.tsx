// src/app/login/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto max-w-md px-4 py-10">
          <h1 className="text-2xl font-semibold mb-6">เข้าสู่ระบบ</h1>
          <div>กำลังโหลด…</div>
        </main>
      }
    >
      <main className="container mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">เข้าสู่ระบบ</h1>
        <LoginForm />
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <p>
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline">
              ลงทะเบียน
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </main>
    </Suspense>
  );
}