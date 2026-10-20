import { assetUrl } from "@/utils/assetUrl";
import type { Metadata } from 'next'
import { site } from '@/content/site'
import { HomeView } from '@/sections/home/HomeView'
import { JsonLd } from '@/ui/JsonLd'

export const metadata: Metadata = {
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
        url: assetUrl("/media/og-home.png"),
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
    images: [assetUrl("/media/og-home.png")],
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd page="home" />
      <HomeView />
    </>
  )
}
