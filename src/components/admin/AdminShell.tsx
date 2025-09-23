'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { ReactNode, useMemo, useState, useEffect, useRef } from 'react';

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { success, error } = useToast();

  // รายการเมนู
  const NAV = useMemo(
    () => [
      { href: '/admin',                         label: 'Dashboard', match: (p: string) => p === '/admin' },
      { href: '/admin/stores',                  label: 'Stores',    match: (p: string) => p.startsWith('/admin/stores') },
      { href: '/admin/homepage/missions',       label: 'Missions',  match: (p: string) => p.startsWith('/admin/homepage/missions') },
      { href: '/admin/homepage/featured',       label: 'Featured',  match: (p: string) => p.startsWith('/admin/homepage/featured') },
      { href: '/admin/homepage/logos',          label: 'Logos',     match: (p: string) => p.startsWith('/admin/homepage/logos') },
      { href: '/admin/videos',                  label: 'Videos',    match: (p: string) => p.startsWith('/admin/videos') },
      { href: '/admin/events',                  label: 'Events',    match: (p: string) => p.startsWith('/admin/events') },
      { href: '/admin/seo',                     label: 'SEO',       match: (p: string) => p.startsWith('/admin/seo') },
      { href: '/admin/footer',                  label: 'Footer',    match: (p: string) => p.startsWith('/admin/footer') },
      { href: '/admin/tracking',                label: 'Tracking',  match: (p: string) => p.startsWith('/admin/tracking') },
      { href: '/admin/contact', label: 'Contact', match: (p: string) => p.startsWith('/admin/contact') },
    ],
    []
  );

  // mobile
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open || !menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onLogout = async () => {
    const to = '/';
    try {
      await logout();
      success('ออกจากระบบสำเร็จ');
    } catch {
      error('ออกจากระบบไม่สำเร็จ แต่จะพากลับหน้าแรกให้');
    } finally {
      try { localStorage.removeItem('sg_token'); } catch {}
      router.replace(to);
      router.refresh();
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== to) {
          window.location.href = to;
        }
      }, 120);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1623] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b1220]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b1220]/60">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="flex h-14 items-center gap-2">
            {/* ไม่มีโลโก้/ชื่อ Panel เพื่อความกะทัดรัด */}

            {/* Desktop nav */}
            <nav className="hidden md:flex flex-1 items-center gap-1 overflow-x-auto">
              {NAV.map((item) => {
                const active = item.match(pathname || '');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={active}
                    className={[
                      'relative group rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                      'text-slate-300 hover:text-white hover:bg-white/5',
                      'data-[active=true]:text-white data-[active=true]:bg-white/10',
                      // เส้นชี้ active ด้านล่าง
                      'after:absolute after:left-2 after:right-2 after:-bottom-[10px] after:h-[2px] after:rounded-full after:bg-white/50 after:opacity-0 data-[active=true]:after:opacity-100',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* ปุ่ม Logout (desktop) */}
            <button
              type="button"
              onClick={onLogout}
              className="ml-auto hidden md:inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700 shadow-sm"
            >
              ออกจากระบบ
            </button>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              aria-label="เปิดเมนู"
              className="ml-auto md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10"
              onClick={() => setOpen((s) => !s)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div ref={menuRef} className="md:hidden border-t border-white/10">
            <nav className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-2 flex flex-col">
              <div className="flex flex-wrap gap-1 py-1">
                {NAV.map((item) => {
                  const active = item.match(pathname || '');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={active}
                      className={[
                        'rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
                        'text-slate-200 hover:text-white hover:bg-white/5',
                        'data-[active=true]:text-white data-[active=true]:bg-white/10',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
              >
                ออกจากระบบ
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-8">{children}</main>
    </div>
  );
}