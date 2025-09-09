// src/app/admin/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Admin | Sarisagroup',
}

export default function AdminPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 md:px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">แผงควบคุม</h1>
        <p className="text-gray-600">จัดการข้อมูลบนเว็บไซต์ Sarisagroup</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/banners" className="card p-5 hover:shadow-md transition">
          <div className="text-lg font-medium">แบนเนอร์</div>
          <div className="text-gray-600 text-sm mt-1">อัปเดตรูปและลิงก์ในหน้าหลัก</div>
        </Link>

        <Link href="/admin/videos" className="card p-5 hover:shadow-md transition">
          <div className="text-lg font-medium">วิดีโอรีวิว</div>
          <div className="text-gray-600 text-sm mt-1">เพิ่ม/แก้ไขลิงก์ YouTube</div>
        </Link>

        <Link href="/admin/stores" className="card p-5 hover:shadow-md transition">
          <div className="text-lg font-medium">ร้านค้า</div>
          <div className="text-gray-600 text-sm mt-1">ข้อมูลร้าน รูปภาพ และหมวดหมู่</div>
        </Link>
      </section>
    </main>
  )
}