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
        'Underdogs Entertainment is Nagpur’s party people. This season: two worlds — The Red Room (Halloween, Sat 24 Oct 2026) and DHAMAAKA (Diwali, Sat 7 Nov 2026).',
    },
    hero: {
      label: 'Nagpur’s Party People · Underdogs',
      title: 'Gate to Rage.',
      lead: 'We’re Nagpur’s party people. Underdogs was created to cater to an exclusive niche within Nagpur’s party scene — every night gets its own name, its own look and its own rules.',
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
        'Underdogs was created to cater to an exclusive niche within Nagpur’s party scene. Past nights include Project X, Maison Blanche, Afrochella, Akai Yane, Luau and Anti V — plus our Holi, Diwali and New Year’s Eve editions.',
    },
    // Ready-to-fill past-artist registry (hidden until client assets supplied)
    pastArtists: [] as ReadonlyArray<{
      name: string;
      genre?: string;
      photo: string | null;
    }>,
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
      one: {
        status: 'past' as const,
        kicker: 'World One',
        name: 'The Red Room',
        occasion: 'Halloween',
        date: 'Sat 24 Oct 2026',
        isoDate: '2026-10-24',
        place: 'Millo, Civil Lines, Nagpur',
        pastLabel: 'Happened · Sat 24 Oct 2026',
        cta: 'Enter World One',
        href: '/the-red-room' as const,
      },
      two: {
        status: 'upcoming' as const,
        kicker: 'World Two',
        name: 'DHAMAAKA',
        occasion: 'Diwali 2026',
        subtitle: 'The Karan Johar Edition',
        date: 'Sat 7 Nov 2026',
        time: '8:00 PM – 1:30 AM',
        gatesClose: 'Gates close at 10:00 PM.',
        isoDate: '2026-11-07',
        place: 'Hotel Centre Point, Nagpur',
        cta: 'Enter World Two',
        href: '/diwali' as const,
      },
    },
  },

  redRoom: {
    meta: {
      title: 'The Red Room — Halloween · Underdogs Nagpur',
      description:
        'World One: The Red Room. Halloween with Underdogs — Saturday 24 October 2026 at Millo, Civil Lines, Nagpur. Costumes compulsory.',
    },
    status: 'past' as const,
    pastLabel: 'Happened · Sat 24 Oct 2026',
    thankYou:
      'The Red Room has closed its doors. Thank you, Nagpur, for coming dressed to disturb. See you at the next gate.',
    decorProduction: {
      credit: 'Décor & Production by Rise India',
      logo: assetUrl('/media/rise-india-logo.webp'),
      alt: 'Rise India — Raise Your Expectations',
    },
    nextGate: {
      label: 'The next gate: DHAMAAKA — 7 November',
      href: '/diwali' as const,
    },
    presenter: 'Underdogs present',
    kicker: 'World One · Halloween',
    title: 'The Red Room',
    sub: 'Happened Saturday 24 October 2026 · Millo, Nagpur',
    jump: 'Details',
    story: [
      'This year, we’re opening the doors to a different kind of madness.',
      'A night where the ordinary disappears, the shadows come alive, and the line between fantasy and reality begins to blur.',
      'Halloween is no longer just a celebration. It’s a character you become.',
    ],
    dress: {
      lines: ['Dress to disturb.', 'Dress to deceive.', 'Dress to become someone else.'],
      warning: 'Costumes aren’t optional. Consider this your warning.',
    },
    invitation: {
      heading: 'The Red Room',
      hint: 'Scroll to view record',
      rows: [
        { label: 'Date', value: 'Saturday, 24 October 2026' },
        { label: 'Status', value: 'Happened · Sat 24 Oct 2026' },
        { label: 'Venue', value: 'Millo — Kitchen & Bar',
          sub: '245/U1, East High Court Road, near Zudio, Civil Lines, Nagpur 440001' },
        { label: 'Dress code', value: 'Costumes compulsory' },
        { label: 'Décor & Production', value: 'Rise India' },
      ],
    },
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
      list: [
        { role: 'Décor & production', name: 'Rise India' },
        { role: 'Title partner', name: 'F Salon by FashionTV, Nagpur' },
        { role: 'Venue partner', name: 'Millo — Kitchen & Bar' },
        { role: 'Glam partner', name: 'The Makeup Alchemy' },
        { role: 'Creative experience partner', name: 'Layerz' },
        { role: 'Tech partner', name: 'Kool Korp' },
      ],
    },
    poster: { src: assetUrl("/media/red-room-poster.webp"), alt: 'Official poster: Underdogs present The Red Room, Halloween, Saturday 24 October.' },
    outro: {
      lines: ['The Red Room has closed its doors.', 'Thank you, Nagpur.'],
      tagline: 'This year. Different.',
      next: { label: 'The next gate: DHAMAAKA — 7 November', href: '/diwali' as const },
      back: { label: 'Back to the gate', href: '/' as const },
    },
  },

  diwali: {
    meta: {
      title: 'DHAMAAKA — The Karan Johar Edition · Underdogs Nagpur',
      description:
        'World Two: DHAMAAKA (The Karan Johar Edition) with Underdogs — Saturday 7 November 2026 at Centre Point, Nagpur. NO CTRL presents. Phase 1 Rates: Couple ₹5,000 (₹2,500 cover), Stag ₹4,000 (₹2,000 cover).',
    },
    status: 'upcoming' as const,
    presenter: 'NO CTRL presents',
    kicker: 'World Two · Diwali 2026',
    title: 'DHAMAAKA',
    subtitle: 'The Karan Johar Edition',
    accent: 'दीपावली धमाका',
    date: 'Saturday 7 November 2026',
    time: '8:00 PM – 1:30 AM',
    gatesClose: 'Gates close at 10:00 PM.',
    sub: 'Saturday 7 November 2026 · Centre Point, Nagpur',
    jump: 'Details',
    opener: { slate: 'Diwali 2026', skip: 'Skip' },
    story: ['Two worlds.', 'Two occasions.', 'Two very different nights.', 'You’ve seen one.', 'Now meet the other.'],
    dj: null as null,
    pricing: {
      title: 'Phase 1 Rates',
      rates: [
        { tier: 'Couple', price: '₹5,000', cover: '₹2,500 cover' },
        { tier: 'Stag', price: '₹4,000', cover: '₹2,000 cover' },
      ],
      notice: 'Gates close at 10:00 PM.',
    },
    vipEnclosures: {
      status: 'sold_out' as const,
      notice: 'All VIP Enclosures Sold Out',
    },
    layout: {
      title: 'Venue Layout',
      src: assetUrl('/media/dhamaaka-layout.webp'),
      fullSrc: assetUrl('/media/dhamaaka-layout-full.webp'),
      alt: 'Official Venue Layout — NO CTRL presents DHAMAAKA',
      caption:
        'Reference layout — tables D1–D9 and U1–U4, NO CTRL Lounge, stage and DJ booth, bars, entrances and fire exit.',
    },
    qrEntry: {
      enabled: false,
      src: null as string | null,
      instructions: null as string | null,
    },
    invitation: {
      kicker: 'The invitation',
      heading: 'DHAMAAKA with Underdogs',
      rows: [
        { label: 'Date', value: 'Saturday, 7 November 2026' },
        { label: 'Time', value: '8:00 PM – 1:30 AM', sub: 'Gates close at 10:00 PM.' },
        { label: 'Venue', value: 'Centre Point, Nagpur' },
        { label: 'Phase 1 Rates', value: 'Couple: ₹5,000 · Stag: ₹4,000' },
        { label: 'VIP Enclosures', value: 'All VIP Enclosures Sold Out' },
      ],
    },
    partners: {
      label: 'In association with',
      list: [
        { role: 'Powered by', name: 'Rich Bliss Auto · Rich Bliss Jewels' },
        { role: 'Co-powered by', name: 'F Salon by FashionTV' },
        { role: 'Beverage partner', name: 'Alpha Bull Rum' },
        { role: 'Gifting partner', name: 'Shika Arts' },
        { role: 'Tech partner', name: 'Kool Korp' },
        { role: 'Fashion partner', name: 'Aayush Sachdev Couture' },
        { role: 'Experience partner', name: 'Layerz' },
        { role: 'Travel partner', name: 'Nova Travels' },
      ],
    },
    nowShowing: { kicker: 'Now showing', label: 'The official poster' },
    poster: {
      src: assetUrl('/media/dhamaaka-poster-phase1.webp'),
      fullSrc: assetUrl('/media/dhamaaka-poster-phase1-full.webp'),
      alt: 'Official poster: NO CTRL presents DHAMAAKA — The Karan Johar Edition · Saturday 7 November 2026 · Centre Point, Nagpur.',
    },
    outro: {
      tagline: 'This year, different.',
      wish: 'शुभ दीपावली',
      other: { label: 'The other world: The Red Room', href: '/the-red-room' as const },
      back: { label: 'Back to the gate', href: '/' as const },
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
      description: 'Two worlds. Two celebrations. One unforgettable season. DHAMAAKA (Diwali, Sat 7 Nov 2026) and The Red Room (Halloween, Sat 24 Oct 2026).',
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
