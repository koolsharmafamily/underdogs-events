import { assetUrl } from "@/utils/assetUrl";

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
        'Underdogs Entertainment is a party and entertainment crew from Nagpur. This season: two worlds — The Red Room (Halloween, Sat 24 Oct 2026) and DHAMAAKA (Diwali, Sat 7 Nov 2026).',
    },
    hero: {
      label: 'Underdogs Entertainment — Nagpur',
      title: 'Gate to Rage.',
      lead: 'We’re Nagpur’s party people. Every night we throw gets its own name, its own look and its own rules.',
      cue: 'Enter',
      seasonCta: 'This season',
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
      latestLabel: 'Latest',
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
             date: 'Sat 24 Oct 2026', isoDate: '2026-10-24', place: 'Millo, Civil Lines, Nagpur',
             cta: 'Enter World One', href: '/the-red-room' },
      two: { kicker: 'World Two', name: 'DHAMAAKA', occasion: 'Diwali 2026',
             subtitle: 'The Karan Johar Edition',
             date: 'Sat 7 Nov 2026', isoDate: '2026-11-07', place: 'Hotel Centre Point, Nagpur',
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
      hint: 'Scroll to break the seal',
      rows: [
        { label: 'Date', value: 'Saturday, 24 October 2026' },
        { label: 'Time', value: ANNOUNCING_SOON },
        { label: 'Venue', value: 'Millo — Kitchen & Bar',
          sub: '245/U1, East High Court Road, near Zudio, Civil Lines, Nagpur 440001' },
        { label: 'Dress code', value: 'Costumes compulsory' },
        { label: 'Entry', value: ANNOUNCING_SOON },
      ],
    },
    // (client) confirmed headline artist, 15 Oct 2026. `photo` stays null until the client sends one.
    dj: {
      name: 'DJ Monish',
      role: 'Headline Artist · The Red Room Halloween',
      genre: 'Afro-House · Dark Commercial · High-Energy Club Anthems',
      bio: "Nagpur's premier nightlife authority and resident crowd-controller at Millo Nagpur. Renowned for electrifying dancefloors with signature high-octane transitions, dark Afro-house grooves, and pulse-pounding commercial anthems, DJ Monish takes control of the decks for an unforgettable Halloween descent into The Red Room.",
      venue: 'Millo — Kitchen & Bar, Civil Lines, Nagpur',
      date: 'Saturday 24 October 2026',
      photo: null as string | null,
    },
    partners: {
      label: 'In association with',
      list: [                                      // (client) poster + caption; tech partner confirmed 15 Oct 2026
        { role: 'Title partner', name: 'F Salon by FashionTV, Nagpur' },
        { role: 'Venue partner', name: 'Millo — Kitchen & Bar' },
        { role: 'Glam partner', name: 'The Makeup Alchemy' },
        { role: 'Creative experience partner', name: 'Layerz' },
        { role: 'Tech partner', name: 'Kool Korp' },
      ],
    },
    poster: { src: assetUrl("/media/red-room-poster.webp"), alt: 'Official poster: Underdogs present The Red Room, Halloween, save the date 24 October.' },
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
        'World Two: DHAMAAKA (The Karan Johar Edition) with Underdogs — Saturday 7 November 2026 at Hotel Centre Point, Nagpur. NO CTRL presents.',
    },
    presenter: 'NO CTRL presents',
    kicker: 'World Two · Diwali 2026',
    title: 'DHAMAAKA',
    subtitle: 'The Karan Johar Edition',
    accent: 'दीपावली धमाका',
    sub: 'Saturday 7 November 2026 · Hotel Centre Point, Nagpur',
    jump: 'Details',
    opener: { slate: 'Diwali 2026', skip: 'Skip' },
    story: ['Two worlds.', 'Two occasions.', 'Two very different nights.', 'You’ve seen one.', 'Now meet the other.'],
    dj: null as null,
    invitation: {
      kicker: 'The invitation',
      heading: 'DHAMAAKA with Underdogs',
      rows: [
        { label: 'Date', value: 'Saturday, 7 November 2026' },
        { label: 'Time', value: ANNOUNCING_SOON },
        { label: 'Venue', value: 'Hotel Centre Point, Nagpur' },
        { label: 'Theme & dress code', value: ANNOUNCING_SOON },
        { label: 'Entry', value: ANNOUNCING_SOON },
      ],
    },
    partners: {
      label: 'In association with',
      list: [
        { role: 'Powered by', name: 'Rich Bliss Auto · Rich Bliss Jewels' },
        { role: 'Co-powered by', name: 'F Salon by FashionTV' },
        { role: 'Venue partner', name: 'Hotel Centre Point' },
        { role: 'Beverage partner', name: 'Alpha Bull Rum' },
        { role: 'Gifting partner', name: 'Shika Arts' },
        { role: 'Experience partner', name: 'Layerz' },
        { role: 'Fashion partner', name: 'Aayush Sachdev Couture' },
        { role: 'Tech partner', name: 'Kool Korp' },
        { role: 'Travel partner', name: 'Nova Travels' },
      ],
    },
    nowShowing: { kicker: 'Now showing', label: 'The official flyer' },
    poster: { src: assetUrl("/media/dhamaaka-flyer.webp"), alt: 'Official flyer: NO CTRL presents DHAMAAKA — The Karan Johar Edition, Diwali 2026 at Hotel Centre Point, Nagpur.' },
    outro: {
      tagline: 'This year, different.',
      wish: 'शुभ दीपावली',
      other: { label: 'The other world: The Red Room', href: '/the-red-room' },
      back: { label: 'Back to the gate', href: '/' },
    },
  },

  booking: {
    instagram: {
      handle: '@underdogs_nagpur',
      url: 'https://www.instagram.com/underdogs_nagpur/',
      label: 'Official Instagram · @underdogs_nagpur',
    },
    phones: [
      { display: '+91 90491 00002', tel: '+919049100002' },
      { display: '+91 98231 77648', tel: '+919823177648' },
      { display: '+91 72762 05656', tel: '+917276205656' },
      { display: '+91 96891 93505', tel: '+919689193505' },
    ],
  },

  events: {
    meta: {
      title: 'Events · Underdogs Nagpur',
      description: 'Two worlds. Two celebrations. One unforgettable season. The Red Room (Halloween, Sat 24 Oct 2026) and DHAMAAKA (Diwali, Sat 7 Nov 2026).',
    },
    title: 'This season',
    lines: ['Two worlds.', 'Two celebrations.'],
    tagline: 'This year, different.',
    cta: 'Step inside',
    daysToGo: { one: 'day to go', many: 'days to go', today: 'Tonight' },
  },

  ui: {
    skipLink: 'Skip to content',
    backToTop: 'Back to top',
    enterAnyway: 'Enter anyway',
    tabs: { home: 'Home', events: 'Events' },
    backToEvents: 'Events',
    portraitSoon: 'Portrait',
  },

  footer: {
    line: 'Underdogs Entertainment · Nagpur',
    instagram: 'Instagram: @underdogs_nagpur',     // plain text
    copyright: '© 2026 Underdogs Entertainment',
    motion: { on: 'Motion: On', off: 'Motion: Off' },
  },

  notFound: { title: 'This door doesn’t open.', link: 'Back to the gate' },
} as const

export type SiteContent = typeof site
