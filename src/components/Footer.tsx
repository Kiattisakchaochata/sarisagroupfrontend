'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <h4 className="font-semibold">Sarisagroup</h4>
          <p className="text-sm opacity-80 mt-2">
            ทำธุรกิจเพื่อชุมชนอย่างยั่งยืน – ขาดทุนไม่ว่า เสียชื่อไม่ได้
          </p>
        </div>

        <div>
          <h5 className="font-medium">ลิงก์</h5>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/about" className="link">เกี่ยวกับเรา</Link></li>
            <li><Link href="/stores" className="link">ร้านค้าทั้งหมด</Link></li>
            <li><Link href="/videos" className="link">วิดีโอ</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-medium">ติดต่อ</h5>
          <p className="text-sm mt-2 opacity-80">อีเมล: hello@sarisagroup.co</p>
        </div>
      </div>
      <div className="text-center text-xs opacity-70 pb-6">
        © {new Date().getFullYear()} Sarisagroup. All rights reserved.
      </div>
    </footer>
  );
}