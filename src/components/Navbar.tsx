'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/videos', label: 'วิดีโอ' },
  { href: '/contact', label: 'ติดต่อเรา' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full border-b transition-all',
        atTop ? 'border-transparent' : 'border-black/5',
      ].join(' ')}
    >
      <div className="backdrop-blur-xl bg-white/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Brand */}
          <Link href="/" className="font-semibold tracking-tight text-gray-900">
            <span className="text-lg md:text-xl">Sarisagroup</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[15px] text-gray-700 hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/search" className="btn-ghost-pill">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-2"
              >
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ค้นหา
            </Link>
            <Link href="/join" className="btn-primary-pill">
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="เปิดเมนู"
            className="inline-flex items-center justify-center rounded-lg p-2 md:hidden hover:bg-black/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-black/5 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
              <div className="flex flex-col gap-1 py-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-[15px] text-gray-800 hover:bg-black/5"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 py-2">
                <Link href="/search" onClick={() => setOpen(false)} className="btn-ghost-pill w-full justify-center">
                  ค้นหา
                </Link>
                <Link href="/join" onClick={() => setOpen(false)} className="btn-primary-pill w-full justify-center">
                  ร่วมเครือข่าย
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}