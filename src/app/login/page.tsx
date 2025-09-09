// src/app/login/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'เข้าสู่ระบบ | Sarisagroup',
}

export default function LoginPage() {
  return (
    <main className="container mx-auto max-w-md px-4 md:px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="text-gray-600 mt-1 text-sm">
          เข้าสู่ระบบเพื่อจัดการข้อมูลร้าน วิดีโอ และกิจกรรม
        </p>
      </header>

      <form className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">อีเมล</span>
          </label>
        </div>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="you@example.com"
          required
        />

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">รหัสผ่าน</span>
          </label>
        </div>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="••••••••"
          required
        />

        <button type="submit" className="btn btn-primary w-full mt-6">
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="text-sm text-gray-600 mt-4">
        ยังไม่มีบัญชี?{' '}
        <Link className="link" href="/register">
          สมัครสมาชิก
        </Link>
      </div>
    </main>
  )
}