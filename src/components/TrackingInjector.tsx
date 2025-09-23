// src/components/TrackingInjector.tsx
import Script from 'next/script';

type Provider = 'GA4' | 'GTM' | 'FacebookPixel' | 'TikTokPixel' | 'Custom';
type Placement = 'HEAD' | 'BODY_END';
type Strategy  = 'afterInteractive' | 'lazyOnload' | 'worker';

type TrackingScript = {
  id: string;
  provider: Provider;
  trackingId?: string | null;
  script?: string | null;
  placement: Placement;
  strategy: Strategy;
};

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||               // เผื่อคุณตั้งฝั่ง server ไว้
  '';                                   // ถ้าเว้นว่าง = จะ fallback ไม่ยิงเลย (กันพัง)

const API_BASE = rawBase.replace(/\/$/, ''); // กัน / ท้าย

async function fetchEnabled(): Promise<TrackingScript[]> {
  // ป้องกันพังถ้าไม่ได้ตั้งค่า API_BASE (เช่น dev ยังไม่เปิด BE)
  if (!API_BASE || !/^https?:\/\//i.test(API_BASE)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[TrackingInjector] Missing or invalid NEXT_PUBLIC_API_BASE. Skip injecting scripts.');
    }
    return [];
  }

  try {
    const res = await fetch(`${API_BASE}/api/tracking-scripts`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.items) ? data.items : [];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[TrackingInjector] fetch failed:', err);
    }
    return [];
  }
}

/** วางใน <head> ของ layout */
export async function TrackingInjectorHead() {
  const scripts = (await fetchEnabled()).filter((s) => s.placement === 'HEAD');
  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((s) => (
        <Script
          key={s.id}
          id={`trk-${s.id}`}
          strategy={normalizeStrategy(s.strategy)}
          dangerouslySetInnerHTML={{ __html: buildInline(s) }}
        />
      ))}
    </>
  );
}

/** วางท้าย <body> ของ layout */
export async function TrackingInjectorBody() {
  const scripts = (await fetchEnabled()).filter((s) => s.placement === 'BODY_END');
  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((s) => (
        <Script
          key={s.id}
          id={`trk-${s.id}`}
          strategy={normalizeStrategy(s.strategy)}
          dangerouslySetInnerHTML={{ __html: buildInline(s) }}
        />
      ))}
    </>
  );
}

function normalizeStrategy(s: Strategy): 'afterInteractive' | 'lazyOnload' | 'worker' {
  return s === 'lazyOnload' ? 'lazyOnload' : s === 'worker' ? 'worker' : 'afterInteractive';
}

function buildInline(s: TrackingScript): string {
  if (s.provider === 'GA4' && s.trackingId) {
    return `
      (function(){
        var g=document.createElement('script');
        g.async=true; g.src='https://www.googletagmanager.com/gtag/js?id=${s.trackingId}';
        document.head.appendChild(g);
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config','${s.trackingId}',{send_page_view:true});
      })();
    `.trim();
  }

  if (s.provider === 'GTM' && s.trackingId) {
    return `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${s.trackingId}');
    `.trim();
  }

  if (s.provider === 'FacebookPixel' && s.trackingId) {
    return `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${s.trackingId}');fbq('track','PageView');
    `.trim();
  }

  if (s.provider === 'TikTokPixel' && s.trackingId) {
    return `
      !function (w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat([].slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");
      o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
      var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${s.trackingId}');ttq.page();
    `.trim();
  }

  return s.script || '';
}