"use client";

import React, { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/meta-pixel";

interface MetaPixelProps {
  pixelId?: string;
}

function MetaPixelTracker({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track PageView on route change (SPA navigation)
  useEffect(() => {
    if (!pixelId) return;
    pageview();
  }, [pathname, searchParams, pixelId]);

  return null;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId =
    pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

  if (!activePixelId || activePixelId.trim() === "") {
    return null;
  }

  const cleanId = activePixelId.trim();

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${cleanId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <Suspense fallback={null}>
        <MetaPixelTracker pixelId={cleanId} />
      </Suspense>
    </>
  );
}
