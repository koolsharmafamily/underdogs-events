# UNDERDOGS — "TWO WORLDS"
### Master build prompt for Google Antigravity · model: Gemini 3.8 Flash · Planning mode

> **For you, the human. Read this box once; the agent can skip it.**
>
> **Before you start**
> 1. Get the **clean Underdogs logo** (SVG ideally, or a PNG at least 2000 px). The `Underdogs Logo.png` in the folder is a phone screenshot with a faint "©SM…LOGO" watermark across it, so it is a reference only and must never ship.
> 2. Run the Claude Design prompts in `03_CLAUDE_DESIGN_3D_PROMPTS.md` and save what they export (`.glb` files and `.js` modules) with the exact names listed in Appendix A. The agent builds stand-in shapes for anything that's missing, so you can start before these are done.
>
> **Setting up**
> 3. Create a new empty folder (e.g. `underdogs-two-worlds`), open it in Antigravity, and save this file in its root as **`BRIEF.md`**.
> 4. Inside it, create `brand-source/` and copy in:
>    - the five files from your "Underdogs Events" folder;
>    - the `reference/` crops;
>    - your clean logo, as `brand-source/underdogs-logo.svg`;
>    - the Claude Design exports, into `brand-source/3d/`.
> 5. In the Agent Manager, pick **Gemini 3.8 Flash**, choose **Planning** mode and send the kickoff message below.
>
> **While it builds**
> 6. At the end of each phase the agent stops and shows screenshots. Comment on its artifacts, then approve the next phase.
>
> **Kickoff message (paste this into Antigravity):**
> ```
> Read BRIEF.md completely before writing any code. Then write an Implementation Plan for Phase 0 only (Part 14). Build one phase at a time. At the end of every phase: stop, open the site in the browser, take screenshots at 1440×900 and 390×844 (plus a short recording of any transition), put them in the walkthrough, report against that phase's acceptance criteria, and wait for my approval. Never invent content — anything not in Part 3 of BRIEF.md renders as "Announcing soon".
> ```

---

## PART 0 — NON-NEGOTIABLES (these win every conflict)

1. **Informative only.** The site has no booking, RSVP, tickets, payments, forms, newsletter, login, cart or chat. It has **no outbound links of any kind**: no Instagram, WhatsApp, Google Maps, ticketing or "link in bio" buttons. The only links go between the three pages of the site.
2. **Never invent facts.** Use only the content in Part 3. Anything unknown renders as **"Announcing soon"**. Don't add prices, times, lineups, DJs, capacities, testimonials or statistics.
3. **DOM first.** Every word lives in semantic HTML, and WebGL only enhances it. With WebGL disabled the site must still be complete, readable and navigable.
4. **One persistent canvas** is mounted in the root layout and never unmounts between routes. The Underdogs badge lives in it and travels between pages.
5. **Smoothness is the product:**
   - 60 fps on desktop and at least 45 fps on mid-range phones.
   - Motion is frame-rate independent.
   - Quality adapts to the device.
   - No shader compiles happen after loading.
   - No layout shift.
6. **Accessibility:**
   - `prefers-reduced-motion` is honoured, and there is an in-site Motion toggle.
   - Everything works by keyboard.
   - Text contrast is at least 4.5:1.
   - Every interactive 3D object has an accessible DOM twin.
7. **Build only what this brief asks for.** If you think something is missing, propose it in your phase report; don't build it.
8. **Precedence:** Part 0 › Part 12 (accessibility and performance) › Part 15 (Do not) › the scene specs (Parts 7–10) › everything else.
9. **Ambiguity:** pick the quieter, slower, more physically believable option and record the choice in your report.

---

## PART 1 — THE PROJECT ON ONE PAGE

| | |
|---|---|
| **Client** | **Underdogs Entertainment** ("Underdogs"), a party and entertainment crew in **Nagpur**. Instagram `@underdogs_nagpur`. Their own line: **"GATE TO RAGE"**. |
| **Season campaign** | **"TWO WORLDS. TWO CELEBRATIONS. ONE UNFORGETTABLE SEASON."** Tagline: **"THIS YEAR, DIFFERENT."** |
| **Pages** | `/` **Home, "The Gate"**: who Underdogs is, the nights they've thrown, this season, and two doors. · `/the-red-room` **World One, The Red Room** (Halloween, Sat 24 Oct 2026, Millo, Nagpur). · `/diwali` **World Two, Diwali** (Sat 7 Nov 2026, other details announcing soon). |
| **Protagonist** | The **Underdogs badge** (the round logo with the X-eyed, tongue-out face) as a real 3D object. It greets you at the gate, follows you through a door and **changes its skin to belong to that world**: **Enamel** (Home) → **Neon** (Red Room) → **Jewelled** (Diwali). |
| **Quality bar** | The best event and creative-studio websites: cinematic, tactile, fast and uncluttered. Every scroll position should look like a composed film still. |
| **Stack** | Next.js (App Router) + TypeScript · three.js via React Three Fiber + drei · pmndrs postprocessing · GSAP (ScrollTrigger, SplitText, CustomEase) · Lenis · zustand · Tailwind CSS v4 · deployed on Vercel (Part 13). |

---

## PART 2 — CREATIVE DIRECTION

### 2.1 Concept: "Gate to Rage → Two Worlds"

Underdogs' Instagram line is **GATE TO RAGE**, and their season campaign is **TWO WORLDS**, so the site is built on exactly that.

- The **home page is the Gate**: the Underdogs world in its own colours (magenta, ink, white), confident and loud but premium.
- At the bottom of the Gate stand **two doors**. Each opens into a world with its own light, materials, tempo and typography.
- The **badge is the host**. It blinks at you, sticks its tongue out, looks at the door you hover, walks through with you, and re-skins to belong wherever you've gone.
- Visitors should feel they **travelled**, not that they clicked to another page.

### 2.2 The three worlds at a glance

