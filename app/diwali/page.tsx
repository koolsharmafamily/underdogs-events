import type { Metadata } from 'next'
import { site } from '@/content/site'
import { DiwaliView } from '@/sections/diwali/DiwaliView'
import { JsonLd } from '@/ui/JsonLd'

export const metadata: Metadata = {
  title: site.diwali.meta.title,
  description: site.diwali.meta.description,
  alternates: {
    canonical: '/diwali',
  },
  openGraph: {
    title: site.diwali.meta.title,
    description: site.diwali.meta.description,
    url: '/diwali',
    siteName: site.brand.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/media/og-diwali.png',
        width: 1200,
        height: 630,
        alt: site.diwali.teaser.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.diwali.meta.title,
    description: site.diwali.meta.description,
    images: ['/media/og-diwali.png'],
  },
}

export default function DiwaliPage() {
  return (
    <>
      <JsonLd page="diwali" />
      <DiwaliView />
    </>
  )
}
