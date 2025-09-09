// src/lib/pixels/FacebookPixel.tsx
'use client'
import { useEffect } from 'react'

export default function FacebookPixel() {
  const FB_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

  useEffect(() => {
    if (!FB_ID) return
    if (typeof window === 'undefined') return

    ;(function (f, b, e, v, n?, t?, s?) {
      if ((f as any).fbq) return
      n = (f as any).fbq = function () {
        ;(n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments)
      }
      if (!(f as any)._fbq) (f as any)._fbq = n
      ;(n as any).push = (n as any)
      ;(n as any).loaded = true
      ;(n as any).version = '2.0'
      ;(n as any).queue = []
      t = b.createElement(e)
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode?.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    try {
      ;(window as any).fbq('init', FB_ID)
      ;(window as any).fbq('track', 'PageView')
    } catch {}
  }, [FB_ID])

  return null
}