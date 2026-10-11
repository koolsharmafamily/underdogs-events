import type { Metadata } from 'next'
import { site } from '@/content/site'
import { HomeView } from '@/sections/home/HomeView'

export const metadata: Metadata = {
  title: site.home.meta.title,
  description: site.home.meta.description,
}

export default function HomePage() {
  return <HomeView />
}
