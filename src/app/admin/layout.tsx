// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Sarisagroup',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
      {children}
    </section>
  );
}