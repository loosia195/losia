// app/(public)/layout.tsx
import "@/styles/globals.css";
import React from "react";
import Script from "next/script";
import PageView from "@/components/analytics/PageView";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";
import CartProvider from "@/app/providers/CartProvider";

import Header from "@/app/(public)/components/common/Header";
import Footer from "@/app/(public)/components/common/Footer";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://losia.vn").replace(/\/$/, "");
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LOSIA",
  description: "Wear What Matters",
};
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "1" && !!GA_ID;
  const cdn = process.env.NEXT_PUBLIC_IMG_CDN ?? "https://cdn.losia.vn";

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href={cdn} crossOrigin="" />
        <link rel="dns-prefetch" href={cdn} />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {enableAnalytics ? <link rel="preconnect" href="https://www.googletagmanager.com" /> : null}
      </head>

      <body className={inter.className}>
        <CartProvider>
          {/* Header mới */}
          <Header />

          {/* MiniCartDrawer cần context → đặt bên trong Provider */}
          <MiniCartDrawer hideTrigger />

          {/* Nội dung trang */}
          <main>{children}</main>

          {/* Footer đồng bộ */}
          <Footer />

          {/* GA4 */}
          {enableAnalytics ? (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { send_page_view: false });
                `}
              </Script>
              <PageView />
            </>
          ) : null}

          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "LOSIA",
                url: SITE_URL,
                logo: `${SITE_URL}/assets/logo.png`,
                sameAs: ["https://www.facebook.com/losia", "https://www.instagram.com/losia"].filter(Boolean),
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: SITE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE_URL}/search?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
