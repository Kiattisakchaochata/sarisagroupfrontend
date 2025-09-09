export default function Hero() {
  return (
    <section className="mt-6">
      <div className="hero rounded-2xl bg-base-200">
        <div className="hero-content text-center py-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold">
              ธุรกิจเพื่อชุมชน – ขาดทุนไม่ว่า <span className="text-primary">เสียชื่อไม่ได้</span>
            </h1>
            <p className="mt-3 opacity-80">
              ซักผ้าหยอดเหรียญ • คาเฟ่ขนมเครื่องดื่ม • เสริมสวย • ร้านอาหาร •
              คาร์แคร์นำเข้าญี่ปุ่น (มีคาเฟ่ & โซนเด็ก) — เน้นคุณภาพ รสชาติอร่อย
              ใช้พลังงานทดแทน และช่วยสร้างงานในท้องถิ่น
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a className="btn btn-primary" href="/stores">สำรวจร้าน</a>
              <a className="btn btn-ghost" href="/about">รู้จักเรา</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}