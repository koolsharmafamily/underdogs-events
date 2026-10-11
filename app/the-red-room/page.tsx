import type { Metadata } from 'next'
import { site } from '@/content/site'
import { RedRoomView } from '@/sections/redroom/RedRoomView'
import { JsonLd } from '@/ui/JsonLd'

export const metadata: Metadata = {
  title: site.redRoom.meta.title,
  description: site.redRoom.meta.description,
  alternates: {
    canonical: '/the-red-room',
  },
  openGraph: {
    title: site.redRoom.meta.title,
    description: site.redRoom.meta.description,
    url: '/the-red-room',
    siteName: site.brand.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/media/og-red-room.png',
        width: 1200,
        height: 630,
        alt: site.redRoom.poster.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.redRoom.meta.title,
    description: site.redRoom.meta.description,
    images: ['/media/og-red-room.png'],
  },
}

export default function RedRoomPage() {
  return (
    <>
      <JsonLd page="redroom" />
      <RedRoomView />
    </>
  )
}
