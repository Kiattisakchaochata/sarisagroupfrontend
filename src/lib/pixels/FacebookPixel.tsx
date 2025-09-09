'use client'
import { useEffect } from 'react'

type FBQ = ((
  method: string,
  ...args: unknown[]
) => void) & {
  callMethod?: (method: string, ...args: unknown[]) => void
  push?: (...args: unknown[]) => void
  loaded?: boolean
  version?: string
  queue?: unknown[]
}

declare global {
  interface Window {
    fbq?: FBQ
    _fbq?: FBQ
  }
}

export default function FacebookPixel() {
  const FB_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

  useEffect(() => {
    if (!FB_ID) return
    if (typeof window === 'undefined') return

    (function (f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return
      const n: FBQ = function (method: string, ...args: unknown[]) {
        if (n.callMethod) {
          n.callMethod(method, ...args)
        } else {
          ;(n.queue = n.queue || []).push([method, ...args])
        }
      } as FBQ
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      const t = b.createElement(e) as HTMLScriptElement
      t.async = true
      t.src = v
      const s = b.getElementsByTagName(e)[0]
      s.parentNode?.insertBefore(t, s)
      f.fbq = n
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