import React from 'react'
import { site } from '@/content/site'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsnagpur.com'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.brand.legalName,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.brand.city,
    addressCountry: 'IN',
  },
}

export const redRoomEventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${site.redRoom.title} — ${site.brand.legalName}`,
  description: site.redRoom.meta.description,
  startDate: '2026-10-24',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  image: [`${BASE_URL}/media/og-red-room.png`],
  location: {
    '@type': 'Place',
    name: site.redRoom.invitation.rows[2].value,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.redRoom.invitation.rows[2].sub,
      addressLocality: site.brand.city,
      postalCode: '440001',
      addressCountry: 'IN',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: site.brand.legalName,
  },
}

export const diwaliEventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${site.diwali.title} — ${site.brand.legalName}`,
  description: site.diwali.meta.description,
  startDate: '2026-11-07',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  image: [`${BASE_URL}/media/og-diwali.png`],
  location: {
    '@type': 'Place',
    name: site.brand.city,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.brand.city,
      addressCountry: 'IN',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: site.brand.legalName,
  },
}

export function JsonLd({ page }: { page: 'home' | 'redroom' | 'diwali' }) {
  const payload =
    page === 'home'
      ? [organizationSchema, redRoomEventSchema, diwaliEventSchema]
      : page === 'redroom'
        ? [organizationSchema, redRoomEventSchema]
        : [organizationSchema, diwaliEventSchema]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
