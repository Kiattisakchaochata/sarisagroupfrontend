'use client'

import Link from 'next/link'
import React from 'react'

/* ========= Brand Social SVG (minimal, crisp) ========= */
const Btn = ({
  href,
  label,
  children,
  className = '',
}: React.PropsWithChildren<{ href: string; label: string; className?: string }>) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className={[
      'inline-flex h-10 w-10 items-center justify-center rounded-full border',
      'border-slate-200 bg-white text-slate-600 shadow-sm transition',
      'hover:shadow hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70',
      className,
    ].join(' ')}
  >
    {children}
  </a>
)

const FbIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 320 512" width="18" height="18" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M279.1 288 293.3 195.3h-88.9V135.2c0-25.3 12.4-50.1 52.2-50.1H295V6.3S277.7 0 256.1 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H86.4V288h48.6v224h92.7V288z"
    />
  </svg>
)

const IgIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M224 141c-63.6 0-114.9 51.3-114.9 114.9S160.4 370.8 224 370.8 338.9 319.5 338.9 255.9 287.6 141 224 141zm0 189.6a74.7 74.7 0 1 1 74.7-74.7 74.7 74.7 0 0 1-74.7 74.7zm146.4-194.3a26.8 26.8 0 1 1-26.8 26.8 26.8 26.8 0 0 1 26.8-26.8zM448 163.2c-1.7-35.7-9.9-67.3-36.2-93.6S353.9 35.1 318.2 33.4C294.5 31.7 257.8 31.7 225.4 31.7s-69.1 0-92.8 1.7c-35.7 1.7-67.3 9.9-93.6 36.2S4.5 127.5 2.8 163.2C1.1 186.9 1.1 223.6 1.1 256s0 69.1 1.7 92.8c1.7 35.7 9.9 67.3 36.2 93.6s57.9 34.5 93.6 36.2c23.7 1.7 60.4 1.7 92.8 1.7s69.1 0 92.8-1.7c35.7-1.7 67.3-9.9 93.6-36.2s34.5-57.9 36.2-93.6c1.7-23.7 1.7-60.4 1.7-92.8s0-69.1-1.7-92.8z"
    />
  </svg>
)

const TkIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M448 209.9a210 210 0 0 1-122.8-39.3v178.8C325.2 424 264.5 484.6 190 484.6S54.8 424 54.8 349.4 115.4 214.2 190 214.2a134 134 0 0 1 20.5 1.6v71.8a60.6 60.6 0 1 0 40.2 59.4V0h74.5a135.6 135.6 0 0 0 122.8 135.5z"
    />
  </svg>
)

/* ========= Editable hours & map links ========= */
const HOURS = {
  allInOne: 'ทุกวัน 08:00–20:00',          // อาหาร / คาเฟ่ / เสริมสวย
  carcare: 'จ–ศ 08:30–18:00 (หยุด พุธ)',  // คาร์แคร์
}

const MAPS = {
  food:   'https://maps.google.com/?q=15.12345,103.45678',
  beauty: 'https://maps.google.com/?q=15.12345,103.45678',
  cafe:   'https://maps.google.com/?q=15.12345,103.45678',
  car:    'https://maps.google.com/?q=15.12888,103.45999',
}

const Pin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"
    />
  </svg>
)

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-[#faf9f7]">
      <div className="container mx-auto px-4 py-10 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand + social */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800">Sarisagroup</h4>
          <p className="text-sm text-slate-600 mt-2">
            ทำธุรกิจเพื่อชุมชนอย่างยั่งยืน – ขาดทุนไม่ว่า เสียชื่อไม่ได้
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Btn href="https://facebook.com" label="Facebook" className="hover:text-[#1877F2]">
              <FbIcon />
            </Btn>
            <Btn href="https://instagram.com" label="Instagram" className="hover:text-[#E1306C]">
              <IgIcon />
            </Btn>
            <Btn href="https://tiktok.com" label="TikTok" className="hover:text-black">
              <TkIcon />
            </Btn>
          </div>
        </div>

        {/* Links */}
        <div>
          <h5 className="font-medium text-slate-800">ลิงก์</h5>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li><Link href="/about"  className="hover:underline">เกี่ยวกับเรา</Link></li>
            <li><Link href="/stores" className="hover:underline">ร้านค้าทั้งหมด</Link></li>
            <li><Link href="/videos" className="hover:underline">วิดีโอ</Link></li>
          </ul>
        </div>

        {/* Contact + Hours */}
        <div>
          <h5 className="font-medium text-slate-800">ติดต่อ</h5>
          <p className="text-sm mt-2 text-slate-700">อีเมล: hello@sarisagroup.co</p>

          <div className="mt-4">
            <h6 className="text-sm font-medium text-slate-800">เวลาเปิด–ปิด</h6>
            <ul className="mt-1 text-sm text-slate-700 space-y-1">
              <li>🍜/☕/💄: {HOURS.allInOne}</li>
              <li>🚗 คาร์แคร์: {HOURS.allInOne}</li>
            </ul>
          </div>
        </div>

        {/* Locations */}
        <div>
          <h5 className="font-medium text-slate-800">พิกัดร้าน</h5>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <a
                href={MAPS.food}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Pin className="text-indigo-500 group-hover:text-indigo-700" />
                🍜 ร้านอาหาร
              </a>
            </li>
            <li>
              <a
                href={MAPS.beauty}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Pin className="text-indigo-500 group-hover:text-indigo-700" />
                💄 ร้านเสริมสวย
              </a>
            </li>
            <li>
              <a
                href={MAPS.cafe}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Pin className="text-indigo-500 group-hover:text-indigo-700" />
                ☕ คาเฟ่
              </a>
            </li>
            <li>
              <a
                href={MAPS.car}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Pin className="text-indigo-500 group-hover:text-indigo-700" />
                🚗 ร้านคาร์แคร์
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pb-6">
        © {new Date().getFullYear()} Sarisagroup. All rights reserved.
      </div>
    </footer>
  )
}