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

export const metadata: Metadata = {
  title: site.home.meta.title,
  description: site.home.meta.description,
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
