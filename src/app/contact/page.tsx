'use client';

import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Contact = {
  id: string;
  store_name?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  messenger?: string;
  line?: string;
  address?: string;
  map_iframe?: string; // อาจเป็น <iframe> หรือ URL
  is_active?: boolean;
  order_number?: number;
};

function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = raw.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const fetcher = async (url: string) => {
  const r = await fetch(url);
  const t = await r.text();
  if (!r.ok) throw new Error(t || 'fetch failed');
  return t ? JSON.parse(t) : {};
};

/* ---------- helpers ---------- */
const isIframe = (v?: string) => !!(v && v.trim().startsWith('<iframe'));

function toEmbedIframeFromUrl(url?: string) {
  const v = (url || '').trim();
  if (!v) return '';

  const isGmap =
    /google\.[^/]+\/maps/i.test(v) ||
    /maps\.google\./i.test(v) ||
    /maps\.app\.goo\.gl/i.test(v) ||
    /goo\.gl\/maps/i.test(v) ||
    /g\.page\//i.test(v);

  if (!isGmap) return '';
  let src = v;
  if (!/\/embed/i.test(src) && !/[?&]output=embed/i.test(src)) {
    src += (src.includes('?') ? '&' : '?') + 'output=embed';
  }
  return `<iframe src="${src.replace(
    /"/g,
    '&quot;'
  )}" width="100%" height="220" style="border:0" loading="lazy" allowfullscreen="" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

export default function ContactPage() {
  const API = getApiBase();

  const { data, error, isLoading } = useSWR<{ contacts: Contact[] }>(
    `${API}/contacts`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const contacts = (data?.contacts || []).filter((c) => c.is_active);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
          <header className="mb-6">
            <h1 className="text-[22px] md:text-3xl font-semibold tracking-tight text-gray-900">
              ติดต่อเรา
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              ช่องทางการติดต่อและที่ตั้งของแต่ละสาขา/ร้าน
            </p>
          </header>

          {isLoading ? (
            <div className="text-gray-600">กำลังโหลด...</div>
          ) : error ? (
            <div className="text-red-600">โหลดข้อมูลไม่สำเร็จ</div>
          ) : contacts.length === 0 ? (
            <div className="text-gray-700">ยังไม่มีข้อมูลติดต่อ</div>
          ) : (
            <div className="grid gap-5 md:gap-6 md:grid-cols-2">
              {contacts.map((c) => {
                const raw = (c.map_iframe || '').trim();
                const iframeFromUrl = !isIframe(raw)
                  ? toEmbedIframeFromUrl(raw)
                  : '';

                return (
                  <article
                    key={c.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm ring-1 ring-black/5"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">
                      {c.store_name || '—'}
                    </h2>

                    <ul className="mt-2 space-y-1.5 text-[13px] md:text-sm text-gray-700">
                      {c.phone && <li>📞 {c.phone}</li>}
                      {c.email && <li>📧 {c.email}</li>}
                      {c.address && <li>📍 {c.address}</li>}

                      {(c.facebook || c.messenger || c.line) && (
                        <li className="pt-1.5 flex flex-wrap gap-x-3 gap-y-2">
                          {c.facebook && (
                            <a
                              href={c.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Facebook
                            </a>
                          )}
                          {c.messenger && (
                            <a
                              href={c.messenger}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Messenger
                            </a>
                          )}
                          {c.line && (
                            <a
                              href={c.line}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline"
                            >
                              LINE
                            </a>
                          )}
                        </li>
                      )}
                    </ul>

                    {/* Map */}
                    {(raw || iframeFromUrl) && (
                      <div className="mt-3 space-y-2">
                        {!isIframe(raw) && raw && (
                          <a
                            href={raw}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                          >
                            เปิดแผนที่
                          </a>
                        )}
                        {(isIframe(raw) || iframeFromUrl) && (
                          <div
                            className="overflow-hidden rounded-md border border-gray-200"
                            dangerouslySetInnerHTML={{
                              __html: isIframe(raw) ? raw : iframeFromUrl,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}