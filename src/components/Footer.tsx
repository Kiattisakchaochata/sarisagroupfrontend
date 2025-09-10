'use client'

import Link from 'next/link'
import React from 'react'

/* ===== Inline brand icons (น้ำหนักเบา ไม่ต้องลง lib เพิ่ม) ===== */
const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V8.4c0-.9.3-1.5 1.6-1.5H17V4.2c-.3 0-1.2-.2-2.3-.2-2.2 0-3.7 1.3-3.7 3.8V11H8v3h3v8h2.5Z"/>
  </svg>
)

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.75-.9a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z"/>
  </svg>
)

/* LINE (โลโก้ทรงกล่องพูด) */
const IconLine = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M24 6C13 6 4 13.6 4 22.9c0 6.1 4.1 11.4 10.2 14l-.8 5.2c-.1.9.9 1.5 1.6.9l6.5-4.7c.8.1 1.6.1 2.4.1 11 0 20-7.6 20-16.9C44 13.6 35 6 24 6Zm-7.9 21.3H12v-11h4.1v11Zm6.6 0h-4.1v-11h4.1v11Zm6.5 0h-4.1v-11h4.1v11Zm6.6-8.4h-4.1v8.4h-4.1v-11h8.2v2.6Z"/>
  </svg>
)

/* TikTok (แบบเรียบ โทนเดียว) */
const IconTiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M33.4 16.5c2.4 1.8 5 2.7 7.9 2.8v6.3c-2.9 0-5.5-.8-7.9-2.1v8.7c0 7.3-5.9 12.8-13.2 12.8-7.2 0-13.1-5.5-13.1-12.8 0-7.2 5.9-12.7 13.1-12.7.8 0 1.5.1 2.3.2v6.6a6.3 6.3 0 0 0-2.3-.4c-3.4 0-6.1 2.6-6.1 6.3 0 3.6 2.7 6.3 6.1 6.3 3.5 0 6.1-2.7 6.1-6.3V4h6.2c0 4.6 1.9 8.5 4.9 11.3Z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h4 className="text-lg font-semibold" style={{color:'#4b3832'}}>Sarisagroup</h4>
          <p className="text-sm opacity-80 mt-2">
            ทำธุรกิจเพื่อชุมชนอย่างยั่งยืน – ขาดทุนไม่ว่า เสียชื่อไม่ได้
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4 mt-4 text-gray-600">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-600" aria-label="Facebook">
              <IconFacebook width={22} height={22} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500" aria-label="Instagram">
              <IconInstagram width={22} height={22} />
            </a>
            <a href="https://line.me" target="_blank" rel="noreferrer" className="hover:text-green-600" aria-label="LINE">
              <IconLine width={22} height={22} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-black" aria-label="TikTok">
              <IconTiktok width={22} height={22} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h5 className="font-medium" style={{color:'#4b3832'}}>ลิงก์</h5>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/about"  className="hover:underline">เกี่ยวกับเรา</Link></li>
            <li><Link href="/stores" className="hover:underline">ร้านค้าทั้งหมด</Link></li>
            <li><Link href="/videos" className="hover:underline">วิดีโอ</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="font-medium" style={{color:'#4b3832'}}>ติดต่อ</h5>
          <p className="text-sm mt-2 opacity-80">อีเมล: hello@sarisagroup.co</p>
        </div>
      </div>

      <div className="text-center text-xs opacity-70 pb-6">
        © {new Date().getFullYear()} Sarisagroup. All rights reserved.
      </div>
    </footer>
  )
}