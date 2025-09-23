'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

type Props = {
  apiBase: string;                 // เช่น "http://localhost:8877/api"
  imageId: string;                 // id ของรูป (เมนู)
  allowReview?: boolean;           // เปิดให้รีวิวจาก BE?
  initialAvg?: number | null;      // ค่าเฉลี่ยเริ่มต้น (ถ้ามี)
  initialCount?: number | null;    // จำนวนโหวตเริ่มต้น (ถ้ามี)
  initialMyRating?: number | null; // ดาวของผู้ใช้ (ถ้ามี)
  mePath?: string;                 // endpoint เช็ค login (ดีฟอลต์ '/auth/me')
};

const jsonFetcher = async (url: string) => {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(String(r.status));
  const ctype = r.headers.get('content-type') || '';
  if (!ctype.includes('application/json')) throw new Error('Not JSON');
  return r.json();
};

export default function StarRater({
  apiBase,
  imageId,
  allowReview = true,
  initialAvg = null,
  initialCount = null,
  initialMyRating = null,
  mePath = '/auth/me',
}: Props) {
  // ❗ ถ้าเมนูนี้ไม่อนุญาต → ซ่อนทั้งบล็อก และไม่ต้องยิง API ใด ๆ
  if (!allowReview) return null;

  // ===== Helpers =====
  const api = apiBase.replace(/\/$/, '');
  const meUrl = mePath.startsWith('http') ? mePath : `${api}${mePath}`;

  // ===== Check login =====
  const { data: me } = useSWR<{ id: string; name?: string } | null>(
    meUrl,
    jsonFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  const loggedIn = !!me?.id;

  // ===== Decide whether to fetch extra data =====
  const needAgg = initialAvg == null || initialCount == null;
  const needMine = initialMyRating == null && loggedIn;

  const { data: agg } = useSWR<{ image_id: string; avg: number; count: number }>(
    needAgg ? `${api}/ratings/${imageId}` : null,
    jsonFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: mine } = useSWR<{ image_id: string; my_rating: number | null }>(
    needMine ? `${api}/ratings/${imageId}/me` : null,
    jsonFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  // ===== States (optimistic) =====
  const [my, setMy] = useState<number | null>(initialMyRating ?? null);
  const [avg, setAvg] = useState<number | null>(initialAvg ?? null);
  const [count, setCount] = useState<number | null>(initialCount ?? null);
  const [sending, setSending] = useState(false);

  // sync จาก SWR → state (เลี่ยง setState ระหว่าง render)
  useEffect(() => {
    if (avg == null && agg?.avg != null) setAvg(agg.avg);
  }, [agg?.avg, avg]);
  useEffect(() => {
    if (count == null && agg?.count != null) setCount(agg.count);
  }, [agg?.count, count]);
  useEffect(() => {
    if (loggedIn && my == null && mine && 'my_rating' in mine) {
      setMy(mine.my_rating);
    }
  }, [loggedIn, mine, my]);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  // ===== API callers =====
  const postRating = async (value: number) => {
    // พยายามใช้เส้นใหม่ก่อน: POST /ratings/:imageId
    const urlNew = `${api}/ratings/${imageId}`;
    const r1 = await fetch(urlNew, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ rating: value }),
    });
    if (r1.ok) return r1;

    // ถ้า 404 → fallback เส้นทางเดิม: POST /ratings (body: { image_id, rating })
    if (r1.status === 404) {
      const urlOld = `${api}/ratings`;
      const r2 = await fetch(urlOld, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ image_id: imageId, rating: value }),
      });
      return r2;
    }
    return r1;
  };

  const onRate = async (value: number) => {
    if (!loggedIn || sending) return;

    // optimistic
    const prev = { my, avg, count };
    try {
      setSending(true);

      let nextCount = count ?? 0;
      let sum = (avg ?? 0) * nextCount;

      if (my) {
        // เคยโหวตแล้ว → แทนค่า
        sum = sum - my + value;
      } else {
        // โหวตครั้งแรก
        nextCount += 1;
        sum += value;
      }
      const nextAvg = nextCount > 0 ? sum / nextCount : value;

      setMy(value);
      setAvg(Number(nextAvg.toFixed(2)));
      setCount(nextCount);

      const res = await postRating(value);
      if (!res.ok) {
        // ถ้า BE ตอบ 403 (เมนูนี้ยังไม่อนุญาต) — rollback เงียบ ๆ
        if (res.status === 403) {
          setMy(prev.my);
          setAvg(prev.avg);
          setCount(prev.count);
          alert('เมนู/รูปนี้ยังไม่เปิดให้ให้ดาว');
          return;
        }
        throw new Error(await res.text().catch(() => `${res.status}`));
      }

      // ถ้า server ส่งสรุปกลับมา อัปเดตทับ (กัน rounding/consistency)
      const ctype = res.headers.get('content-type') || '';
      if (ctype.includes('application/json')) {
        const body = await res.json().catch(() => ({}));
        if (typeof body?.avg === 'number') setAvg(Number(body.avg));
        if (typeof body?.count === 'number') setCount(Number(body.count));
        if (typeof body?.my_rating === 'number') setMy(Number(body.my_rating));
      }
    } catch (e) {
      // rollback
      setMy(prev.my);
      setAvg(prev.avg);
      setCount(prev.count);
      console.error('rate failed:', e);
      alert('ให้ดาวไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSending(false);
    }
  };

  const onClear = async () => {
    if (!loggedIn || sending || my == null) return;

    const prev = { my, avg, count };
    try {
      setSending(true);

      // optimistic: ลบดาวของฉัน
      let nextCount = count ?? 0;
      let sum = (avg ?? 0) * nextCount;
      sum -= my;
      nextCount = Math.max(0, nextCount - 1);
      const nextAvg = nextCount > 0 ? sum / nextCount : 0;

      setMy(null);
      setAvg(Number(nextAvg.toFixed(2)));
      setCount(nextCount);

      const res = await fetch(`${api}/ratings/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      // ถ้า 404 ก็ถือว่า BE ยังไม่รองรับลบ — อย่างน้อย state ฝั่งเรา consistent
      if (!res.ok && res.status !== 404) {
        throw new Error(await res.text().catch(() => `${res.status}`));
      }

      const ctype = res.headers.get('content-type') || '';
      if (ctype.includes('application/json')) {
        const body = await res.json().catch(() => ({}));
        if (typeof body?.avg === 'number') setAvg(Number(body.avg));
        if (typeof body?.count === 'number') setCount(Number(body.count));
      }
    } catch (e) {
      setMy(prev.my);
      setAvg(prev.avg);
      setCount(prev.count);
      console.error('clear rating failed:', e);
      alert('ลบดาวไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 pt-2">
      {!loggedIn ? (
        <div className="text-sm text-gray-500">
          ต้อง&nbsp;
          <Link href="/login" className="text-amber-700 font-medium underline">
            เข้าสู่ระบบ
          </Link>
          &nbsp;ก่อนจึงจะให้ดาวได้
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* ปุ่มดาว 1–5 */}
          <div className="flex">
            {stars.map((s) => {
              const active = (my ?? 0) >= s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onRate(s)}
                  disabled={sending}
                  className={`mx-[1px] text-xl leading-none transition ${
                    active ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'
                  }`}
                  aria-label={`ให้ ${s} ดาว`}
                  title={`${s} ดาว`}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* ปุ่มลบดาวของฉัน */}
          {my != null && (
            <button
              type="button"
              onClick={onClear}
              disabled={sending}
              className="text-xs rounded-full px-2 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50"
              title="ลบดาวของฉัน"
            >
              ลบดาว
            </button>
          )}

          {/* แสดง avg + count */}
          {(avg ?? null) !== null && (
            <span className="text-sm text-gray-600">
              {avg?.toFixed(2)} / 5
              {typeof count === 'number' ? ` · ${count} โหวต` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}