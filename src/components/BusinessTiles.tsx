type Biz = {
  key: string;
  title: string;
  desc: string;
  icon?: string;
  href: string;
};

const BUSINESSES: Biz[] = [
  { key: 'laundry', title: 'ซักผ้าหยอดเหรียญ', desc: 'เครื่องซักอบคุณภาพ สะดวก สะอาด ปลอดภัย', href: '/stores?cat=laundry' },
  { key: 'cafe', title: 'คาเฟ่เครื่องดื่ม & ขนม', desc: 'เครื่องดื่มและขนมโฮมเมด สดใหม่ทุกวัน', href: '/stores?cat=cafe' },
  { key: 'salon', title: 'เสริมสวย', desc: 'ดูแลทรงผมและความมั่นใจโดยช่างมืออาชีพ', href: '/stores?cat=salon' },
  { key: 'restaurant', title: 'ร้านอาหาร', desc: 'รสชาติอร่อยซื่อสัตย์ต่อวัตถุดิบ', href: '/stores?cat=restaurant' },
  { key: 'carcare', title: 'คาร์แคร์ญี่ปุ่น', desc: 'เครื่องล้างรถนำเข้าญี่ปุ่น + คาเฟ่ + โซนเด็กเล่น', href: '/stores?cat=carcare' },
];

export default function BusinessTiles() {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">ธุรกิจของเรา</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {BUSINESSES.map(b => (
          <a key={b.key} href={b.href} className="card bg-base-100 shadow hover:shadow-md transition rounded-2xl">
            <div className="card-body p-4">
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm opacity-80">{b.desc}</p>
              <div className="mt-2">
                <span className="link link-primary text-sm">ดูร้านในหมวดนี้ →</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}