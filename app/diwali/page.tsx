import { assetUrl } from "@/utils/assetUrl";
import type { Metadata } from 'next'
import { site } from '@/content/site'
import { diwaliFontVariables } from '@/theme/fonts'
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
        url: assetUrl("/media/dhamaaka-flyer.png"),
        width: 1080,
        height: 1350,
        alt: site.diwali.poster.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.diwali.meta.title,
    description: site.diwali.meta.description,
    images: [assetUrl("/media/dhamaaka-flyer.png")],
  },
}

export default function DiwaliPage() {
  return (
    <div className={diwaliFontVariables}>
      <JsonLd page="diwali" />
      <DiwaliView />
    </div>
  )
}
