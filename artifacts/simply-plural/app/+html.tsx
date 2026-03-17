import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4ECDC4" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Apple PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Simply Plural" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* App meta */}
        <meta name="application-name" content="Simply Plural" />
        <meta name="description" content="Track your plural system members and fronting history" />
        <meta name="msapplication-TileColor" content="#0D1117" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/icons/icon-192.png" />

        {/* Prevent layout jump */}
        <ScrollViewStyleReset />

        {/* Dark background before app loads */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #0D1117;
                height: 100%;
              }
              * { box-sizing: border-box; }
            `,
          }}
        />

        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[SW] Registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
