import type { Metadata } from 'next'
import { site } from '@/content/site'
import { DiwaliView } from '@/sections/diwali/DiwaliView'

export const metadata: Metadata = {
  title: site.diwali.meta.title,
  description: site.diwali.meta.description,
}

export default function DiwaliPage() {
  return <DiwaliView />
}
