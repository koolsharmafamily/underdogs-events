import type { Metadata } from 'next'
import './globals.css'
import { site } from '@/content/site'
import {
  coreFontVariables,
  redRoomFontVariables,
  diwaliFontVariables,
} from '@/theme/fonts'
import { Providers } from '@/ui/Providers'
import { DomLoader } from '@/ui/DomLoader'
import { Nav } from '@/ui/Nav'
import { Cursor } from '@/ui/Cursor'
import { FilmGrain } from '@/ui/FilmGrain'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsnagpur.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: site.home.meta.title,
  description: site.home.meta.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: site.home.meta.title,
    description: site.home.meta.description,
    url: '/',
    siteName: site.brand.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/media/og-home.png',
        width: 1200,
        height: 630,
        alt: `${site.brand.name} — ${site.brand.line}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.home.meta.title,
    description: site.home.meta.description,
    images: ['/media/og-home.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-world="home"
      data-motion="on"
      className={`${coreFontVariables} ${redRoomFontVariables} ${diwaliFontVariables}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/media/badge-enamel-still.webp"
          imageSrcSet="/media/badge-enamel-still-512.webp 768w, /media/badge-enamel-still.webp 1024w"
          imageSizes="(max-width: 768px) 512px, 1024px"
          fetchPriority="high"
          type="image/webp"
        />
      </head>
      <body>
        {/* Skip link comes first in tab order (Part 11) */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <Providers>
          <DomLoader />
          <Nav />
          <Cursor />
          <FilmGrain />
          {children}
        </Providers>
      </body>
    </html>
  )
}
