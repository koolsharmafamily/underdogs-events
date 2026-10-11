import type { Metadata } from 'next'
import { site } from '@/content/site'
import { RedRoomView } from '@/sections/redroom/RedRoomView'

export const metadata: Metadata = {
  title: site.redRoom.meta.title,
  description: site.redRoom.meta.description,
}

export default function RedRoomPage() {
  return <RedRoomView />
}
