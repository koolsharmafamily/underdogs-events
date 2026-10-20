import { z } from 'zod'
import { site } from './site'

const internalHrefSchema = z.enum(['/', '/the-red-room', '/diwali'])
const text = z.string().min(1)

const invitationRowSchema = z.object({
  label: text,
  value: text,
  sub: text.optional(),
})

const djSchema = z.object({
  name: text,
  role: text,
  genre: text,
  bio: text,
  date: text,
  venue: text,
  photo: z.string().startsWith('/').nullable(),
})

const worldDoorSchema = z.object({
  kicker: text,
  name: text,
  occasion: text,
  subtitle: text.optional(),
  date: text,
  isoDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  place: text,
  cta: text,
  href: internalHrefSchema,
})

export const siteSchema = z.object({
  brand: z.object({
    name: z.literal('Underdogs'),
    legalName: z.literal('Underdogs Entertainment'),
    city: z.literal('Nagpur'),
    line: z.literal('Gate to Rage'),
    instagram: z.string().regex(/^@[a-z0-9_]+$/),
    season: z.object({ headline: text, tagline: text }),
  }),
  home: z.object({
    meta: z.object({ title: text, description: text }),
    hero: z.object({ label: text, title: text, lead: text, cue: text, seasonCta: text }),
    about: z.object({
      label: text,
      statements: z.tuple([z.string(), z.string(), z.string()]),
      body: text,
    }),
    nights: z.object({
      label: text,
      latestLabel: text,
      latest: z.object({ name: text, detail: text }),
      list: z.array(text).length(13),
    }),
    season: z.object({
      label: text,
      lines: z.tuple([z.string(), z.string(), z.string()]),
      tagline: text,
    }),
    worlds: z.object({ label: text, one: worldDoorSchema, two: worldDoorSchema }),
  }),
  redRoom: z.object({
    meta: z.object({ title: text, description: text }),
    presenter: text,
    kicker: text,
    title: text,
    sub: text,
    jump: text,
    story: z.tuple([z.string(), z.string(), z.string()]),
    dress: z.object({
      lines: z.tuple([z.string(), z.string(), z.string()]),
      warning: text,
    }),
    invitation: z.object({ heading: text, hint: text, rows: z.array(invitationRowSchema).length(5) }),
    dj: djSchema,
    partners: z.object({
      label: text,
      list: z.array(z.object({ role: text, name: text })).min(1),
    }),
    poster: z.object({ src: z.string().startsWith('/'), alt: text }),
    outro: z.object({
      lines: z.tuple([z.string(), z.string()]),
      tagline: text,
      next: z.object({ label: text, href: internalHrefSchema }),
      back: z.object({ label: text, href: internalHrefSchema }),
    }),
  }),
  diwali: z.object({
    meta: z.object({ title: text, description: text }),
    presenter: text,
    kicker: text,
    title: text,
    subtitle: text,
    accent: text,
    sub: text,
    jump: text,
    opener: z.object({ slate: text, skip: text }),
    story: z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
    dj: djSchema.nullable(),
    invitation: z.object({
      kicker: text,
      heading: text,
      // Venue is the name only: no street address until the client confirms one.
      rows: z.array(invitationRowSchema.extend({ sub: z.undefined().optional() })).length(5),
    }),
    partners: z.object({
      label: text,
      list: z.array(z.object({ role: text, name: text })).min(1),
    }),
    nowShowing: z.object({ kicker: text, label: text }),
    poster: z.object({ src: z.string().startsWith('/'), alt: text }),
    outro: z.object({
      tagline: text,
      wish: text,
      other: z.object({ label: text, href: internalHrefSchema }),
      back: z.object({ label: text, href: internalHrefSchema }),
    }),
  }),
  booking: z.object({
    instagram: z.object({
      handle: text,
      url: z.string().url(),
      label: text,
    }),
    phones: z.array(
      z.object({
        display: text,
        tel: text,
      }),
    ),
  }),
  events: z.object({
    meta: z.object({ title: text, description: text }),
    title: text,
    lines: z.tuple([z.string(), z.string()]),
    tagline: text,
    cta: text,
    daysToGo: z.object({ one: text, many: text, today: text }),
  }),
  ui: z.object({
    skipLink: text,
    backToTop: text,
    enterAnyway: text,
    tabs: z.object({ home: text, events: text }),
    backToEvents: text,
    portraitSoon: text,
  }),
  footer: z.object({
    line: text,
    instagram: text,
    copyright: text,
    motion: z.object({ on: text, off: text }),
  }),
  notFound: z.object({ title: text, link: text }),
})

siteSchema.parse(site)
