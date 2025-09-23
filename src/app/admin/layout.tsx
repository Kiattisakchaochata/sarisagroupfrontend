// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminGate from '@/components/guards/AdminGate';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Admin | Sarisagroup', template: '%s | Admin · Sarisagroup' },
  robots: {
    index: false, follow: false, nocache: true, noimageindex: true,
    googleBot: { index: false, follow: false, noimageindex: true, noarchive: true, nosnippet: true },
  },
  alternates: { canonical: '/admin' },
  openGraph: { title: 'Admin | Sarisagroup', siteName: 'Sarisagroup', url: `${siteUrl}/admin`, type: 'website' },
  twitter: { card: 'summary', title: 'Admin | Sarisagroup' },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-6xl px-4 md:px-6 py-10 text-white">กำลังโหลด…</div>}>
      <AdminGate>
        <AdminShell>
          {children}
        </AdminShell>
      </AdminGate>
    </Suspense>
  );
}