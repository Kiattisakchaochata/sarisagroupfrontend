// src/lib/pixels/TiktokPixel.tsx
'use client'

import { useEffect } from 'react'

export default function TiktokPixel() {
  const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

  useEffect(() => {
    if (!PIXEL_ID) return

    // ถ้ามี ttq อยู่แล้ว ไม่ต้อง init ซ้ำ
    if (typeof window !== 'undefined' && !(window as any).ttq) {
      ;(function (w: any, d, t) {
        var ttq = (w.ttq = w.ttq || [])
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ]
        ttq.setAndDefer = function (t: any, e: any) {
          ;(t[e] = function () {
            ;(t._q = t._q || []).push([e, arguments])
          })
        }
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i])
        ttq.instance = function (t: any) {
          var e = ttq._i = ttq._i || {}
          return (e[t] = e[t] || []), ttq.setAndDefer(e[t], 'load'), e[t]
        }
        const s = d.createElement('script')
        s.async = true
        s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js'
        const x = d.getElementsByTagName('script')[0]
        x.parentNode?.insertBefore(s, x)
      })(window, document, 'ttq')
    }

    try {
      ;(window as any).ttq?.load(PIXEL_ID)
      ;(window as any).ttq?.page()
    } catch {
      // เงียบไว้ ไม่ให้พังหน้า
    }
  }, [PIXEL_ID])

  // ไม่มี UI ให้ render
  return null
}