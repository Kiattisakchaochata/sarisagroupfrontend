'use client';

import useSWR from 'swr';

/* ---------- types ---------- */
type FooterLink = { label: string; href: string };
type Socials = { facebook?: string; instagram?: string; tiktok?: string; line?: string; youtube?: string };
type FooterLocation = { label: string; href: string };
type FooterHour = { label: string; time: string };

type FooterDto = {
  about_text?: string;
  address?: string;
  phone?: string;
  email?: string;
  socials?: Socials;
  links?: FooterLink[];
  locations?: FooterLocation[];
  hours?: FooterHour[];
};

/* ---------- small components ---------- */
const Btn = ({
  href,
  label,
  children,
  className = '',
}: React.PropsWithChildren<{ href?: string; label: string; className?: string }>) => {
  const valid = href && /^https?:\/\//i.test(href);
  if (!valid) return null;
  return (
    <a
      href={href!}
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
  );
};

const FbIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 320 512" width="18" height="18" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M279.1 288 293.3 195.3h-88.9V135.2c0-25.3 12.4-50.1 52.2-50.1H295V6.3S277.7 0 256.1 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H86.4V288h48.6v224h92.7V288z" />
  </svg>
);
const IgIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M224 141c-63.6 0-114.9 51.3-114.9 114.9S160.4 370.8 224 370.8 338.9 319.5 338.9 255.9 287.6 141 224 141zm0 189.6a74.7 74.7 0 1 1 74.7-74.7 74.7 74.7 0 0 1-74.7 74.7zm146.4-194.3a26.8 26.8 0 1 1-26.8 26.8 26.8 26.8 0 0 1 26.8-26.8z" />
  </svg>
);
const TkIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M448 209.9a210 210 0 0 1-122.8-39.3v178.8C325.2 424 264.5 484.6 190 484.6S54.8 424 54.8 349.4 115.4 214.2 190 214.2a134 134 0 0 1 20.5 1.6v71.8a60.6 60.6 0 1 0 40.2 59.4V0h74.5a135.6 135.6 0 0 0 122.8 135.5z" />
  </svg>
);
const Pin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
  </svg>
);

/* ---------- main ---------- */
export default function Footer() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
  const { data } = useSWR<{ footer: FooterDto }>(
    `${API_BASE}/api/footer`,
    async (url: string) => {
      const res = await fetch(url, { credentials: 'include' });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) throw new Error(await res.text());
      if (!ct.includes('application/json')) throw new Error('invalid response');
      return res.json();
    },
    { revalidateOnFocus: false }
  );

  const f = data?.footer ?? {};
  const socials   = f.socials ?? {};
  const locations = Array.isArray(f.locations) ? f.locations : [];
  const hours     = Array.isArray(f.hours) ? f.hours : [];

  return (
    <footer className="mt-16 bg-[#faf9f7]">
      {/* เส้นคั่นเหนือฟุตเตอร์ */}
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

      {/* กล่องเนื้อหา */}
      <div className="mx-auto w-full max-w-7xl px-[5px] sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 items-start">
          {/* LEFT : Brand */}
          <div className="md:pr-2">
            <h4 className="text-2xl font-extrabold tracking-tight text-slate-900">Sarisagroup</h4>
            {/* บังคับไม่ให้ตัดบรรทัด */}
            <p className="text-[15px] leading-relaxed text-slate-700 mt-2 max-w-none whitespace-nowrap">
              {f.about_text ?? 'ทำธุรกิจเพื่อชุมชนอย่างยั่งยืน – ขาดทุนไม่ว่า เสียชื่อไม่ได้'}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Btn href={socials.facebook}  label="Facebook"  className="hover:text-[#1877F2]"><FbIcon /></Btn>
              <Btn href={socials.instagram} label="Instagram" className="hover:text-[#E1306C]"><IgIcon /></Btn>
              <Btn href={socials.tiktok}    label="TikTok"    className="hover:text-black"><TkIcon /></Btn>
            </div>
          </div>

          {/* CENTER : Hours — ขยับไปทางขวา ~5cm และไม่ให้เวลาตกบรรทัด */}
          <div className="md:px-3 md:ml-[1px]">
            <h5 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> เวลาเปิด–ปิด
            </h5>

            {hours.length > 0 ? (
              <ul className="w-full max-w-md space-y-2">
                {hours.map((h, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-8 text-[15px]"
                  >
                    <span className="font-medium text-slate-900">{h.label}</span>
                    <span className="text-slate-700 tabular-nums whitespace-nowrap">{h.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </div>

          {/* RIGHT : Locations */}
          <div className="md:pl-30 justify-self-stretch">
            <h5 className="mb-3 text-lg font-semibold text-slate-900">พิกัดร้าน</h5>
            <ul className="space-y-2 text-[15px] pr-[5px]">
              {locations.length > 0 ? (
                locations.map((loc, i) =>
                  loc?.href ? (
                    <li key={i} className="flex">
                      <a
                        href={loc.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 ml-[5px] whitespace-nowrap"
                      >
                        <Pin className="text-indigo-500 group-hover:text-indigo-700" />
                        {loc.label || loc.href}
                      </a>
                    </li>
                  ) : null
                )
              ) : (
                <li className="text-slate-500 ml-[5px]">—</li>
              )}
            </ul>
          </div>
        </div>

        {/* copyright */}
        <div className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Sarisagroup. All rights reserved.
        </div>
      </div>
    </footer>
  );
}