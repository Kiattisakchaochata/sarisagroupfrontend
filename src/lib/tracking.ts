// src/lib/tracking.ts (server)
import prisma from '@/server/prisma';

export async function getEnabledTrackings() {
  return prisma.trackingScript.findMany({
    where: { enabled: true },
    orderBy: { createdAt: 'asc' },
  });
}

// template มาตรฐาน
export function renderTrackingSnippet(row: {
  provider: 'GA4'|'GTM'|'FacebookPixel'|'TikTokPixel'|'Custom',
  trackingId?: string|null,
  script?: string|null,
}) {
  switch (row.provider) {
    case 'GA4':
      if (!row.trackingId) return '';
      return `
        <!-- GA4 -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${row.trackingId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${row.trackingId}');
        </script>`;
    case 'GTM':
      if (!row.trackingId) return '';
      return `
        <!-- GTM -->
        <script>
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${row.trackingId}');
        </script>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${row.trackingId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
    case 'FacebookPixel':
      if (!row.trackingId) return '';
      return `
        <!-- Meta Pixel -->
        <script>
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${row.trackingId}');
          fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${row.trackingId}&ev=PageView&noscript=1"/></noscript>`;
    case 'TikTokPixel':
      if (!row.trackingId) return '';
      return `
        <!-- TikTok Pixel -->
        <script>
          !function (w, d, t) {
            w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
            ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
            ttq.setAndDefer = function(t, e){ t[e] = function(){ t.push([e].concat(Array.prototype.slice.call(arguments,0))) } };
            for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.instance = function(t){ var e = ttq._i[t] || []; for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e };
            ttq.load = function(e, n){ var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
              ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
              ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var o = document.createElement('script');
              o.type = 'text/javascript'; o.async = !0; o.src = i + '?sdkid=' + e + '&lib=' + t;
              var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a);
            };
            ttq.load('${row.trackingId}'); ttq.page();
          }(window, document, 'ttq');
        </script>`;
    case 'Custom':
      return row.script ?? '';
    default:
      return '';
  }
}