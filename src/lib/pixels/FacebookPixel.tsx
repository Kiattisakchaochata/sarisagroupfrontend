'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    fbq?: ((method: string, ...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void
      push?: (...args: unknown[]) => void
      loaded?: boolean
      version?: string
      queue?: unknown[]
    }
    _fbq?: Window['fbq']
  }
}

export default function FacebookPixel() {
  const FB_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

  useEffect(() => {
    if (!FB_ID) return
    if (typeof window === 'undefined') return

    (function (f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return
      const n = (f.fbq = function (this: unknown, method: string, ...args: unknown[]) {
        if ((n as any).callMethod) {
          (n as any).callMethod(method, ...args)
        } else {
          ;(n as any).queue.push([method, ...args])
        }
      }) as Window['fbq']
      if (!f._fbq) f._fbq = n
      ;(n as any).push = n as any
      ;(n as any).loaded = true
      ;(n as any).version = '2.0'
      ;(n as any).queue = []
      const t = b.createElement(e) as HTMLScriptElement
      t.async = true
      t.src = v
      const s = b.getElementsByTagName(e)[0]
      s.parentNode?.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    try {
      window.fbq?.('init', FB_ID)
      window.fbq?.('track', 'PageView')
    } catch {
      // ignore
    }
  }, [FB_ID])

  return null
}