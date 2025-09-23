// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchInline from '@/components/SearchInline';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/videos/reviews', label: 'วิดีโอ' },   // ✅ ชี้ไปที่ reviews
  { href: '/contact', label: 'ติดต่อเรา' },
];

// อักษรย่อจากชื่อ
function getInitial(name?: string | null) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function Navbar() {
  const [open, setOpen] = useState(false);            // mobile menu
  const [atTop, setAtTop] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);    // dropdown โปรไฟล์
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // ปิด dropdown เมื่อเปลี่ยนเส้นทาง
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setAtTop(window.scrollY < 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ปิด dropdown เมื่อคลิกนอกกรอบ
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  // ปุ่มคีย์บอร์ด
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
      if (e.key === 'Enter' && document.activeElement === profileBtnRef.current) {
        setMenuOpen((s) => !s);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      setMenuOpen(false);
      router.push('/');
    } catch {}
  };

  // ปุ่มขวา (desktop)
  const RightActions = () => {
    if (!mounted || isLoading) {
      return <div className="h-11 md:h-12 w-[140px] rounded-full bg-black/5 animate-pulse" />;
    }

    if (user) {
      const initial = getInitial(user?.name);
      return (
        <div className="relative" ref={menuRef}>
          <button
  ref={profileBtnRef}
  onClick={() => setMenuOpen((s) => !s)}
  className={[
    'group inline-flex items-center gap-3 rounded-full pl-1 pr-3 py-1.5',
    // ปรับให้ปุ่มทึบขึ้นเล็กน้อย
    'bg-white shadow-sm ring-1 ring-amber-100 transition',
    'hover:bg-amber-50/60 hover:ring-amber-200 hover:shadow-md',
    'focus:outline-none focus:ring-2 focus:ring-amber-300',
  ].join(' ')}
  aria-haspopup="menu"
  aria-expanded={menuOpen}
>
  <span
    className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-amber-500 to-amber-600
               text-white font-semibold shadow-sm"
  >
    {initial}
  </span>
  <span className="text-sm text-slate-700 group-hover:text-slate-900">
    {user?.name || 'โปรไฟล์'}
  </span>
  <svg
    width="18" height="18" viewBox="0 0 24 24"
    className={`text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
    fill="none"
  >
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-1.5 z-50"
            >
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <div className="text-[13px] text-slate-500">เข้าสู่ระบบเป็น</div>
                <div className="truncate font-semibold text-slate-800">{user?.email}</div>
              </div>

              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block w-full rounded-xl px-3.5 py-2 text-sm text-slate-700 
                           hover:bg-gradient-to-r hover:from-indigo-50 hover:via-rose-50 hover:to-emerald-50"
              >
                ดูโปรไฟล์
              </Link>

              {/* 👇 ลิงก์ Admin ใน dropdown (เผื่ออยากเข้าทางนี้ด้วย) */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="mt-0.5 block w-full rounded-xl px-3.5 py-2 text-left text-sm text-indigo-700 hover:bg-indigo-50"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="mt-0.5 block w-full rounded-xl px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      );
    }

    // ยังไม่ล็อกอิน → ปุ่มเข้าสู่ระบบ
    return (
      <Link
        href="/login"
        className={[
          'inline-flex h-11 md:h-12 items-center justify-center rounded-full px-5',
          'bg-gradient-to-b from-amber-400 to-amber-500 text-white font-semibold',
          'shadow-[0_6px_16px_rgba(251,191,36,0.35)]',
          'hover:shadow-[0_10px_24px_rgba(251,191,36,0.45)]',
          'hover:from-amber-500 hover:to-amber-600',
          'active:from-amber-600 active:to-amber-700',
          'transition-all whitespace-nowrap',
        ].join(' ')}
      >
        เข้าสู่ระบบ
      </Link>
    );
  };

  // ปุ่มในเมนูมือถือ
  const MobileAuth = () => {
    if (!mounted || isLoading) return <div className="h-11 rounded-full bg-black/5 animate-pulse" />;

    if (user) {
      const initial = getInitial(user?.name);
      return (
        <>
          <div className="flex items-center gap-3 px-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 text-white font-semibold">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800">{user?.name}</div>
              <div className="truncate text-sm text-slate-500">{user?.email}</div>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl px-3 py-2 text-[15px] text-slate-800 hover:bg-black/5 text-center"
          >
            ดูโปรไฟล์
          </Link>

          {/* 👇 ลิงก์ Admin ในเมนูมือถือ */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-[15px] text-indigo-700 hover:bg-indigo-50 text-center"
            >
              Admin
            </Link>
          )}

          <button
            onClick={handleLogout}
            className={[
              'inline-flex w-full h-11 items-center justify-center rounded-full px-5',
              'bg-gradient-to-b from-amber-400 to-amber-500 text-white font-semibold',
              'shadow-[0_6px_16px_rgba(251,191,36,0.35)]',
              'hover:shadow-[0_10px_24px_rgba(251,191,36,0.45)]',
              'hover:from-amber-500 hover:to-amber-600',
              'active:from-amber-600 active:to-amber-700',
              'transition-all mt-1',
            ].join(' ')}
          >
            ออกจากระบบ
          </button>
        </>
      );
    }

    return (
      <Link
        href="/login"
        onClick={() => setOpen(false)}
        className={[
          'inline-flex w-full h-11 items-center justify-center rounded-full px-5',
          'bg-gradient-to-b from-amber-400 to-amber-500 text-white font-semibold',
          'shadow-[0_6px_16px_rgba(251,191,36,0.35)]',
          'hover:shadow-[0_10px_24px_rgba(251,191,36,0.45)]',
          'hover:from-amber-500 hover:to-amber-600',
          'active:from-amber-600 active:to-amber-700',
          'transition-all',
        ].join(' ')}
      >
        เข้าสู่ระบบ
      </Link>
    );
  };

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-all',
        atTop ? '' : 'border-b border-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]',
      ].join(' ')}
    >
      <div className="bg-gradient-to-b from-[#fffdfa]/90 to-[#faf6ef]/80 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center gap-3 py-3">
            {/* Brand */}
            <Link
              href="/"
              className="font-semibold tracking-tight text-slate-900 whitespace-nowrap mr-2 md:mr-4"
            >
              <span className="text-lg md:text-xl">Sarisagroup</span>
            </Link>

            {/* Center links (desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group relative rounded-full px-4 py-2 text-[15px] font-medium text-slate-600 transition-all
                             hover:text-slate-900 hover:-translate-y-[1px]
                             hover:bg-gradient-to-r hover:from-indigo-50 hover:via-rose-50 hover:to-emerald-50
                             hover:ring-1 hover:ring-indigo-200/60 hover:shadow-[0_6px_18px_rgba(79,70,229,0.14)]"
                >
                  {l.label}
                </Link>
              ))}

              {/* 👇 ลิงก์ Admin (desktop) */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="group relative rounded-full px-4 py-2 text-[15px] font-medium text-indigo-700 transition-all
                             hover:text-indigo-900 hover:-translate-y-[1px]
                             hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-200/60"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right actions (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <SearchInline className="h-11 md:h-12 min-w-[260px] w-[28vw] max-w-[420px]" />
              <RightActions />
            </div>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-label="เปิดเมนู"
              className="ml-auto inline-flex items-center justify-center rounded-lg p-2 md:hidden hover:bg-black/5"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden border-t border-black/5 py-3">
              <div className="py-2">
                <SearchInline className="h-11 w-full" />
              </div>

              <div className="flex flex-col gap-1 py-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-[15px] text-slate-800
                               hover:bg-gradient-to-r hover:from-indigo-50 hover:to-emerald-50 transition"
                  >
                    {l.label}
                  </Link>
                ))}

                {/* 👇 ลิงก์ Admin (mobile) */}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-[15px] text-indigo-700 hover:bg-indigo-50 transition"
                  >
                    Admin
                  </Link>
                )}
              </div>

              <div className="py-2 flex flex-col gap-2">
                <MobileAuth />
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}