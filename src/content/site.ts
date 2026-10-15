import { z } from 'zod'

export const ANNOUNCING_SOON = 'Announcing soon' as const

export const site = {
  brand: {
    name: 'Underdogs',
    legalName: 'Underdogs Entertainment',
    city: 'Nagpur',
    line: 'Gate to Rage',                         // (client) Instagram bio
    instagram: '@underdogs_nagpur',               // render as PLAIN TEXT only — never a link
    season: {
      headline: 'Two worlds. Two celebrations. One unforgettable season.',  // (client)
      tagline: 'This year, different.',                                     // (client)
    },
  },

  home: {
    meta: {
      title: 'Underdogs — Gate to Rage · Nagpur',
      description:
        'Underdogs Entertainment is a party and entertainment crew from Nagpur. This season: two worlds — The Red Room (Halloween, Sat 24 Oct 2026) and Diwali (Sat 7 Nov 2026).',
    },
    hero: {
      label: 'Underdogs Entertainment — Nagpur',
      title: 'Gate to Rage.',
      lead: 'We’re Nagpur’s party people. Every night we throw gets its own name, its own look and its own rules.',
      cue: 'Enter',
    },
    about: {
      label: 'Who we are',
      statements: [
        'We don’t throw parties. We build worlds — and open the gate.',
        'Every night gets a name, a dress code and a reason to remember it.',
        'Chaos, curated.',
      ],
      body:
        'Underdogs Entertainment is a party and entertainment crew from Nagpur. Past nights include Project X, Maison Blanche, Afrochella, Akai Yane, Luau and Anti V — plus our Holi, Diwali and New Year’s Eve editions.',
    },
    nights: {
      label: 'Nights we’ve thrown',
      latest: { name: 'Project X', detail: '22 Aug 2026 · Pablo, Nagpur' },   // (client) caption
      // (client) Instagram highlights, newest first
      list: ['Project X', 'Retro Holi', 'Anti V', 'Diwali 2k25', 'Holi 2k25', 'Maison Blanche',
             'Afrochella', 'Akai Yane', 'NYE 2024', 'Diwali 2k24', 'Luau', 'Holi 2k24', 'NYE 2k23'],
    },
    season: {
      label: 'This season',
      lines: ['Two worlds.', 'Two celebrations.', 'One unforgettable season.'],
      tagline: 'This year, different.',
    },
    worlds: {
      label: 'Choose a door',
      one: { kicker: 'World One', name: 'The Red Room', occasion: 'Halloween',
             date: 'Sat 24 Oct 2026', place: 'Millo, Civil Lines, Nagpur',
             cta: 'Enter World One', href: '/the-red-room' },
      two: { kicker: 'World Two', name: 'DHAMAAKA', occasion: 'Diwali 2026',
             subtitle: 'The Karan Johar Edition',
             date: 'Sat 7 Nov 2026', place: 'Centre Point, Nagpur',
             cta: 'Enter World Two', href: '/diwali' },
    },
  },

  redRoom: {
    meta: {
      title: 'The Red Room — Halloween · Underdogs Nagpur',
      description:
        'World One: The Red Room. Halloween with Underdogs — Saturday 24 October 2026 at Millo, Civil Lines, Nagpur. Costumes compulsory.',
    },
    presenter: 'Underdogs present',               // (client) poster
    kicker: 'World One · Halloween',
    title: 'The Red Room',
    sub: 'Saturday 24 October 2026 · Millo, Nagpur',
    jump: 'Details',
    story: [                                       // (client) caption, verbatim
      'This year, we’re opening the doors to a different kind of madness.',
      'A night where the ordinary disappears, the shadows come alive, and the line between fantasy and reality begins to blur.',
      'Halloween is no longer just a celebration. It’s a character you become.',
    ],
    dress: {                                       // (client) caption, verbatim
      lines: ['Dress to disturb.', 'Dress to deceive.', 'Dress to become someone else.'],
      warning: 'Costumes aren’t optional. Consider this your warning.',
    },
    invitation: {
      heading: 'The Red Room',
      rows: [
        { label: 'Date', value: 'Saturday, 24 October 2026' },
        { label: 'Time', value: ANNOUNCING_SOON },
        { label: 'Venue', value: 'Millo — Kitchen & Bar',
          sub: '245/U1, East High Court Road, near Zudio, Civil Lines, Nagpur 440001' },
        { label: 'Dress code', value: 'Costumes compulsory' },
        { label: 'Entry', value: ANNOUNCING_SOON },
      ],
    },
    dj: {
      name: 'DJ Mohnish',
      role: 'Headline Artist · The Red Room Halloween',
      genre: 'Afro-House · Dark Commercial · High-Energy Club Anthems',
      bio: "Nagpur's premier nightlife authority and resident crowd-controller at Millo Nagpur. Renowned for electrifying dancefloors with signature high-octane transitions, dark Afro-house grooves, and pulse-pounding commercial anthems, DJ Mohnish takes control of the decks for an unforgettable Halloween descent into The Red Room.",
      venue: 'Millo — Kitchen & Bar, Civil Lines, Nagpur',
      date: 'Saturday 24 October 2026',
    },
    partners: {
      label: 'In association with',
      list: [                                      // (client) poster + caption
        { role: 'Title partner', name: 'F Salon by FashionTV, Nagpur' },
        { role: 'Venue partner', name: 'Millo — Kitchen & Bar' },
        { role: 'Glam partner', name: 'The Makeup Alchemy' },
        { role: 'Creative experience partner', name: 'Layerz' },
        { role: 'Tech partner', name: 'Kool Korp' },
      ],
    },
    poster: { src: '/media/red-room-poster.webp', alt: 'Official poster: Underdogs present The Red Room, Halloween, save the date 24 October.' },
    outro: {
      lines: ['Enter the world of Red Room.', 'The first world awaits.'],   // (client)
      tagline: 'This year. Different.',                                    // (client)
      next: { label: 'Now meet the other', href: '/diwali' },
      back: { label: 'Back to the gate', href: '/' },
    },
  },

  diwali: {
    meta: {
      title: 'DHAMAAKA — The Karan Johar Edition · Underdogs Nagpur',
      description:
        'World Two: DHAMAAKA (The Karan Johar Edition) with Underdogs — Saturday 7 November 2026 at Centre Point, Nagpur. NO CTRL presents.',
      ogImage: '/media/dhamaaka-flyer.webp',
    },
    presenter: 'NO CTRL presents',
    titleCard: { presenter: 'NO CTRL presents', title: ['This year,', 'different.'] },
    kicker: 'World Two · Diwali 2026',
    title: 'DHAMAAKA',
    subtitle: 'The Karan Johar Edition',
    accent: 'दीपावली धमाका',
    sub: 'Saturday 7 November 2026 · Centre Point, Nagpur',
    jump: 'Details',
    story: ['Two worlds.', 'Two occasions.', 'Two very different nights.', 'You’ve seen one.', 'Now meet the other.'],
    dj: {
      name: 'DJ Yogi',
      role: 'Headline Artist · Diwali DHAMAAKA',
      genre: 'Bollywood-EDM · Festival Anthems · Celebrity Remixes',
      bio: "One of India's most celebrated Bollywood-EDM powerhouses and official remix producer for chart-toppers like Neha Kakkar, Badshah, and Guru Randhawa. Having set stages ablaze across Mumbai, Delhi, Dubai, and New York, DJ Yogi brings festival-grade euphoria and massive celebratory anthems to headline Nagpur's royal Diwali DHAMAAKA.",
      date: 'Saturday 7 November 2026',
      venue: 'Centre Point, Nagpur',
    },
    venue: {
      name: 'Centre Point, Nagpur',
      address: '24 Central Bazar Road, Ramdaspeth, Nagpur 440010',
    },
    invitation: {
      heading: 'DHAMAAKA with Underdogs',
      rows: [
        { label: 'Date', value: 'Saturday, 7 November 2026' },
        { label: 'Time', value: ANNOUNCING_SOON },
        {
          label: 'Venue',
          value: 'Centre Point, Nagpur',
          sub: '24 Central Bazar Road, Ramdaspeth, Nagpur 440010',
        },
        { label: 'Theme & dress code', value: ANNOUNCING_SOON },
        { label: 'Entry', value: ANNOUNCING_SOON },
      ],
    },
    partners: {
      label: 'In Association With',
      list: [
        { role: 'Powered by', name: 'Rich Bliss Auto · Rich Bliss Jewels' },
        { role: 'Co-powered by', name: 'F Salon by FashionTV' },
        { role: 'Beverage partner', name: 'Alpha Bull Rum' },
        { role: 'Gifting partner', name: 'Shika Arts' },
        { role: 'Experience partner', name: 'Layerz' },
        { role: 'Fashion partner', name: 'Aayush Sachdev Couture' },
        { role: 'Tech partner', name: 'Kool Korp' },
        { role: 'Travel partner', name: 'Nova Travels' },
      ],
    },
    poster: { src: '/media/dhamaaka-flyer.webp', alt: 'Official flyer: NO CTRL presents DHAMAAKA — The Karan Johar Edition, Diwali 2026 at Centre Point, Nagpur.' },
    teaser: { src: '/media/dhamaaka-flyer.webp', alt: 'Official flyer: NO CTRL presents DHAMAAKA — The Karan Johar Edition, Diwali 2026 at Centre Point, Nagpur.' },
    outro: {
      tagline: 'This year, different.',
      wish: 'शुभ दीपावली',
      other: { label: 'The other world: The Red Room', href: '/the-red-room' },
      back: { label: 'Back to the gate', href: '/' },
    },
  },

  footer: {
    line: 'Underdogs Entertainment · Nagpur',
    instagram: 'Instagram: @underdogs_nagpur',     // plain text
    copyright: '© 2026 Underdogs Entertainment',
    motion: { on: 'Motion: On', off: 'Motion: Off' },
  },

  notFound: { title: 'This door doesn’t open.', link: 'Back to the gate' },
} as const

