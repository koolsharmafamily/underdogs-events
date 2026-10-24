import { assetUrl } from "@/utils/assetUrl";
import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/content/site.schema";
import { site } from "@/content/site";
import { coreFontVariables } from "@/theme/fonts";
import { Providers } from "@/ui/Providers";
import { DomLoader } from "@/ui/DomLoader";
import { Nav } from "@/ui/Nav";
import { FilmGrain } from "@/ui/FilmGrain";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.underdogs.co.in";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#07090D",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: site.home.meta.title,
  description: site.home.meta.description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: site.home.meta.title,
    description: site.home.meta.description,
    url: "/",
    siteName: site.brand.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: assetUrl("/media/og-home.png"),
        width: 1200,
        height: 630,
        alt: `${site.brand.name} — ${site.brand.line}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.home.meta.title,
    description: site.home.meta.description,
    images: [assetUrl("/media/og-home.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-world="home"
      data-motion="on"
      className={coreFontVariables}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#07090D" />

        {/* iOS PWA Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1179-2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1290-2796.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170-2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1284-2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />

        <link
          rel="preload"
          as="image"
          href={assetUrl("/media/badge-enamel-still-512.webp")}
          fetchPriority="high"
          type="image/webp"
        />
      </head>
      <body>
        {/* Skip link comes first in tab order (Part 11) */}
        <a href="#main-content" className="skip-link">
          {site.ui.skipLink}
        </a>

        <Providers>
          <DomLoader />
          <Nav />
          <FilmGrain />
          {children}
        </Providers>
      </body>
    </html>
  );
}
