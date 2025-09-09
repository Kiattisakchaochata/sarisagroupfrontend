'use client'
import { useEffect } from 'react'

type TTQ = {
  methods: string[]
  setAndDefer: (t: Record<string, unknown>, e: string) => void
  _q?: unknown[][]
  _i?: Record<string, unknown[]>
  instance: (t: string) => unknown[]
  load?: (id: string) => void
  page?: (...args: unknown[]) => void
  [k: string]: unknown
}

declare global {
  interface Window {
    ttq?: TTQ
  }
}

export default function TiktokPixel() {
  const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

  useEffect(() => {
    if (!PIXEL_ID) return

    if (typeof window !== 'undefined' && !window.ttq) {
      (function (w: Window, d: Document) {
        const ttq: TTQ = (w.ttq = (w.ttq || {}) as TTQ)
        ttq.methods = [
          'page','track','identify','instances','debug','on','off','once',
          'ready','alias','group','enableCookie','disableCookie',
        ]
        ttq.setAndDefer = function (t: Record<string, unknown>, e: string) {
          ;(t as TTQ)[e] = function (...args: unknown[]) {
            ;((t as TTQ)._q = (t as TTQ)._q || []).push([e, args])
          }
        }
        for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq as unknown as Record<string, unknown>, ttq.methods[i]!)

        ttq.instance = function (t: string) {
          const e = (ttq._i = ttq._i || {})
          return (e[t] = e[t] || []), ttq.setAndDefer(e as unknown as Record<string, unknown>, 'load'), e[t]!
        }

        const s = d.createElement('script')
        s.async = true
        s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js'
        const x = d.getElementsByTagName('script')[0]
        x.parentNode?.insertBefore(s, x)
      })(window, document)
    }

    try {
      window.ttq?.load?.(PIXEL_ID)
      window.ttq?.page?.()
    } catch {
      // ignore
    }
  }, [PIXEL_ID])

  return null
}