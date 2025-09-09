// src/components/ImpactStrip.tsx
export default function ImpactStrip() {
  const points = [
    'สร้างงานในชุมชนจริงจัง',
    'ตั้งใจเปิดโอกาสการจ้างงานท้องถิ่น',
    'พลังงานทดแทน ลดคาร์บอน',
    'เลือกเทคโนโลยีที่เป็นมิตรต่อสิ่งแวดล้อม',
    'คุณภาพมาก่อน',
    '“ขาดทุนไม่ว่า เสียชื่อไม่ได้”',
  ]

  return (
    <section className="relative">
      <div className="card ring-1 ring-black/5 bg-[#f5f5f7]">
        <div className="grid gap-8 p-5 md:grid-cols-2 md:p-8">
          {/* Left: short copy */}
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
              พันธกิจของเรา
            </h3>
            <p className="mt-3 text-gray-600">
              เรายืนหยัดเรื่องคุณภาพ ความจริงใจ และผลลัพธ์ที่ดีต่อท้องถิ่น —
              ขับเคลื่อนโดยพลังงานทางเลือกและความรับผิดชอบต่อสิ่งแวดล้อม
            </p>
          </div>

          {/* Right: bullet list */}
          <ul className="grid grid-cols-1 gap-3 md:gap-2">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-black/5">
                <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white">
                  {/* check icon */}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] leading-relaxed text-gray-800">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}