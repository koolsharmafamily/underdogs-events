import React from 'react'
import { site } from '@/content/site'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.underdogs.co.in'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.brand.legalName,
  alternateName: "Nagpur's Party People",
  url: 'https://underdogs.co.in',
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
  endDate: '2026-10-25',
  eventStatus: 'https://schema.org/EventCompleted',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  image: [`${BASE_URL}/media/red-room-poster.webp`],
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
  name: `${site.diwali.title} (${site.diwali.subtitle}) — ${site.brand.legalName}`,
  description: site.diwali.meta.description,
  startDate: '2026-11-07T20:00:00+05:30',
  endDate: '2026-11-08T01:30:00+05:30',
  doorTime: '2026-11-07T20:00:00+05:30',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  image: [`${BASE_URL}/media/dhamaaka-poster-phase1.webp`],
  location: {
    '@type': 'Place',
    name: site.diwali.invitation.rows[2].value,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.brand.city,
      addressCountry: 'IN',
    },
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Couple Phase 1',
      price: '5000',
      priceCurrency: 'INR',
      description: '₹2,500 cover',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Stag Phase 1',
      price: '4000',
      priceCurrency: 'INR',
      description: '₹2,000 cover',
      availability: 'https://schema.org/InStock',
    },
  ],
  organizer: {
    '@type': 'Organization',
    name: site.brand.legalName,
  },
}

export function JsonLd({ page }: { page: 'home' | 'redroom' | 'diwali' }) {
  const payload =
    page === 'home'
      ? [organizationSchema, diwaliEventSchema, redRoomEventSchema]
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
