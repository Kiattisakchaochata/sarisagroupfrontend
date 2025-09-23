// src/app/admin/seo/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';

export default function AdminSeoIndexPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-6xl px-4 md:px-6 py-10 text-white">กำลังโหลด…</div>}>
      <main className="container mx-auto max-w-6xl px-4 md:px-6 py-10 text-white space-y-8">
        <h1 className="text-3xl font-semibold">จัดการ SEO</h1>

        <div className="grid gap-6">
          {/* Global SEO */}
          <Link
            href="/admin/seo/site"
            className="block rounded-2xl border border-white/10 bg-[#111418] hover:bg-white/5 transition p-6"
          >
            <div className="text-xl font-semibold">Global SEO</div>
            <div className="text-sm text-gray-300 mt-2">
              ตั้งค่า Title/Description/OG/JSON-LD ทั้งเว็บไซต์
            </div>
          </Link>

          {/* Page SEO (รายหน้า) */}
          <Link
            href="/admin/seo/pages"
            className="block rounded-2xl border border-white/10 bg-[#111418] hover:bg-white/5 transition p-6"
          >
            <div className="text-xl font-semibold">Page SEO</div>
            <div className="text-sm text-gray-300 mt-2">
              ตั้งค่า SEO รายหน้า (path) และอัปโหลด OG ได้สูงสุด 4 รูป
            </div>
          </Link>
        </div>
      </main>
    </Suspense>
  );
}