const internalHrefSchema = z.enum(['/', '/the-red-room', '/diwali'])

const invitationRowSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  sub: z.string().min(1).optional(),
})

export const siteSchema = z.object({
  brand: z.object({
    name: z.literal('Underdogs'),
    legalName: z.literal('Underdogs Entertainment'),
    city: z.literal('Nagpur'),
    line: z.literal('Gate to Rage'),
    instagram: z.string().regex(/^@[a-z0-9_]+$/),
    season: z.object({
      headline: z.string().min(1),
      tagline: z.string().min(1),
    }),
  }),
  home: z.object({
    meta: z.object({ title: z.string().min(1), description: z.string().min(1) }),
    hero: z.object({
      label: z.string().min(1),
      title: z.string().min(1),
      lead: z.string().min(1),
      cue: z.string().min(1),
    }),
    about: z.object({
      label: z.string().min(1),
      statements: z.tuple([z.string(), z.string(), z.string()]),
      body: z.string().min(1),
    }),
    nights: z.object({
      label: z.string().min(1),
      latest: z.object({ name: z.string().min(1), detail: z.string().min(1) }),
      list: z.array(z.string().min(1)).length(13),
    }),
    season: z.object({
      label: z.string().min(1),
      lines: z.tuple([z.string(), z.string(), z.string()]),
      tagline: z.string().min(1),
    }),
    worlds: z.object({
      label: z.string().min(1),
      one: z.object({
        kicker: z.string().min(1),
        name: z.string().min(1),
        occasion: z.string().min(1),
        date: z.string().min(1),
        place: z.string().min(1),
        cta: z.string().min(1),
        href: internalHrefSchema,
      }),
      two: z.object({
        kicker: z.string().min(1),
        name: z.string().min(1),
        occasion: z.string().min(1),
        subtitle: z.string().min(1).optional(),
        date: z.string().min(1),
        place: z.string().min(1),
        cta: z.string().min(1),
        href: internalHrefSchema,
      }),
    }),
  }),
  redRoom: z.object({
    meta: z.object({ title: z.string().min(1), description: z.string().min(1) }),
    presenter: z.string().min(1),
    kicker: z.string().min(1),
    title: z.string().min(1),
    sub: z.string().min(1),
    jump: z.string().min(1),
    story: z.tuple([z.string(), z.string(), z.string()]),
    dress: z.object({
      lines: z.tuple([z.string(), z.string(), z.string()]),
      warning: z.string().min(1),
    }),
    invitation: z.object({
      heading: z.string().min(1),
      rows: z.array(invitationRowSchema).length(5),
    }),
    dj: z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      genre: z.string().min(1),
      bio: z.string().min(1),
      venue: z.string().optional(),
      date: z.string().min(1),
    }).optional(),
    partners: z.object({
      label: z.string().min(1),
      list: z.array(z.object({ role: z.string().min(1), name: z.string().min(1) })).min(1),
    }),
    poster: z.object({ src: z.string().startsWith('/'), alt: z.string().min(1) }),
    outro: z.object({
      lines: z.tuple([z.string(), z.string()]),
      tagline: z.string().min(1),
      next: z.object({ label: z.string().min(1), href: internalHrefSchema }),
      back: z.object({ label: z.string().min(1), href: internalHrefSchema }),
    }),
  }),
  diwali: z.object({
    meta: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      ogImage: z.string().optional(),
    }),
    presenter: z.string().min(1).optional(),
    titleCard: z.object({
      presenter: z.string().min(1),
      title: z.tuple([z.string(), z.string()]),
    }).optional(),
    kicker: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    accent: z.string().min(1),
    sub: z.string().min(1),
    jump: z.string().min(1),
    story: z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
    dj: z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      genre: z.string().min(1),
      bio: z.string().min(1),
      date: z.string().min(1),
      venue: z.string().optional(),
    }).optional(),
    venue: z.object({
      name: z.string().min(1),
      address: z.string().min(1),
    }).optional(),
    invitation: z.object({
      heading: z.string().min(1),
      rows: z.array(invitationRowSchema).length(5),
    }),
    partners: z.object({
      label: z.string().min(1),
      list: z.array(z.object({ role: z.string().min(1), name: z.string().min(1) })).min(1),
    }).optional(),
    poster: z.object({ src: z.string().startsWith('/'), alt: z.string().min(1) }).optional(),
    teaser: z.object({ src: z.string().startsWith('/'), alt: z.string().min(1) }),
    outro: z.object({
      tagline: z.string().min(1),
      wish: z.string().min(1),
      other: z.object({ label: z.string().min(1), href: internalHrefSchema }),
      back: z.object({ label: z.string().min(1), href: internalHrefSchema }),
    }),
  }),
  footer: z.object({
    line: z.string().min(1),
    instagram: z.string().min(1),
    copyright: z.string().min(1),
    motion: z.object({ on: z.string().min(1), off: z.string().min(1) }),
  }),
  notFound: z.object({
    title: z.string().min(1),
    link: z.string().min(1),
  }),
})

siteSchema.parse(site)

export type SiteContent = typeof site