| | **HOME: The Gate** | **WORLD ONE: The Red Room** | **WORLD TWO: Diwali** |
|---|---|---|---|
| Feeling | Hype, identity, swagger | Seduction, dread, mystery | Glamour, joy, filmy grandeur |
| Reference (principles only) | A club stage at soundcheck: haze, beams, one hero object | A Victorian gothic boudoir: candlelight, velvet, gilt, a secret invitation | Karan Johar Diwali scenes: pink, white and gold, chandeliers, diyas, velvet; desi with a modern touch |
| Light | Dark stage, magenta rim light, slow sweeping beams in haze | Flickering candlelight plus red neon; deep shadow | Warm gold key, pink fill, sparkle; the brightest world |
| Surfaces | Enamel, chrome, glossy black | Velvet, wax, tarnished gilt, black lacquer, smoke | Rani-pink velvet, zari gold, enamel, diamonds, clay diyas, rose petals |
| Tempo | Snappy UI (0.3–0.6 s); world moves 1.2–1.6 s | Slow and sensual (1.6–2.4 s) | Graceful (1.0–1.8 s), punctuated by fireworks |
| Badge skin | **Enamel**: magenta ring, white letters, ink face, chrome edge | **Neon**: red neon tubes, black glass, blood drips | **Jewelled**: gold zari rim, rani-pink enamel, emeralds, diamond-pavé eyes and tongue |
| Signature moment | The badge blinks, wags its tongue and looks at the door you hover | A dragon of red smoke and embers coils around the neon badge; a wax seal breaks | A film title card; the jewelled badge glints; fireworks burst beyond the velvet |
| Composition | Asymmetric: badge right, text left | Ceremonial and centred, like the posters | Ceremonial and centred, like the posters |
| Cursor | White ✕ (from the logo's eyes) | Ember-red dot with a soft glow | Gold four-point sparkle ✦ |

### 2.3 Voice

Use Underdogs' own register: short, punchy, irreverent, a little dangerous ("Bring the squad, lose the plot", "Dress to disturb").
- Uppercase for statements; sentence case for body copy.
- No corporate words: never "premier", "curated experiences", "unleash", "elevate", "next-level" or "world-class".
- Where Part 3 quotes the client's published lines, use them verbatim.

### 2.4 Principles behind the quality bar

- **P1, one idea fully executed.** The badge travels through the Gate into Two Worlds. Fewer effects, each one perfect.
- **P2, physicality.** Everything has mass. Springs, inertia and settling; no linear motion, no instant stops.
- **P3, light is the art director.** Colour comes from light and material, not from flat paint.
- **P4, typographic contrast.** Huge display type next to tiny precise labels, and almost nothing in between.
- **P5, continuity.** One canvas, one camera and one badge across all pages. Transitions carry objects across boundaries.
- **P6, choreography.** One lead motion at a time: the world moves first, then the words (Part 6.4).
- **P7, restraint.** Most of every frame is dark or empty. Bloom is a whisper. At most three text blocks are on screen at once.
- **P8, texture.** Film grain over everything, and dithering in WebGL, so the CG feels photographed.
- **P9, invisible engineering.** No pop-in, no jank, no layout shift, honest loading, and content that's readable within 1.2 s.

---

## PART 3 — CONTENT (the only source of truth)

Create `src/content/site.ts` with exactly the content below and validate it with zod at build time. Every component reads from this file, and no copy is hard-coded anywhere else. Lines marked *(client)* are the client's own published copy; use them verbatim.

```ts
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
      label: '(01) Who we are',
      statements: [
        'We don’t throw parties. We build worlds — and open the gate.',
        'Every night gets a name, a dress code and a reason to remember it.',
        'Chaos, curated.',
      ],
      body:
        'Underdogs Entertainment is a party and entertainment crew from Nagpur. Past nights include Project X, Maison Blanche, Afrochella, Akai Yane, Luau and Anti V — plus our Holi, Diwali and New Year’s Eve editions.',
    },
    nights: {
      label: '(02) Nights we’ve thrown',
      latest: { name: 'Project X', detail: '22 Aug 2026 · Pablo, Nagpur' },   // (client) caption
      // (client) Instagram highlights, newest first
      list: ['Project X', 'Retro Holi', 'Anti V', 'Diwali 2k25', 'Holi 2k25', 'Maison Blanche',
             'Afrochella', 'Akai Yane', 'NYE 2024', 'Diwali 2k24', 'Luau', 'Holi 2k24', 'NYE 2k23'],
    },
    season: {
      label: '(03) This season',
      lines: ['Two worlds.', 'Two celebrations.', 'One unforgettable season.'],
      tagline: 'This year, different.',
    },
    worlds: {
      label: '(04) Choose a door',
      one: { kicker: 'World One', name: 'The Red Room', occasion: 'Halloween',
             date: 'Sat 24 Oct 2026', place: 'Millo, Civil Lines, Nagpur',
             cta: 'Enter World One', href: '/the-red-room' },
      two: { kicker: 'World Two', name: 'Diwali', occasion: 'Festival of lights',
             date: 'Sat 7 Nov 2026', place: `Venue: ${ANNOUNCING_SOON}`,
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
    partners: {
      label: 'In association with',
      list: [                                      // (client) poster + caption
        { role: 'Title partner', name: 'F Salon by FashionTV, Nagpur' },
        { role: 'Venue partner', name: 'Millo — Kitchen & Bar' },
        { role: 'Glam partner', name: 'The Makeup Alchemy' },
        { role: 'Creative experience partner', name: 'Layerz' },
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
      title: 'Diwali — World Two · Underdogs Nagpur',
      description:
        'World Two: Diwali with Underdogs — Saturday 7 November 2026, Nagpur. Venue and details announcing soon.',
    },
    titleCard: { presenter: 'Underdogs present', title: ['This year,', 'different.'] },
    kicker: 'World Two · Diwali',
    title: 'Diwali',
    accent: 'दीपावली',
    sub: 'Saturday 7 November 2026 · Nagpur',
    jump: 'Details',
    story: ['Two worlds.', 'Two occasions.', 'Two very different nights.', 'You’ve seen one.', 'Now meet the other.'], // (client)
    invitation: {
      heading: 'Diwali with Underdogs',
      rows: [
        { label: 'Date', value: 'Saturday, 7 November 2026' },
        { label: 'Time', value: ANNOUNCING_SOON },
        { label: 'Venue', value: ANNOUNCING_SOON },
        { label: 'Theme & dress code', value: ANNOUNCING_SOON },
        { label: 'Entry', value: ANNOUNCING_SOON },
      ],
    },
    teaser: { src: '/media/diwali-teaser.webp', alt: 'Official teaser: Underdogs — This year, different. A palace courtyard at night with pink fireworks.' },
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
```

**Rules for "Announcing soon":**
- Render it in italic with a small 6 px pulsing dot in the world's accent colour, so it reads as "coming", not "missing".
- When the client fills in a value later, the dot disappears automatically.

---

## PART 4 — DESIGN SYSTEM

### 4.1 Colour tokens

Colours were sampled from the client's logos and posters. Define them as CSS custom properties, switched by `data-world="home|redroom|diwali"` on `<html>`, and mirror them in `src/theme/tokens.ts` for WebGL.

**Home: The Gate**

| Token | Hex | Use |
|---|---|---|
| `--void` | `#07090D` | Page and stage background |
| `--haze` | `#121722` | Fog, raised surfaces |
| `--ink` | `#10171F` | The logo's face colour |
| `--magenta` | `#D73EBC` | The logo ring (exact); accents, focus |
| `--magenta-hot` | `#FF4FD8` | **Light and emission only** (rim light, beams) |
| `--magenta-tint` | `#F6BFF8` | Hover tints |
| `--paper` | `#FCF9FC` | Primary text |
| `--steel` | `#8C93A3` | Secondary text on `--void` |
| `--chrome` | `#D9DCE3` | 3D only |

**The Red Room**

| Token | Hex | Use |
|---|---|---|
| `--rr-void` | `#060101` | Background |
| `--rr-oxblood` | `#2A0403` | Deep surfaces |
| `--rr-velvet` | `#510805` | Velvet in shadow |
| `--rr-velvet-lit` | `#7C0F0C` | Velvet in light |
| `--rr-blood` | `#95120E` | Hairlines, drips |
| `--rr-neon` | `#FF2A1F` | Neon, accents, focus (≤ 5% of any frame) |
| `--rr-candle` | `#FFB36B` | **Light only** |
| `--rr-gilt` | `#C8A15A` | Frames, ornaments |
| `--rr-bone` | `#EFD9CD` | Primary text, card paper |
| `--rr-ash` | `#A88C80` | Secondary text |

**Diwali**

| Token | Hex | Use |
|---|---|---|
| `--dw-night` | `#14161F` | Title card, sky |
| `--dw-rani` | `#C5287B` | Enamel and lit velvet (from the Diwali logo) |
| `--dw-rani-deep` | `#7E1347` | Velvet in shadow, text panels |
| `--dw-blush` | `#F7CFE0` | Petals, soft fills |
| `--dw-ivory` | `#FFF6EE` | Primary text on dark; card paper |
| `--dw-gold` | `#C6A76A` | Ornaments, zari |
| `--dw-gold-deep` | `#AD7F42` | Shading, borders |
| `--dw-gold-bright` | `#F2D38B` | Highlights; display text on dark |
| `--dw-emerald` | `#157A4F` | Gem accents (≤ 2%) |
| `--dw-maroon` | `#5B0E0B` | Sparingly (the logo's brocade) |
| `--dw-plum-ink` | `#2A0E1B` | Text on ivory |

**Contrast rules (enforced, at least 4.5:1 for text):**
- Allowed: paper on void; magenta on void (large text only); bone on rr-void; neon on rr-void (display only); ivory on rani, rani-deep or night; gold-bright on rani-deep or night; rani-deep or plum-ink on ivory.
- **Never** set text in gold or gold-deep on rani or ivory; use those only for ornaments.

### 4.2 Typography

All fonts come from Google Fonts via `next/font/google` (`display: 'swap'`, fallback metrics adjusted). Each route loads only its own families, and only the hero face of each route is preloaded.

| Role | Family | Where |
|---|---|---|
| Brand display | **Unbounded** (variable 200–900) | Home H1 and statements, the nights marquee |
| Ceremonial caps | **Cinzel** (400–700) | "UNDERDOGS PRESENT", kickers, invitation labels, partner roles, all small tracked caps (it matches the posters' engraved capitals) |
| Red Room title | **Cinzel Decorative** (700, 900) | "THE RED ROOM" |
| Red Room story | **Cormorant Garamond** Italic (500) | The story lines |
| Diwali display | **Bodoni Moda** (variable, with italics) | "Diwali", the story lines, the invitation heading |
| Devanagari accent | **Tiro Devanagari Hindi** (with italic) | "दीपावली", "शुभ दीपावली" (load the `devanagari` subset on `/diwali` only) |
| Body | **Manrope** (400–600) | All paragraphs and values |
| Labels and data | **JetBrains Mono** (400) | Home labels, counters (tabular numerals) |

**Type scale:**

| Token | Size | Line height | Tracking |
|---|---|---|---|
| `display-xl` | `clamp(56px, 10vw, 184px)` | 0.9 | −0.03em |
| `display-l` | `clamp(36px, 6vw, 112px)` | 0.95 | −0.02em |
| `heading` | `clamp(26px, 3.2vw, 56px)` | 1.05 | — |
| `lead` | `clamp(18px, 1.4vw, 22px)` | 1.45 | — |
| `body` | `clamp(15px, 1.05vw, 17px)` | 1.6 | — |
| `label` | 11–12 px, mono or Cinzel caps | 1.3 | +0.08em (mono) / +0.28em (Cinzel) |

**Typesetting rules:**
- Keep the measure at 38–62 characters.
- Use `text-wrap: balance` on headings and `pretty` on paragraphs.
- Author the line breaks for display lines yourself, separately for mobile.
- Don't centre paragraphs on Home. The world pages are ceremonial and centred by design, like the posters.

### 4.3 Layout

- **Grid:**
  - 12 columns at 1200 px and up: margins `clamp(20px, 4vw, 64px)`, gutters 24 px.
  - 8 columns from 768 to 1199 px.
  - 4 columns below 768 px: margins 20 px, gutters 16 px.
- **Containers:** no cards, boxed sections or rounded rectangles anywhere. The **only** framed elements are the two invitation cards and the framed posters, and those are objects in the world, not UI cards.
- **Negative space:** at least 40% of the DOM layer in any viewport stays empty, and at most three text blocks are visible at once.
- **Pinned scenes:** use the `100svh` / `100dvh` units, never `100vh`, on mobile.

### 4.4 Ornaments, texture and UI details

- **Ornament dividers**, built as an SVG component `<Divider variant />`, each taken from the client's artwork:
  - `x`: two ✕ shapes from the logo's eyes, used on Home.
  - `diamond`: a hairline with a centre ◆, from the Red Room poster, used in Red Room.
  - `sparkle`: a hairline with a centre four-point ✦, from the Diwali poster, used in Diwali.
- **Hairlines:** 1 px, at 20% opacity at rest and 60% when active, in the world's text colour.
- **Grain:** animated film grain over everything (WebGL and DOM). Home 4%, Red Room 5%, Diwali 3%, and 8% on the Diwali title card. Add blue-noise dithering in WebGL so fog gradients never band.
- **Icons:** arrows (→ ↓ ←) and ✕ only, drawn as 1.5 px strokes. No emoji, no icon fonts.
- **Corner radius:** 0 everywhere, except the cursor and the 6 px "announcing soon" dot.
- **Selection colour:** the world's accent on its void.

---

## PART 5 — 3D SYSTEM

### 5.1 Ground rules

- **Units and axes:** 1 unit = 1 metre. Y is up. The world origin is on the floor at the centre of each set, and the camera looks down −Z by default.
- **Renderer:** `WebGLRenderer` (WebGL 2), `outputColorSpace = SRGBColorSpace`.
  - Tone mapping is **AgX**, done in the post chain. When the composer is active the renderer uses `NoToneMapping`; never tone-map twice.
  - On the low tier there's no composer, so set the renderer's own AgX tone mapping.
- **Camera:** vertical FOV 30–38° for composed shots, up to 44° only during speed moments, plus 8° on portrait phones.
  - Keep verticals vertical: frame subjects with a lens shift (`camera.filmOffset` / `setViewOffset`), not by pitching the camera.
- **Light rig per world:** create it fully at load and never add or remove lights, change their types or toggle `castShadow` at runtime. Animate intensities, colours and positions only.
  - The **only** shadow caster is a single soft shadow in the Red Room candle light.
  - Elsewhere, use contact shadows or baked blob shadows.
- **Pre-compilation:** compile every material and feature combination during loading with `renderer.compileAsync(scene, camera)`, including every badge skin, dissolve state and world material.
  - Never let an animated physical-material feature (clearcoat, sheen, transmission, iridescence, anisotropy, dispersion) cross exactly 0; park it at 0.0001.
- **The frame loop:** zero allocations per frame, and no React state updates per frame (Part 13.4).

### 5.2 The Badge (protagonist)

**Source files** (from Claude Design Prompt 1): `brand-source/3d/badge-enamel.glb`, `badge-neon.glb` and `badge-jewelled.glb`.
- All three share the same base node names and transforms.
- Optimise them with gltf-transform (Part 13.5) into `public/models/`.

**Node contract** (code depends on these names):

```
Badge                 root; pivot at the disc's centre; face looks toward +Z; diameter 1.0, thickness 0.12
├─ Body               the disc and its bevelled outer edge
├─ Ring               the enamel band that carries the lettering
├─ Letters_Top        "UNDERDOGS" along the top arc (the logo's own letterforms, extruded)
├─ Letters_Bottom     "UNDERDOGS" along the bottom arc (reads upright, as in the logo)
├─ Inner_Line         the thin ring around the face
├─ Face               the face disc (slightly domed)
├─ Eye_L, Eye_R       the X eyes (each pivot at its own centre)
├─ Tongue             the mouth bar and the U tongue; pivot at the top centre of the bar
├─ Back               the back face, engraved "GATE TO RAGE · NAGPUR"
└─ Skin extras        Neon: Neon_Tubes, Drips · Jewelled: Zari_Rim, Paisley_L, Paisley_R,
                      Gems_Emerald, Gems_Pink, Pave_Eye_L, Pave_Eye_R, Pave_Tongue
```

**Placeholder, until the GLBs exist (build this first, in Phase 1):**
- A lathe-profile disc with a bevelled edge, plus a torus band for the ring.
- A `CanvasTexture` of `brand-source/underdogs-logo.svg` mapped onto the front face.
- The X eyes and the tongue as simple extruded shapes, so blink and wag work.
- Mark it with `// PLACEHOLDER` and swap it automatically when the GLBs are present.

**Skins.** Assign materials in code by node name, overriding the GLB's materials so all three skins stay consistent and tunable.

**Enamel (Home)**

| Node | Material |
|---|---|
| Ring | Physical, colour `#D73EBC`, roughness 0.18, clearcoat 1, clearcoatRoughness 0.05 |
| Letters, Inner_Line, eyes, Tongue | Colour `#FCF9FC`, roughness 0.3, clearcoat 0.6 |
| Face | Colour `#10171F`, roughness 0.12, clearcoat 1 (glossy black enamel) |
| Body, Back | Polished nickel chrome: metalness 1, roughness 0.12, colour `#D9DCE3` |

**Neon (Red Room)**

| Node | Material |
|---|---|
| Body | Black lacquer `#0A0505`, roughness 0.25, clearcoat 1 |
| Ring | Smoked black glass `#120203`, roughness 0.08 |
| Letters, Inner_Line, eyes, Tongue, Neon_Tubes | Base `#3A0504`, emissive `#FF2A1F`, emissiveIntensity 3.5–5 (HDR so it blooms) |
| Face | Black glass `#050102`, roughness 0.05, clearcoat 1 (reflects the candles) |
| Drips | `#6B0A08`, roughness 0.1, clearcoat 1; they extend slowly (scale.y 1 → 1.12 over 8 s, looping) |

Neon behaviour: a subtle 0.4 Hz flicker (±6%), and a rare dropout where one letter dims 30% for 120 ms about every 12 s.

**Jewelled (Diwali)**

| Node | Material |
|---|---|
| Zari_Rim, Paisley_L, Paisley_R | Gold `#D4AF6A`, metalness 1, roughness 0.28, anisotropy 0.6 on the high tier, with a generated "zari thread" normal map |
| Ring | Rani-pink enamel `#C5287B`, roughness 0.2, clearcoat 1 |
| Letters | Ivory `#FFF6EE`, roughness 0.35 |
| Face | Black velvet `#15181C`, roughness 0.95, sheen 1, sheenColor `#3A2430`, sheenRoughness 0.6 |
| Pavé diamonds (eyes, tongue) | Instanced; physical, white, roughness 0.02, ior 2.4, envMapIntensity 2.5, with gold bezels. High tier only: dispersion 0.05, where supported |
| Gems_Emerald | `#157A4F`, roughness 0.05, clearcoat 1 |
| Gems_Pink | `#E0218A`, roughness 0.05, clearcoat 1 |

**Glints:** about 40 tiny four-point star sprites (additive) placed at pavé positions. Each twinkles when its reflection lines up with the camera (computed per instance in the vertex shader). A slow light sweep makes the glints travel across the pavé every 4 s.

**Behaviours** (all skins; tune them in Leva and commit the values):

| Behaviour | Spec |
|---|---|
| Idle float | y ±0.03, rotation ±3°, low-frequency simplex noise at 0.08–0.2 Hz (not sine) |
| Cursor tilt | Rotates toward the pointer, up to 14°; spring f = 2.2 Hz, ζ = 0.75 |
| Blink | Every 3.5–7 s at random: both `Eye_*` scale.y → 0.08 in 80 ms, then back in 140 ms. One blink in six is a **wink** (left eye only). Clicking or tapping the badge always blinks. |
| Tongue wag | On badge hover, and about every 9 s when idle: `Tongue` rotates ±12° around its pivot, spring f = 3 Hz, ζ = 0.35, for about 1.2 s |
| Look-at | When a door is hovered (H5): the badge's face turns 10° toward it and the eyes shift 0.02 toward it |
| Drag to spin | Desktop only. Horizontal drag spins it around Y with inertia (friction 2.4/s); after release it springs back to face the camera |
| Idle decay | After 3 s without pointer movement, cursor influence fades to 0 over 1.2 s |

**Re-skin dissolve** (the signature transition, used by T1–T4):
- Render the outgoing and incoming badges at the **same transform**.
- Drive one shared uniform, `uDissolve`, from −0.1 to 1.1 over 1.2 s.
- Patch every badge material with this chunk (via `onBeforeCompile`, with a stable `customProgramCacheKey`, or with three-custom-shader-material).

```glsl
// vertex: varying vec3 vObjPos;  vObjPos = position;        (object space → the pattern sticks to the badge)
// fragment, after <emissivemap_fragment>:
float n = snoise(vObjPos * 3.5) * 0.5 + 0.5;      // 3D simplex noise, 0..1
float d = n - uDissolve;                           // > 0: outgoing still visible · < 0: incoming visible
if (uRole < 0.5) { if (d < 0.0) discard; }         // uRole 0 = outgoing skin
else             { if (d > 0.0) discard; }         // uRole 1 = incoming skin
float edge = 1.0 - smoothstep(0.0, uEdgeWidth, abs(d));   // uEdgeWidth ≈ 0.05
totalEmissiveRadiance += uEdgeColor * edge * uEdgeIntensity;
```

Edge colour per destination:

| Destination skin | Edge colour | Intensity | Extra |
|---|---|---|---|
| Neon | `#FF4A1F` (embers) | 6 | 40 ember sparks shed from the edge |
| Jewelled | `#FFD27A` (gold sparks) | 5 | Gold sparks |
| Enamel | `#FF4FD8` (magenta) | 4 | — |

### 5.3 Other 3D assets

They come from Claude Design (`03_CLAUDE_DESIGN_3D_PROMPTS.md`). Build a placeholder for anything missing.

| Asset (file in `brand-source/3d/`) | From | Placeholder until it arrives |
|---|---|---|
| `door-redroom.glb`, `door-diwali.glb` | Prompt 2 | Box frames with arched planes in the world colours; hinge pivots correct |
| `redroom-invitation.glb` (tray, pearls, envelope, flap, seal shards, card) | Prompt 3 | Boxes and a disc for the seal; the same node names |
| `redroom-candelabra.glb`, `redroom-mirror.glb`, `redroom-chandelier.glb`, `redroom-candle.glb` | Prompt 4 | Cylinders and a framed plane |
| `dragon-head.glb` and `smokeDragon.js` (reference module) | Prompt 5 | Particles along the spline with a cone for the head |
| `velvetCurtain.js` (reference module) | Prompt 6 | A plane with sine pleats |
| `diwali-diya-terracotta.glb`, `diwali-diya-brass.glb`, `diwali-marigold.glb`, `diwali-rose-petal.glb`, `diwali-card.glb`, optional `diwali-kandil.glb` | Prompt 7 | Simple lathe diya, a quad petal, a box card |

**Reference modules** (`*.js` from Claude Design): port them into TypeScript under `src/webgl/fx/`. Keep the algorithms, adapt them to R3F, the shared clock and the quality tiers, and remove any globals.

**Flames** are always made in code, never baked:
- An instanced, camera-facing teardrop billboard with a gradient and noise flicker.
- Placed at the `Flame_Anchor_*` empties.
- Each world has at most **3 real point lights** for all its candles and diyas combined. The rest of the glow comes from bloom and additive halo sprites.

### 5.4 Lighting and post-processing per world

These are starting values. Expose them in Leva and commit the tuned values to `src/theme/acts.ts`.

| | Home | Red Room | Diwali |
|---|---|---|---|
| Clear / fog | `#07090D` / FogExp2 `#0B0E14`, 0.06 | `#060101` / FogExp2 `#1A0202`, 0.09 | Velvet scene `#3A0A22`; sky `#14161F` / FogExp2 `#2A0A1C`, 0.04 |
| Key | Directional white, 1.2, from top-left | 2 candle point lights `#FF9A4A`, 6–10, decay 2; flicker 8–14 Hz noise, ±18% | Directional `#FFD9A0`, 2.2, from top-front-left |
| Fill / rim | Spot `#FF4FD8`, about 40, behind the badge (magenta rim) | The neon badge (emissive) plus 1 point light `#FF2A1F` at the badge | Pink fill `#FF6FB0`, 0.8, from the right; 1 diya point light near the badge |
| Environment | drei `Environment` with `Lightformer`s: one tall magenta strip and one white strip (art-directed reflections in the enamel and chrome) | One warm low strip, dark | A gold strip, a soft white top softbox and a pink strip (for the gold and the diamonds) |
| Atmosphere | 2 magenta and 1 white volumetric beam cones (additive, noise-textured), sweeping ±18° at 0.05 Hz; dust | Fog cards, dust motes lit only inside the candle light | Gold dust, fairy-light bokeh, falling rose petals |
| Floor | Glossy black. High tier: `MeshReflectorMaterial` (resolution 1024, blur [300, 80], mixStrength 1). Lower tiers: environment reflections only | Black-red lacquer, same tiering | Ivory marble (roughness 0.35), soft reflections, same tiering |
| Bloom (intensity / threshold) | 0.35 / 0.85 | 0.6 / 0.75 | 0.5 / 0.8 |
| Vignette | 0.45 | 0.65 | 0.35 |
| Grain | 4% | 5% | 3% |
| Exposure | 1.0 | 0.95 | 1.1 |
| Chromatic aberration | 0 (transitions only, ≤ 0.0015) | 0 (transitions only) | 0 (transitions only) |

**Post chain:**
- Order: scene → bloom (`mipmapBlur`) → chromatic aberration (transitions only) → exposure → tone mapping (AgX) → vignette → noise.
- Always-on effects share one merged `EffectPass`.
- Never add or remove effects mid-scroll. Change intensities, or toggle `pass.enabled` only while that pass's intensity is 0.

### 5.5 Quality tiers

| Setting | T3, desktop high | T2, laptop / tablet | T1, phone | T0, no WebGL |
|---|---|---|---|---|
| Detection | detect-gpu tier 3 | Tier 2, tablets | Phones, tier ≤ 1 | No WebGL 2, context failure, second context loss |
| DPR clamp | 1–2 | 1–1.5 | 1–1.5 (start at 1.25) | — |
| Post | Full chain, MSAA ×4 if DPR < 1.75 | Full chain, bloom at 0.75 resolution, SMAA | **No composer**: renderer AgX, CSS grain, additive halo sprites instead of bloom | Posters |
| Reflector floor | Yes | Environment only | Unlit gradient | — |
| Dragon particles | 60k | 25k | 8k | Poster |
| Petals / dust / bokeh | 400 / 3,000 / 200 | 220 / 1,500 / 120 | 120 / 600 / 60 | — |
| Fireworks per burst | 4,000 | 2,000 | 800 | — |
| Pavé glints / dispersion | Yes / yes | Yes / no | 20 sprites / no | — |
| Shadows | Red Room candle, 1024 | 512 | Blob textures | — |

**Adaptive degradation:**
- Use drei `PerformanceMonitor`. On a sustained decline, step down one level at a time in this order: DPR (−0.25, never below 1), then particle counts (−30%), then the reflector floor, then bloom resolution.
- Make visible changes only at a scene hold or behind a transition.
- Step back up at most once per session.

---

## PART 6 — MOTION AND SCROLL

### 6.1 One clock

Scroll, DOM and WebGL share **one** ticker, so they can never drift apart by a frame.

```ts
// src/motion/clock.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { advance } from '@react-three/fiber'
import { frame } from '@/state/frame'            // plain mutable object — never React state

gsap.registerPlugin(ScrollTrigger)

export function startClock() {
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, autoRaf: false })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number, deltaMs: number) => {   // GSAP ticker: time in s, delta in ms
    lenis.raf(time * 1000)
    frame.time = time
    frame.dt = Math.min(deltaMs / 1000, 1 / 30)       // the only dt any system uses
    frame.scroll = lenis.scroll
    frame.velocity = lenis.velocity
    advance(time)                                      // <Canvas frameloop="never"> — seconds
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return { lenis, stop: () => { gsap.ticker.remove(tick); lenis.destroy() } }
}
```

Check the option names against the installed Lenis version. Set `history.scrollRestoration = 'manual'`.

### 6.2 Pinned scenes and progress

Each scene is a `<section data-scene="id">` whose height is `length` (Part 7–9 tables), with a **CSS sticky** stage inside (`position: sticky; top: 0; height: 100svh`).
- **Do not** use ScrollTrigger pinning or ScrollSmoother.
- ScrollTrigger only **measures**:

```ts
// src/motion/useSceneProgress.ts
export function useSceneProgress(id: string, ref: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current!, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { frame.progress[id] = self.progress },
    })
    return () => st.kill()
  }, [id])
}
```

**How WebGL reads progress:**
- Read **damped** progress only: `p = damp(p, frame.progress[id], 4, frame.dt)`, with exponential damping that is frame-rate independent.
- Never use a constant lerp per frame.
- Every scroll-driven change must play backwards correctly. Only click-triggered transitions are one-way.

**Scroll velocity:** damp it with λ = 6 and normalise it to [−1, 1]. It may drive only:
- the nights marquee speed;
- dust and petal drift (×1 to ×3);
- a camera FOV boost of up to +4° during transitions.

### 6.3 Motion tokens

Register these as GSAP `CustomEase`s and as CSS custom properties, so the DOM and WebGL share one vocabulary.

| Token | Value | Use |
|---|---|---|
| `dur.micro` | 200–320 ms | Hovers, presses |
| `dur.ui` | 450–600 ms | Labels, nav |
| `dur.text` | 900–1,100 ms (lines staggered 80 ms) | Headline reveals |
| `dur.world` | 1,200–1,800 ms (Red Room up to 2,400) | Camera and world moves |
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Arrivals |
| `ease.inOut` | `cubic-bezier(0.83, 0, 0.17, 1)` | Authored camera moves, doors, curtains |
| `ease.in` | `cubic-bezier(0.5, 0, 0.75, 0)` | Exits |
| `spring.badge` | f = 2.2 Hz, ζ = 0.75 | Tilt |
| `spring.door` | f = 1.6 Hz, ζ = 0.6 | Door hover (one small overshoot) |
| `spring.wag` | f = 3 Hz, ζ = 0.35 | Tongue |
| `damp.story` | λ = 4 | Scroll progress |
| `damp.pointer` | λ = 8 | World-space pointer |

Never use bounce or elastic easing, and never use linear easing for anything visible.

### 6.4 Choreography rules

- **World first, word second.** An entrance runs world → headline (+150–250 ms) → body (+100–150 ms) → UI (+100 ms). Exits run in reverse, at 60% of the duration.
- **One lead motion at a time.** While the camera or a set piece performs, text holds still or is hidden.
- **Text reveals:**
  - **Headlines:** GSAP SplitText into masked lines; each line travels `yPercent 105 → 0` over `dur.text` with `ease.out`.
  - **Red Room story lines:** word by word, from `blur(8px)` and opacity 0 to sharp, 40 ms per word.
  - **Diwali titles:** one gold shimmer sweep (a `background-clip: text` gradient moving across once, 1.4 s), display lines only.
  - **Forbidden:** typewriter, scramble/glitch text and per-letter bounce.
- **Idle is alive, never busy.** When the user stops, the world breathes at 0.08–0.25 Hz. The UI is perfectly still.
- Text is fully legible within **1.2 s** of entering the viewport. Nobody waits for an animation in order to read.

---

## PART 7 — HOME, "THE GATE" (`/`)

Scene lengths are scroll distances on desktop. Mobile uses ×0.85, and on mobile a scene marked *not pinned* scrolls naturally.

| ID | Scene | Length | Pinned |
|---|---|---|---|
| H0 | Loader | — | — |
| H1 | Hero, "Gate to Rage" | 120vh | Yes |
| H2 | Who we are | 220vh | Yes |
| H3 | Nights we've thrown | 110vh | No |
| H4 | This season | 160vh | Yes |
| H5 | Two worlds: the doors | 140vh | Desktop yes, mobile no |
| H6 | Footer | auto | No |

### H0 · Loader (first visit only; return visits get a 600 ms fade)

- **Visual:**
  - The screen is `--void`. The badge draws itself in SVG at its final on-screen size.
  - The two ✕ eyes draw in (300 ms), then the tongue (200 ms).
  - The outer ring traces clockwise **with real loading progress**, weighted: fonts 15%, 3D chunk 35%, badge GLB 30%, shader pre-compile 20%. The displayed value is damped and never goes backwards.
  - Bottom-left: a mono counter `000 → 100`. Bottom-right: "GATE TO RAGE" in Cinzel caps.
- **Handoff:**
  - At 100%, render the WebGL badge exactly behind the SVG; it must match within 2 px.
  - Crossfade over 240 ms. The 3D badge "pops" (scale spring 0.96 → 1, one overshoot) and the magenta rim light rises over 900 ms.
  - The beams fade in, then the hero text reveals.
- **Timing:** at least 900 ms in total. After 8 s, show "Enter anyway →", which continues with posters and progressive loading.
- **Skipping:** any input fast-forwards the loader to its end in 400 ms.
- **Accessibility:** the loader region is a `role="status"` live region ("Loading", then "Ready").

### H1 · Hero, "Gate to Rage" (120vh)

- **Layout (desktop):**
  - The badge sits on the right, centred at 62% of the width, about 52% of the viewport height tall.
  - The text occupies columns 1–6, bottom-aligned at 72% of the viewport height.
- **DOM:**
  - Label: mono, `--steel`.
  - H1 "Gate to Rage." in Unbounded 900 at `display-xl`, `--paper`. Visually hidden in front of it: "Underdogs — ".
  - Lead in Manrope.
  - Scroll cue "Enter ↓": a 64 px hairline with a 12 px bright segment travelling down, looping every 1.6 s. It's the only looping UI element, and it fades after 10% of the scene.
- **3D:**
  - The Enamel badge with every behaviour from Part 5.2.
  - A dark stage with haze and three beam cones sweeping slowly behind it, and a glossy floor reflecting the badge.
  - The camera sits at (−0.6, 1.5, 6.5), vFOV 34°, with a lens shift so the badge lands on the right third.
- **Scroll:**
  - Across the scene the badge yaws 0 → −25° and rises 0.2, and the camera dollies in 0.4.
  - The text exits as a one-shot at 15%. It returns when the user scrolls back above 10% (hysteresis).
- **Mobile:**
  - The badge is centred in the upper 55% of the screen, with the text below it.
  - One beam. Tap the badge to blink.

### H2 · Who we are (220vh)

Three statements play one at a time in Unbounded 800 at `display-l`, each with its own badge move. Each statement exits upward before the next enters; they never overlap.

1. **"We don't throw parties. We build worlds — and open the gate."** The badge turns edge-on (yaw 90°), showing its chrome rim, and a magenta light streak slides along it.
2. **"Every night gets a name, a dress code and a reason to remember it."** The badge continues to 180°, showing its engraved `Back`: "GATE TO RAGE · NAGPUR".
3. **"Chaos, curated."** The badge spins back to face the camera, settles with one spring overshoot, and blinks.

Then the `about.body` paragraph reveals at the bottom-left in Manrope at `lead` size.

### H3 · Nights we've thrown (110vh, not pinned)

- **Header:** the label, plus "Latest: Project X — 22 Aug 2026 · Pablo, Nagpur" in mono.
- **Marquees:**
  - Two marquees of the `nights.list` names run in opposite directions, set in Unbounded 800 at `display-l`.
  - The names alternate between solid fill and a 1.5 px outline. They're separated by magenta ✕ glyphs.
  - Speed is 40 px/s plus scroll velocity × 0.3, capped. The marquees use DOM/CSS transforms only.
- **Hover (desktop):** a name fills magenta and the badge blinks.
- **3D:** the badge shrinks to 0.55 scale and parks at the top-right as a "host", still idling. On mobile it fades out during this scene.
- **Reduced motion:** a static, wrapped list.

### H4 · This season (160vh)

- **DOM:**
  - Three centred lines in Unbounded 900 at `display-xl`: "TWO WORLDS." / "TWO CELEBRATIONS." / "ONE UNFORGETTABLE SEASON." They reveal line by line, scrubbed.
  - Then "This year, different." in Cinzel caps between `x` dividers.
- **3D:**
  - The badge returns to the centre, and its rim light **splits**: the left half is lit red (`#FF2A1F`) and the right half pink-gold (`#FFC46B` blending to `#FF6FB0`). Use two rim lights crossfading in from 0.
  - The haze tints red on the left and warm gold on the right.
- **End of the scene:** the camera pulls back to reveal more floor, the badge rises up above where the doors will stand, and the doors emerge out of the dark.

### H5 · Two worlds: the doors (140vh desktop; not pinned on mobile)

- **3D:**
  - `door-redroom.glb` stands on the left and `door-diwali.glb` on the right, 2.4 apart, on the glossy floor.
  - The camera is at eye level (1.6) with vFOV 34°. The badge floats above and between the doors at 3.2.
  - **Light leaks:** red under the Red Room door, gold under the Diwali door, each breathing at 0.2 Hz (floor glow plus a light-shaft card).
- **DOM:** under each door, a label block:
  - kicker (Cinzel caps);
  - name (Unbounded 800 for The Red Room, Bodoni Moda Italic for Diwali, as a foretaste of each world);
  - occasion · date · place (Manrope);
  - CTA "Enter World One →" / "Enter World Two →".
- **DOM twins:** each door has a real `<a href>` positioned every frame over the door's projected bounds, with `aria-label="Enter World One: The Red Room, Halloween, Saturday 24 October 2026"` (or the equivalent for Diwali).
- **Hover or focus on a door:**
  - The door opens 10° (`spring.door`) and its light spill grows ×2.5.
  - The other door dims 40%.
  - The cursor changes to that world's cursor, and the badge looks at the door (Part 5.2).
- **Preloading:** on hover or focus, start loading the target world's assets and route. On mobile, start when the door enters the viewport.
- **Click or Enter:** play transition T1 (Red Room) or T2 (Diwali), Part 10.
- **Mobile:** the doors stack vertically, each full width, with the label below it. Tap to enter.

### H6 · Footer

- **Content:**
  - `footer.line`;
  - `footer.instagram` (plain text, **not a link**);
  - `footer.copyright`;
  - the Motion toggle;
  - a 28 px 2D SVG badge;
  - "Back to top ↑", which is internal.
- **Back to top:** if it crosses more than two scenes, do a fade-cut jump (0.4 s fade to `--void`, instant scroll, 0.5 s fade in) instead of a long flight through every scene.

---

## PART 8 — WORLD ONE, "THE RED ROOM" (`/the-red-room`)

### The set (persistent for the whole page)

A stage box about 12 m wide, 6 m deep and 6 m tall:
- **Floor:** black-red lacquer with reflections.
- **Back:** velvet curtains (Prompt 6, red skin), closed at first. Behind them, centred on the back wall, the **gilded mirror** (`redroom-mirror.glb`, 2.2 m tall).
- **Candelabras:** two of them (`redroom-candelabra.glb`), left and right on velvet-draped plinths.
- **Chandelier:** (`redroom-chandelier.glb`) above the centre at y 4.6, swaying ±1.5° at 0.12 Hz.
- **The neon badge:** floats in front of the mirror at (0, 2.0, 0.8).
- **Atmosphere:** fog cards and dust that is lit only inside the candlelight. Optionally, low-poly velvet poufs as silhouettes at the edges.

### Camera path

One C1-continuous `CatmullRomCurve3` for position and one for the aim point, sampled by damped page progress, so there are no cuts.

| Point | Position | Looking at |
|---|---|---|
| R1 | (0, 1.7, 7.5) | The badge |
| R2 | → (0, 1.8, 4.2) | The mirror |
| R3 | → (−2.2, 1.7, 3.6) | The left candelabra (−3.0, 1.6, 0.6) |
| R4 | → (0, 1.15, 2.4) | Down 25° at the tray (0, 0.95, 1.4) |
| R5 | → (0, 2.2, 8.0) | Wide |
| R6 | → (0, 1.8, 6.0) | Badge and mirror, centred |

| ID | Scene | Length |
|---|---|---|
| R0 | Entry: curtains part | — |
| R1 | Title and the smoke dragon | 160vh |
| R2 | The story | 200vh |
| R3 | Dress code | 160vh |
| R4 | The invitation | 220vh |
| R5 | In association with | 100vh, not pinned |
| R6 | Outro | 120vh |

**"Details" jump:** under the hero sub-title, a small link "Details ↓" jumps straight to R4 (fade-cut jump). The facts are always one click away.

### R0 · Entry

- **Arriving through T1:** the curtains are already closed, covering the screen. They part over 1.4 s (`ease.inOut`, folds bunching toward the edges) to reveal the room.
- **Direct visit:**
  - Black, then "UNDERDOGS PRESENT" in Cinzel caps, `--rr-bone`, fades in at the centre over the closed curtains (0.8 s). Then the curtains part.
  - The badge appears already in its Neon skin. Its tubes ignite letter by letter, from left to right, over 900 ms.

### R1 · Title and the smoke dragon (160vh)

- **DOM, centred:**
  - Kicker "WORLD ONE · HALLOWEEN" (Cinzel, `--rr-neon`).
  - Title "THE RED ROOM" (Cinzel Decorative 900, `display-xl`, `--rr-bone`).
  - Sub-title (Manrope, `--rr-ash`) and "Details ↓".
- **Drip treatment:** an SVG layer under the DOM title grows 5–7 blood drips (`--rr-blood`) from the letters' bottom edges. Lengths are 20–60% of the cap height, growing over 2.5 s and then hanging with a 0.1 Hz wobble. On reduced motion the drips are static.
- **Smoke dragon** (port `smokeDragon.js` from Prompt 5):

| Time | What happens |
|---|---|
| Start (as the curtains finish) | A thin smoke trail emerges from behind the mirror's left edge |
| 0.0–2.2 s | The head (a smoked-glass shell with a red fresnel rim and ember eyes) leads the body along a spline that coils **1.5 turns around the badge** (radius 0.9–1.3). The body thickens behind it to 0.22 and the tail tapers |
| 2.2–3.0 s | The head rises above the badge and faces the camera. The jaw opens 18°, the eyes flare ×3, 300 ember sparks burst and the bloom pulses once |
| 3.0 s onward | Idle: the coil breathes (±4% radius at 0.15 Hz), smoke curls off the body (curl noise) and embers drift upward |
| Scroll 60% → 100% of R1 | The dragon **unravels** from tail to head into the room's haze. The head dissolves into embers last. This is reversible |

- **Pointer:** within 1.5 m (on a world interaction plane) the pointer swirls the smoke away. It never moves the head more than 0.2.
- **Badge:** Neon skin with every behaviour; clicking blinks it.

### R2 · The story (200vh)

- **Camera:** dollies toward the mirror.
- **DOM:** the three `redRoom.story` lines play one at a time, centred, in Cormorant Garamond Italic 500 at `display-l` (`heading` on mobile), `--rr-bone`. Each reveals word by word (Part 6.4) and holds for about 60vh.
- **The mirror** (`Mirror_Glass`) gets a fog shader:
  - Condensation is drawn from noise over a blurred, low-resolution reflection of the room.
  - The words **"RED ROOM"** are **wiped clear as if by a finger** (a stroke mask whose progress follows scroll from 20% to 60% of R2).
  - During line 2, a blurred dark-red silhouette of a woman (a soft card, as in the poster) passes once behind the glass, left to right, over 3 s.
  - On mobile, the wiped words are static and there is no silhouette.
- **Candles:** they flare +20% for 300 ms each time a line lands.

### R3 · Dress code (160vh)

- **Camera:** trucks left to the candelabra.
- **DOM:** each of `dress.lines` lands in Cinzel 600 caps at `display-l` (left-aligned on desktop, centred on mobile), with **one candle igniting** per line: a wick spark, then the flame grows over 300 ms.
- **The warning:** `dress.warning` follows in Cinzel caps at `heading` size in `--rr-neon`, with one neon flicker. The last two candles ignite together.

### R4 · The invitation (220vh)

- **Camera:** cranes down to the tray (`redroom-invitation.glb`): a silver tray with pearls and the red velvet envelope, sealed with the black wax Underdogs face.
- **Scroll mapping** (fully reversible):

| R4 progress | What happens |
|---|---|
| 0–25% | A slow push in |
| 25–40% | The seal cracks: the three shards part 2–4 cm with small rotations, and a few wax-dust particles fall |
| 40–55% | `Envelope_Flap` opens 0 → 170° about its hinge (spring settle) |
| 55–80% | The `Card` slides out, rises and turns to face the camera, scaling to fill 70% of the viewport height (85% of the width on mobile) |
| 80–100% | Hold. The details overlay fades in |

- **The overlay:** a DOM element tracked every frame to the card's projected rectangle. **The text is never rendered in WebGL.**
  - Card paper is `--rr-bone`, with oxblood hairline borders.
  - Heading "THE RED ROOM" in Cinzel Decorative, `--rr-velvet`, then a `diamond` divider.
  - The `invitation.rows` follow in a two-column grid: Cinzel caps labels (12 px, +0.2em, `--rr-blood`) and Manrope values (`--rr-oxblood`). The venue's address is the `sub` line.
- **Reduced motion:** the envelope is already open and the card is shown.

### R5 · In association with (100vh, not pinned)

- **Camera:** pulls back wide.
- **DOM:**
  - Label "In association with" (Cinzel caps, `--rr-ash`).
  - Four partner rows: the role in Cinzel caps (11 px, `--rr-ash`) above the name in Cormorant Garamond 500 at `heading` size (`--rr-bone`), separated by `diamond` hairlines.
  - A subtle candle flicker on the text: opacity ±4%, 0.3 Hz noise.
- **The official poster:** `public/media/red-room-poster.webp` hangs in a gilded frame on the left wall (a plane inside the frame). It also appears as a DOM `<img>` with alt text for accessibility and for mobile.
- **Partner logos:** if the client later supplies partner logo files (SVG, or PNG at least 600 px wide), show them as monochrome bone marks beside the names. Until then, names only, so no blurry logos ever ship.

### R6 · Outro (120vh)

- **Camera:** returns to the badge and mirror, centred.
- **Easter egg:** for 1.2 s the dragon's ember eyes reappear **in the mirror's reflection only**.
- **DOM:**
  - `outro.lines` in Cormorant Italic.
  - "THIS YEAR. DIFFERENT." in Cinzel caps between `diamond` dividers.
  - Two internal links: **"Now meet the other → Diwali"** (primary, plays T3) and "← Back to the gate" (T4).

---

## PART 9 — WORLD TWO, "DIWALI" (`/diwali`)

### The set (persistent for the whole page)

- **Drapes:** rani-pink velvet drapes (Prompt 6, Diwali skin, with ivory and gold zari borders) frame the scene left, right and top.
- **Floor:** ivory marble with soft reflections.
- **The jewelled badge:** floats at (0, 1.9, 0).
- **Diyas:** `diwali-diya-*.glb`, instanced, about 36 on desktop (12 on mobile). They float at depths z −3 to +2 and heights 0.4–3.2, each bobbing ±0.04 at 0.1–0.2 Hz.
- **Petals and dust:**
  - Rose petals (`diwali-rose-petal.glb`, instanced) fall with tumble and flutter (noise-driven), in three colour variants: rani, blush and ivory.
  - Marigold heads rest on the floor near the badge.
  - Gold dust, and strings of fairy-light bokeh behind the drapes.
- **The sky, revealed in D2:**
  - The back drapes lift to reveal a night sky (`--dw-night` grading to deep violet), above a low silhouette of haveli arches and palms.
  - The silhouette is 2–3 layered parallax planes in rani-deep and indigo.

| ID | Scene | Length |
|---|---|---|
| D0 | Film title card | ≤ 3.4 s (time-based) |
| D1 | The jewelled badge | 160vh |
| D2 | "Now meet the other" | 260vh |
| D3 | The invitation | 180vh |
| D4 | Now showing: the official teaser | 100vh, not pinned |
| D5 | Outro | 120vh |

Add a "Details ↓" jump under the hero, as in the Red Room, that jumps to D3.

### D0 · The film title card (the 🎥 in their teaser)

**Look:**
- Full-screen `#0B0B0F` with 8% film grain.
- Gate weave: ±1 px jitter, stepped at 24 fps.
- Projector flicker: opacity 0.92–1.0, stepped at 24 fps.
- One warm light leak sweeps across from the left edge.
- The 24 fps stepping applies to grain and flicker only, **never** to the text.

**Sequence:**

| Time | Element | Style and motion |
|---|---|---|
| 0.3 s | "UNDERDOGS PRESENT" | Cinzel 500, 13 px, +0.42em, `#EFB88A`. Fades in; a `sparkle` divider draws outward from its centre (500 ms) |
| 1.0 s | "THIS YEAR," / "DIFFERENT." | Cinzel 400 at `display-l`, ivory, two-line reveal (as in the post). Then a `sparkle` divider |
| 2.4 s | **Film burn** | A noise-threshold mask with a hot pink-orange edge spreads from the centre and reveals the velvet scene by 3.2 s |

- **Skipping:** any input skips straight to the burn.
- **Replays:** on a repeat visit within the session, play a 1.6 s short version.

### D1 · The jewelled badge (160vh)

- **3D:**
  - The drapes are slightly open, and the jewelled badge glints (Part 5.2).
  - The diyas glow, petals fall and gold dust drifts.
  - The camera is at (0, 1.8, 6.2) with vFOV 34°.
- **DOM, centred:**
  - Kicker "WORLD TWO · DIWALI" (Cinzel caps, `--dw-gold-bright`).
  - Title "Diwali" (Bodoni Moda Italic 500, `display-xl`, ivory), with one gold shimmer sweep on entry.
  - Accent "दीपावली" (Tiro Devanagari Hindi, `heading` size, `--dw-gold-bright`), set above and to the right of the title.
  - Sub-title (Manrope) and "Details ↓".
- **Badge:** every behaviour from Part 5.2. Its blink is a **sparkle blink**: the pavé eyes flash with glints.

### D2 · "Now meet the other" (260vh)

- **DOM:** `diwali.story` plays one line at a time in Bodoni Moda Italic at `display-l`, centred, ivory: "Two worlds." → "Two occasions." → "Two very different nights." → "You've seen one." → "Now meet the other."
- **Fireworks:** each line lands with **one firework burst** beyond the drapes' opening, in this order: pink → gold → white → pink → a big gold finale.
  - GPU particles: a burst shell, gravity, drag, colour over life and a short trail.
  - Each burst briefly lights the scene with one coloured point light, decaying over 0.8 s. Re-use the same light; never add one.
- **The sky reveal:** from line 3 the back drapes **lift** (velvet panels rise with folds bunching at the top) to reveal the sky and the haveli silhouette. The fireworks burst in that sky.
- **Finale:** petals increase ×1.5.
- **Reversibility:** scrolling back lowers the drapes again. Fireworks are one-shot per line per direction.

### D3 · The invitation (180vh)

- **3D:** the gold-foil card (`diwali-card.glb`: ivory card, rani-pink inner panel, gold-foil border with paisley corners) rises from below on a slow half-turn spiral, trailing gold dust, and settles facing the camera at 70% of the viewport height (85% of the width on mobile).
- **The overlay:** a DOM element tracked to the card.
  - Heading "Diwali with Underdogs" (Bodoni Moda Italic, `--dw-rani-deep`), then a `sparkle` divider.
  - The rows: labels in Cinzel caps (12 px, `--dw-rani-deep`) and values in Manrope (`--dw-plum-ink`). The "Announcing soon" values carry the pulsing gold dot.
- **Reduced motion:** the card is static and in place.

### D4 · Now showing: the official teaser (100vh, not pinned)

- **3D:** the teaser poster (`public/media/diwali-teaser.webp`) sits in a cinema lightbox. The frame is gold, with marquee bulbs around the edge that switch on in sequence (300 ms total) when the scene enters.
- **DOM:** a mono label "NOW SHOWING", plus a DOM `<img>` with alt text (shown on mobile).

### D5 · Outro (120vh)

- **3D:** a triple-burst firework finale, then calm: the badge centred among the diyas and petals.
- **DOM:**
  - "THIS YEAR, DIFFERENT." in Cinzel caps between `sparkle` dividers.
  - "शुभ दीपावली" (Tiro Devanagari Hindi, `--dw-gold-bright`).
  - Links: "The other world: The Red Room →" (T3) and "← Back to the gate" (T4).

---

## PART 10 — TRANSITIONS

All of these run through one `TransitionLink` component (Part 13.6). The canvas persists, and the badge travels with the camera throughout.

### T1 · Home → The Red Room (≈ 2.4 s, one-way)

| Time | What happens |
|---|---|
| 0.00–0.55 s | The red door swings open (hinge 0 → 75°, `ease.inOut`). Red light floods out and the haze turns red; the Diwali door darkens |
| 0.25–1.05 s | The camera pushes through the doorway (dolly 3.2, FOV +6°, chromatic aberration peaking at 0.0015 mid-way). The badge, held top-centre in frame, begins its dissolve from Enamel to Neon (ember edge) |
| 0.85–1.35 s | The **red velvet curtains** sweep in from both sides and close. The home DOM fades out between 0.85 and 1.10 s. **The route changes at 1.35 s**, when the screen is fully covered |
| 1.35–2.40 s | `/the-red-room` mounts behind the closed curtains, with its assets already preloaded on hover. R0 parts the curtains, and the badge's dissolve completes by 2.0 s |

### T2 · Home → Diwali (≈ 1.25 s, then the title card)

| Time | What happens |
|---|---|
| 0.00–0.55 s | Both Diwali door leaves open 0 → 70° (`ease.inOut`). Warm gold light floods out and the bells sway |
| 0.25–1.00 s | The camera pushes in. Exposure ramps 1.0 → 2.2, so the screen washes to warm white-gold. The badge begins its dissolve from Enamel to Jewelled (gold-spark edge) |
| 1.00–1.25 s | The wash cuts to black, like a film cut. **The route changes at 1.25 s**, and the D0 title card plays. The film burn reveals the scene and the jewelled badge as the dissolve completes |

### T3 · World ↔ World ("Now meet the other" / "The other world": about 1.6 s plus entry)

- The current world closes through its own medium: the Red Room's curtains close, or Diwali's drapes close with a gold flash.
- The route changes, then the target world's entry plays: the curtains part, or the **short** 1.6 s title card.
- The badge flips 180° in place, re-skinning (dissolve) at edge-on.

### T4 · World → Home ("Back to the gate", or the nav badge; about 1.2 s)

- The world fades to its darkest colour while the camera pulls back fast. The route changes.
- Home appears at H5 (if you left from a door) or at the top (from the nav), and the badge re-skins to Enamel with a magenta edge.

### T5 · Browser back and forward

- Play the T3 or T4 equivalent. If the previous state is unknown, do a 400 ms fade.
- Restore each route's scroll position from `sessionStorage`.

### Reduced motion and the Motion toggle

Every transition becomes a 300 ms crossfade, with no camera move and an instant skin swap.

---

## PART 11 — INTERACTION, CURSOR AND NAVIGATION

- **Custom cursor:** for fine pointers only, morphing between states in 250 ms.

| World | Default | Over links |
|---|---|---|
| Home | A 10 px white ✕ (two 1.5 px strokes), `mix-blend-mode: difference` | Becomes a 36 px ring |
| Red Room | A 6 px `--rr-neon` dot with a soft glow | Grows to 28 px with a 1 px ring |
| Diwali | A 12 px gold ✦ | Rotates 45° and grows |

  Restore the native cursor on touch input, over text inputs (there are none) and as soon as anyone navigates by keyboard. No trails, blobs or images following the cursor.
- **Navigation bar:** fixed at the top and transparent.
  - Left: a 28 px 2D SVG badge in the current skin's colours, which goes home (T4).
  - Right: "The Red Room" · "Diwali" (internal) · the Motion toggle. The current page gets a 1 px underline in the world's accent.
  - **Mobile:** the badge on the left and "Menu" on the right, which opens a full-screen overlay listing the three pages (large type) and the Motion toggle. Trap focus inside it; Esc closes it.
- **Hover micro-interactions:**
  - Links roll their text up (a duplicate line slides in from below) in 320 ms.
  - Text links draw a 1 px underline from left to right (350 ms in, 250 ms out).
  - Every state is interruptible.
- **Keyboard:** a skip link comes first. Doors and world links are real `<a>` elements. The focus ring is 2 px in the world's accent with a 3 px offset.
- **Sound:** none in v1. Never autoplay audio.
- **Hints:** at most one per page, first visit only, fading after the first interaction or after 6 s. Home: "Scroll", then "Choose a door" at H5. Red Room: "Scroll to open the invitation" at R4.

---

## PART 12 — RESPONSIVE, REDUCED MOTION, ACCESSIBILITY AND PERFORMANCE

### 12.1 Responsive

- **Layout and quality are independent.** Layout follows viewport and pointer type; quality follows the GPU (Part 5.5). Never infer quality from screen width alone.
- **Phones:** every 3D composition is re-framed for portrait.
  - The monument goes in the upper 55–60% of the screen, and the copy in the lower 40%.
  - Use +8° vFOV, or pull the camera back.
  - No horizontal lens shift.
  - Scroll-linked parallax of ±0.1 replaces cursor parallax.
- **Resizing:**
  - Ignore height-only resizes under 120 px on touch devices (the URL bar must never trigger a relayout).
  - Debounce orientation changes by 250 ms and re-frame them behind a quick fade.

### 12.2 Reduced motion and the Motion toggle

- `prefers-reduced-motion: reduce` **or** the in-site Motion toggle (persisted in localStorage, inside try/catch) switches everything to composed stills:
  - no camera flights;
  - no idle breathing;
  - no dragon animation (a single frozen smoky coil);
  - no fireworks (a static glow);
  - no falling petals;
  - text reveals become 300 ms opacity fades;
  - transitions become 300 ms crossfades.
- The world is still there; it's just still.

### 12.3 Accessibility

- **Semantics and focus:**
  - Use `header`, `nav`, `main`, labelled `section`s and `footer`, with one `h1` per page and a correct heading order. The canvas is `aria-hidden="true"`.
  - Every interactive 3D object (the doors, the badge) has a DOM twin with an accessible name and keyboard activation.
  - Focus is always visible. Overlays trap focus and return it to their trigger.
- **Contrast:** at least 4.5:1 against the brightest render pixel beneath each block. Verify with screenshots in every world, including mid-transition.
- **Touch targets:** at least 44 × 44 px. Nothing depends on hover alone.
- **Media:** every image has alt text. The two posters and the teaser carry the alt text from Part 3.
- **Language:** `lang="en"`. Wrap the Devanagari strings in `<span lang="hi">`.

### 12.4 Performance budgets

| Metric | Budget |
|---|---|
| Frame rate | 60 fps on T3 and T2; at least 45 fps on T1 in the heaviest scene (R1 dragon, D2 fireworks) |
| Core Web Vitals (mobile) | LCP ≤ 2.5 s (the LCP element is DOM text, never the canvas) · CLS ≤ 0.05 · INP ≤ 200 ms |
| JavaScript | Initial DOM shell ≤ 180 KB gzipped. 3D core chunk ≤ 400 KB gzipped, loaded after first paint by dynamic import. Each world's scene code is its own chunk |
| Models and textures | Home ≤ 2.5 MB · Red Room ≤ 6 MB · Diwali ≤ 5 MB (after Meshopt and KTX2/WebP). Lazy-loaded per route and preloaded on door hover |
| GPU frame time | ≤ 10 ms on T3, ≤ 14 ms on T1 |
| Shader compiles after the intro | 0 (`renderer.info.programs` stays constant) |
| Memory | No growth over 20 route changes. Dispose of world-specific geometry and textures when leaving a world, except the badge |

---

## PART 13 — TECHNICAL ARCHITECTURE

### 13.1 Stack

- **Versions:** install the **latest stable** versions at project start, then pin them exactly. Never use alpha, beta or canary majors, and check peer dependencies before adding anything.

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router) + **React 19** + TypeScript strict | Static generation for all three pages, `next/font`, Vercel |
| 3D | **three.js** `WebGLRenderer` (WebGL 2) + **@react-three/fiber** (the v9 line, for React 19) + **@react-three/drei** (the matching major) | **Not** WebGPU or R3F v10 alphas |
| Post | **postprocessing** + **@react-three/postprocessing** | One merged `EffectPass`; drop to the vanilla API if you need control over grouping |
| Motion | **GSAP 3.13+** (ScrollTrigger for measuring only, SplitText, CustomEase) + **@gsap/react** | All GSAP plugins are free |
| Scroll | **Lenis** (`lenis`, `lenis/react`) | Native scroll underneath, so CSS sticky works |
| State | **zustand** | Per-frame values go in a mutable `frame` object |
| Maths and noise | **maath** (damping), **simplex-noise** | |
| Tiering | **detect-gpu** (self-host its benchmark data) + drei `PerformanceMonitor` | |
| Styling | **Tailwind CSS v4** with tokens as CSS variables (`@theme`) | |
| Validation | **zod** | For `site.ts` |
| Dev only | **Leva**, **r3f-perf** / stats-gl, **Spector.js**, **@gltf-transform/cli** | Never shipped |

**Deliberately not used:** Framer Motion (it would be a second animation engine), physics engines, Theatre.js, Spline runtime, ScrollTrigger pinning or ScrollSmoother, OffscreenCanvas, and any external 3D or HDRI downloads. The environment comes from Lightformers only.

### 13.2 Folder structure

```
app/
  layout.tsx              // fonts per route group, <Providers/> (store + clock), <DomLoader/>,
                          // <Experience/> (persistent canvas, dynamic import, ssr:false), <Nav/>, <Cursor/>
  page.tsx                // Home sections H1–H6
  the-red-room/page.tsx   // R1–R6
  diwali/page.tsx         // D1–D5 (+ D0 title card component)
  not-found.tsx           // "This door doesn't open." — enamel badge blinks; link back to the gate
brand-source/             // client originals + Claude Design exports (not served)
public/
  models/   media/   textures/   fonts/(if any self-hosted)   basis/(KTX2 transcoder)
src/
  content/site.ts
  theme/   tokens.ts  acts.ts  fonts.ts
  state/   frame.ts  store.ts
  motion/  clock.ts  eases.ts  useSceneProgress.ts  useLineReveal.ts  transitions.ts
  webgl/
    Experience.tsx  QualityProvider.tsx  tiers.ts  WorldDirector.tsx  CameraRig.tsx  PostFX.tsx
    badge/   Badge.tsx  skins.ts  dissolve.glsl.ts  behaviours.ts  BadgePlaceholder.tsx
    home/    HomeStage.tsx  Beams.tsx  Doors.tsx
    redroom/ RedRoomSet.tsx  MirrorFog.tsx  Invitation.tsx  Candles.tsx  Chandelier.tsx
    diwali/  DiwaliSet.tsx  Diyas.tsx  Petals.tsx  Fireworks.tsx  SkyReveal.tsx  GoldCard.tsx  Lightbox.tsx
    fx/      smokeDragon.ts  velvetCurtain.ts  flames.ts  glints.ts  grain.ts  filmBurn.ts
    tracking/ DomTwins.tsx  useProjectedRect.ts
  ui/      Nav.tsx  Menu.tsx  Cursor.tsx  Divider.tsx  SplitHeading.tsx  TransitionLink.tsx
           ScrollCue.tsx  Marquee.tsx  InvitationCard.tsx  AnnouncingSoon.tsx  MotionToggle.tsx  DomLoader.tsx
  sections/ home/*  redroom/*  diwali/*
scripts/   optimize-models.mjs  posters.mjs
```

### 13.3 The world director

- **Store:** `store.world` is `'home' | 'redroom' | 'diwali'`, and each page sets it on mount.
- **Rendering:** `WorldDirector` renders the matching set inside its own `<Suspense>`, lazy-loaded. The badge lives outside every set, so it never unmounts.
- **Camera:** `CameraRig` samples the current world's path by damped progress, then adds cursor parallax (±0.2 / ±0.12 position, ±1° rotation, λ = 6) and idle drift (≤ 4 cm, noise).
- **Frame order:** `useFrame` priorities, ascending: Director −50 → CameraRig −40 → Badge −30 → sets and FX −20 → DomTwins and tracked overlays −10 → PostFX 1. PostFX renders the frame on every tier.

### 13.4 State rules

- `state/frame.ts` is a plain mutable singleton: `{ time, dt, scroll, velocity, vNorm, pointer: { ndc, world, damped }, progress: Record<string, number>, transition: { t, type } }`.
- The zustand store holds discrete state only: `world`, `phase`, `tier`, `motionEnabled`, `hoverDoor`, `transitionType`, `hintsSeen`.
- **No React state per frame.** The DOM overlays tracked to 3D (the cards, the door twins) write `style.transform` through refs.

### 13.5 Asset pipeline

```
scripts/optimize-models.mjs
  for each brand-source/3d/*.glb:
    gltf-transform optimize <in> public/models/<name>.glb \
      --compress meshopt --texture-compress webp --texture-size 1024
    (use --texture-compress ktx2 instead if KTX-Software `toktx` is installed)
  print triangle counts + file sizes; FAIL if a file breaks the Part 12.4 budget
```

- **Loading:** use `useGLTF(path, false, true)` (no Draco, Meshopt on) and self-host the decoders.
- **Media:**
  - Convert the two posters to WebP/AVIF: `public/media/red-room-poster.webp` (from `Halloween Post.png`) and `public/media/diwali-teaser.webp` (from `Diwali Post.png`).
  - Serve them in the DOM through `next/image`.
- **Never ship** `Underdogs Logo.png` (it's watermarked). The 2D logo used in the nav, favicon and loader comes from `brand-source/underdogs-logo.svg`. If that file is missing, **stop and ask** for it.

### 13.6 Routing and transitions

- **`TransitionLink`** wraps `next/link`. On a plain left-click it:
  1. prevents the default;
  2. prefetches the route;
  3. plays the exit timeline (Part 10);
  4. calls `router.push` at the cover point;
  5. lets the destination's `useEnterTransition` finish once its first frame is ready (maximum wait 1.2 s).
- Modifier-clicks and middle-clicks behave natively.
- Timelines **never** move WebGL objects directly. They write normalised values (`transition.t`) that the render loop reads, so data flows one way.

### 13.7 SEO and metadata

- **Metadata:** use the Next.js metadata API with Part 3's `meta` objects. Add canonical URLs, `sitemap.xml` and `robots.txt`.
- **Open Graph images** (1200 × 630):
  - Home: a still of the enamel badge, captured from the build.
  - Red Room: a crop of `Halloween Post.png`.
  - Diwali: a crop of `Diwali Post.png`.
- **JSON-LD:**
  - An `Organization` for Underdogs Entertainment (name, city, no `sameAs` links).
  - Two `Event`s:
    - The Red Room: `startDate: "2026-10-24"`, `location` = Millo with its full address, organiser Underdogs Entertainment.
    - Diwali: `startDate: "2026-11-07"`, `location` = Nagpur only.
  - Both events: `eventStatus: EventScheduled`, `eventAttendanceMode: OfflineEventAttendanceMode`, and **no `offers`**.

### 13.8 Fallbacks and resilience

- **T0** (no WebGL 2, or context creation fails): no canvas.
  - Each page uses a poster still as a fixed background: Home a badge capture, Red Room the official poster, Diwali the teaser.
  - All the DOM content still works.
- **Context lost:** pause, show the poster and try one restore. On a second loss, drop to T0.
- **Asset failure:** show a quiet mono notice ("Some visuals couldn't load — showing stills.") and that scene's still.
- **Hidden tab:** the ticker pauses. On return, `dt` is clamped, so nothing jumps.

---

## PART 14 — BUILD PHASES AND ACCEPTANCE

At the end of **every** phase, stop and report:
- what you built, mapped to sections of this brief;
- screenshots at 1440×900 and 390×844 of every scene at 25%, 50% and 75% of its progress;
- short recordings of every transition built so far;
- fps (minimum and average) on desktop and on mobile emulation, with draw calls and the program count;
- any deviations, with the reason for each;
- open questions.

Then wait for approval. Commit after every coherent step.

**Phase 0: foundation, DOM only**
- Scaffold the project, tokens, fonts, `site.ts` with zod, Lenis + GSAP + the clock (with `advance` as a no-op), every page's real DOM layout and copy, text reveals, nav, menu, cursor, footer, 404, Motion toggle, reduced motion and the skip link. No WebGL.
- *Accept when:* Lighthouse accessibility ≥ 95 and CLS < 0.05; all copy matches Part 3 exactly; every page works by keyboard alone; "Announcing soon" styling is visible; no outbound links exist (check with a grep for `http` in hrefs).

**Phase 1: the world skeleton**
- The persistent canvas (dynamic import), tier detection, `QualityProvider`, `frameloop="never"` + `advance`, `WorldDirector`, `CameraRig` with the paths from Parts 7–9, scene progress wiring, the **badge placeholder**, and grey-box placeholders for every set piece.
- *Accept when:* scrolling every page moves the camera smoothly and reversibly; there's no drift between DOM and WebGL; T3 runs at ≥ 60 fps and mobile emulation at ≥ 45 fps; no shader compiles happen after load.

**Phase 2: the badge**
- Load the three GLBs (or keep the placeholder), the skins, every behaviour, the re-skin dissolve with pre-compiled states, and the home stage lighting, beams and floor.
- *Accept when:* blink, wink, wag, tilt, drag-spin and look-at all work; dissolving between any two skins takes 1.2 s with no flash or hitch; it reverses correctly.

**Phase 3: Home complete**
- H0–H6, the doors with hover states and DOM twins, the marquees, the split rim light, and preloading.
- *Accept when:* the loader is honest and hands off within 2 px; every hold frame passes the screenshot test (Part 16); the doors are fully keyboard-operable.

**Phase 4: The Red Room**
- The set, curtains, candles and flames, mirror fog, chandelier, the **smoke dragon**, the invitation sequence, partners, the framed poster, the outro, and the post chain.
- *Accept when:* the dragon choreography matches R1 and unravels reversibly; the invitation scrubs both ways without errors; the overlay stays within 1 px of the card during fast scrolling; the heaviest frame stays within budget on T1.

**Phase 5: Diwali**
- The title card, the velvet drapes, the jewelled badge with glints, diyas, petals, dust, the sky reveal, fireworks, the gold card, the lightbox and the outro.
- *Accept when:* the title card is skippable and never blocks reading for more than 3.4 s; the fireworks are paced exactly to the D2 lines; the scene is still brighter than the Red Room but never washed out.

**Phase 6: transitions**
- T1–T5, `TransitionLink`, preloading, browser back and forward, and scroll restoration.
- *Accept when:* every transition matches its Part 10 timings within ±10%; the badge never pops; the route never changes before the screen is covered; back and forward always work.

**Phase 7: responsive, quality and launch**
- Portrait framing for every scene, tier tuning, adaptive degradation, T0 posters, SEO, Open Graph, JSON-LD, the model optimisation script, and a Vercel deployment.
- *Accept when:* every item in Part 16 passes; Web Vitals budgets are met; the production build contains no dev tools.

---

## PART 15 — DO NOT

**Content and scope**
- Don't add booking, RSVP, tickets, forms, prices or outbound links of any kind (Instagram, Maps, WhatsApp).
- Don't invent content, people, lineups, times, venues for Diwali, testimonials or statistics.

**Assets**
- Don't use `Underdogs Logo.png` in production, and don't recreate the logo from a font. The letters must be the logo's own letterforms from the SVG.
- Don't recolour or redraw the partners' names into fake logos.

**Visual style**
- Don't add a rotating, spinning object as idle decoration. The badge breathes; it never auto-spins except when dragged or flipped deliberately.
- Don't use neon-on-black clichés on Home. Neon belongs to the Red Room only.
- Don't use decorative CSS gradients, glassmorphism, drop shadows, cards or rounded boxes. The **only** gradients allowed are light-produced ones, the film burn and the Diwali gold shimmer.
- Don't let bloom exceed the Part 5.4 values, and never bloom text or posters.
- Don't build particle text, cursor trails, blob cursors or images that follow the cursor.

**Motion and scroll**
- Don't move several big things at once, and don't animate text during a camera or set-piece move.
- Don't use bounce or elastic easing, linear easing for visible motion, or constant per-frame lerps.
- Don't use ScrollTrigger pinning or ScrollSmoother, don't snap scroll, and don't hijack horizontal scroll.
- Don't make any scene longer than specified, and don't make anyone wait for animation in order to read.

**Engineering**
- Don't add or remove lights, toggle shadows or add or remove post effects mid-scroll. Don't let material features cross 0.
- Don't update React state per frame, and don't allocate inside per-frame code.
- Don't use WebGPU, alpha/beta packages or unpinned versions.

**Fonts and sound**
- Don't use Inter, Roboto, Arial or system-UI as visible faces.
- Don't autoplay sound. There is no sound in v1.

---

## PART 16 — QA CHECKLIST (run it on desktop and on a real phone)

**Content**
- [ ] Every string matches Part 3. Dates read **Sat 24 Oct 2026** and **Sat 7 Nov 2026**, and the Red Room venue is Millo, 245/U1, East High Court Road, Civil Lines, Nagpur 440001.
- [ ] Every unknown field shows "Announcing soon" with its dot. There are no outbound links, and the Instagram handle is plain text.

**Motion**
- [ ] One clock: no drift between DOM and WebGL during fast flicks.
- [ ] Every scroll-driven scene reverses cleanly, with no pops.
- [ ] Frame-rate independence holds at 60, 120 and 144 Hz.
- [ ] One lead motion at a time; the world moves first, then the words.
- [ ] Springs overshoot once and settle within 1.2 s.

**The badge**
- [ ] It persists across every route with no remount flash.
- [ ] All three skins are correct, and every dissolve pairing works.
- [ ] Blink, wink and wag are visible but never annoying (check the intervals).

**Each world**
- [ ] **Red Room:** the dragon coils 1.5 turns, roars once and unravels reversibly; the seal, flap and card scrub both ways; the overlay text is crisp and in place.
- [ ] **Diwali:** the title card can be skipped; five lines land with five bursts; the drapes lift and the sky appears; glints sparkle on the pavé.

**Transitions**
- [ ] T1–T5 all work, including browser back and forward. The route never changes before the screen is covered.

**Visual**
- [ ] **Screenshot test:** any random scroll position looks like a composed film still.
- [ ] **Squint test:** the monument reads first, the headline second.
- [ ] No banding, grain is present, and no edges shimmer.

**Accessibility**
- [ ] Reduced motion and the Motion toggle both work.
- [ ] Everything is operable by keyboard alone.
- [ ] Screen readers (VoiceOver and NVDA) read the doors and the cards correctly.
- [ ] Contrast is at least 4.5:1 everywhere, including mid-transition.

**Performance**
- [ ] The Part 12.4 budgets are met.
- [ ] No memory growth over 20 route changes.
- [ ] Adaptive degradation never oscillates.

**Resilience**
- [ ] With WebGL disabled, the T0 posters appear and the site still works.
- [ ] A lost context recovers once. An asset failure shows a still and a notice.

**Devices**
- [ ] Latest Chrome, Safari, Firefox and Edge on desktop.
- [ ] iOS Safari (the two latest majors) and Android Chrome.
- [ ] Portrait and landscape, and orientation changes.

---

## APPENDIX A — ASSET MANIFEST

**From the client's "Underdogs Events" folder (copy into `brand-source/`):**

| File | Use |
|---|---|
| `Underdogs Logo.png` | **Reference only (watermarked).** Never ship it |
| `Diwali Logo.png` | Reference for the Jewelled skin |
| `Diwali Post.png` | The Diwali teaser: `public/media/diwali-teaser.webp`, the Diwali Open Graph image, and mood |
| `Halloween Post.png` | The Red Room's official poster: `public/media/red-room-poster.webp`, the Red Room Open Graph image, and mood |
| `Halloween Post 2.png` | Mood and reference for the envelope, the seal and the neon badge |
| `reference/*.png` | Cropped references (the badges, the envelope, the mirror and candles) |
| **`underdogs-logo.svg`** | **Required. The clean master logo, supplied by the client** |

**From Claude Design (into `brand-source/3d/`):**

| Prompt | Files |
|---|---|
| 1 · The badge | `badge-enamel.glb`, `badge-neon.glb`, `badge-jewelled.glb` |
| 2 · The doors | `door-redroom.glb`, `door-diwali.glb` |
| 3 · Red Room invitation | `redroom-invitation.glb` |
| 4 · Red Room props | `redroom-candelabra.glb`, `redroom-mirror.glb`, `redroom-chandelier.glb`, `redroom-candle.glb` |
| 5 · Smoke dragon | `dragon-head.glb`, `smokeDragon.js` |
| 6 · Velvet curtains | `velvetCurtain.js` (and an optional static `curtain-open.glb`) |
| 7 · Diwali props | `diwali-diya-terracotta.glb`, `diwali-diya-brass.glb`, `diwali-marigold.glb`, `diwali-rose-petal.glb`, `diwali-card.glb`, optional `diwali-kandil.glb` |

## APPENDIX B — ALTERNATIVES (if the client changes direction)

The full menu of alternatives is in `02_3D_ANIMATION_OPTIONS.md`. Swapping one only replaces that scene's set or FX module; the badge, clock, transitions and content model stay unchanged.

## APPENDIX C — FILL IN LATER (keep these as `ANNOUNCING_SOON` until the client confirms)

- **The Red Room:** time; entry details.
- **Diwali:** event name or theme; time; venue; dress code; entry details.
- **Partners:** logo files, if the client wants logos instead of names.

**Start with Part 14, Phase 0. Read Parts 0–13 first. End of brief.**
