# UNDERDOGS — World-Class Refinement Pass
### Brief for Claude Opus 5.5 (website + mobile web app) · run at effort `xhigh`

> **How to run this (for the human)**
> 1. Save this file in the project root (the "Underdogs Events" folder) as `REFINEMENT_BRIEF.md`.
> 2. Open the project with Claude Opus 5.5 and set the effort to **xhigh** (the reasons are at the end of this file).
> 3. Paste the kickoff message from the chat. Opus works in five passes and stops after each one with screenshots for your approval.

---

## 0. YOUR ROLE AND THE GOAL

You are the creative director, senior UI/UX designer and creative technologist (WebGL, motion, front-end performance) brought in to finish this product. The site and mobile web app were built quickly with another agent. Most features exist, but the craft is uneven: some scenes look templated or childish, some transitions glitch, and some assets are placed or loaded badly.

**Goal:** the client, Underdogs (a party and entertainment company in Nagpur), opens it on their laptop and phone and says it feels like the best event company in the country made it. It should be premium, cinematic, smooth and unmistakably theirs.

**Measure of success:**
- Every scroll position on every page looks like a composed film still.
- Every interaction feels physical and intentional.
- Nothing glitches, pops, stutters or shows an empty or black frame.
- The phone experience feels like a native, premium app.

## 1. NON-NEGOTIABLES (these override everything else)

**Content and links**
1. **Facts are fixed.** Use only the content in §3 and `src/content/site.ts`. Never invent times, prices, lineups, people, testimonials or statistics. Anything unknown renders as "Announcing soon".
2. **Informative only.** No booking, RSVP, tickets, payments, forms or newsletter. No outbound links: no Instagram, Maps, WhatsApp or ticket buttons. Navigation between the site's own pages is the only linking.

**Brand and assets**

3. **The GLBs keep their own colours and materials.** Fix dark or flat results with lighting, never by recolouring. The badge skins are:
   - Home: `badge-enamel.glb`, pink.
   - The Red Room: `badge-neon.glb`, red neon.
   - DHAMAAKA: `badge-jewelled.glb`, pink and gold jewels.
4. **No real person's face or likeness** is recreated in the design. "The Karan Johar Edition" is subtitle text only. The official flyer may be shown as a poster.

**Process**

5. **Don't break what works.** Commit after every coherent step with clear messages. Don't delete brand-source files. Don't deploy to production until the human approves.
6. **Smoothness beats spectacle.** If an effect costs frame rate on a mid-range phone, simplify it or give it a mobile-specific version.

## 2. WHAT EXISTS (read the code before changing anything)

**Stack:** Next.js (App Router) + TypeScript, React Three Fiber + drei, pmndrs postprocessing, GSAP (ScrollTrigger, SplitText), Lenis, zustand, Tailwind v4. Deployed on Vercel (`underdogs-events`). A persistent canvas lives in the root layout; the badge travels between pages and dissolves into a different skin per world.

**Routes:**

| Route | Page |
|---|---|
| `/` | Home, "Gate to Rage" |
| `/the-red-room` | World One, Halloween |
| `/diwali` | World Two, DHAMAAKA |
| `/events` | The mobile Events tab |

**Mobile (under 768 px):** an app shell with a top bar, a floating bottom tab bar with **Home** and **Events** only, event cards, and card-to-detail transitions. It's a PWA.

**Key files:**

| Area | Files |
|---|---|
| Content | `src/content/site.ts` |
| Transitions | `src/motion/transitions.ts`, `src/ui/TransitionStage.tsx`, `src/ui/TransitionLink.tsx` |
| Badge | `src/webgl/badge/Badge.tsx`, `skins.ts`, `dissolve.glsl.ts` |
| World scenes | `src/webgl/{home,redroom,diwali}/*` and `src/webgl/WorldDirector.tsx` |
| Page views | `src/sections/{home,redroom,diwali}/*`, including the 2D Diwali layers in `src/sections/diwali/couture/*` (being replaced, see §5.3) |
| Brand sources | `brand-source/` (logos, posters, the DHAMAAKA flyer at `brand-source/dhamaaka/flyer.png`), `GLBs/`, `public/models/` |
| Original specs | `BRIEF.md` (the original master brief). Read it for intent, but this file wins where they differ |

**Known or suspected problems to verify first.** Some may already be fixed; confirm each one in the browser.

*Transitions*
- Opening `/diwali` showed full-screen pink striped DOM curtains with an empty black circle. Diwali was routed through the Red Room curtain transition (`transition-curtain-diwali`), and `TransitionStage` cut a badge-shaped hole while the jewelled skin hadn't loaded.
- Badge skins mount lazily at cover time, so the destination GLB starts loading after the screen is covered.
- The cover can wait up to 10 s; the maximum should be 1.2 s.

*Scroll and motion settings*
- With Motion OFF, mouse-wheel scrolling may not work because Lenis captures the wheel.

*Rendering and placement*
- In the past, code repainted GLB materials (the enamel ring was turned black). Make sure nothing overrides GLB colours.
- Older placement hacks: curtains cloned twice and scaled non-uniformly or mirrored; flames at guessed positions instead of `Flame_Anchor_*`; `door-diwali.glb` not grounded (its geometry starts at y = −1.5).

*Maintenance*
- `THREE.Clock` deprecation warnings should move to `THREE.Timer`.

## 3. CONTENT AND FACTS (source of truth; mirror exactly in `site.ts`)

**Underdogs**
- Underdogs Entertainment, a party and entertainment crew from Nagpur. Line: "Gate to Rage". Instagram `@underdogs_nagpur` (plain text only).
- Season: "Two worlds. Two celebrations. One unforgettable season." · "This year, different."
- Nights they've thrown: Project X (22 Aug 2026, Pablo, Nagpur), Retro Holi, Anti V, Diwali 2k25, Holi 2k25, Maison Blanche, Afrochella, Akai Yane, NYE 2024, Diwali 2k24, Luau, Holi 2k24, NYE 2k23.

**World One: The Red Room** (Halloween)
- Saturday 24 October 2026.
- Venue: Millo, Kitchen & Bar, 245/U1, East High Court Road, near Zudio, Civil Lines, Nagpur 440001.
- Costumes compulsory. Time and entry: Announcing soon.
- Copy: the client's caption lines already in `site.ts` ("This year, we're opening the doors to a different kind of madness…", "Dress to disturb. Dress to deceive. Dress to become someone else.", "Costumes aren't optional. Consider this your warning.").
- Partners: F Salon by FashionTV, Nagpur (title) · Millo (venue) · The Makeup Alchemy (glam) · Layerz (creative experience).

**World Two: DHAMAAKA, The Karan Johar Edition** (Diwali 2026)
- "NO CTRL presents". Saturday 7 November 2026. Venue: Centre Point, Nagpur.
- Time, dress code and entry: Announcing soon.
- Devanagari accent: "दीपावली धमाका".
- Partners:

| Role | Partner |
|---|---|
| Powered by | Rich Bliss Auto · Rich Bliss Jewels |
| Co-powered by | F Salon by FashionTV |
| Beverage partner | Alpha Bull Rum |
| Gifting partner | Shika Arts |
| Experience partner | Layerz |
| Fashion partner | Aayush Sachdev Couture |
| Tech partner | Kool Korp |
| Travel partner | Nova Travels |

- Official flyer: `brand-source/dhamaaka/flyer.png`.

## 4. THE QUALITY BAR (apply to every screen, desktop and mobile)

**Composition and light**
- **One hero per frame.** A single subject dominates; everything else supports it or sits in shadow. At most three text blocks are visible at once, and at least 40% of the frame is breathing room.
- **Depth.** Every frame has a foreground (soft, out of focus), a hero in the midground and an atmospheric background. Distant things lose contrast.
- **Light is the art director.** One clear key direction per world; reflections art-directed with Lightformer strips; contact shadows under grounded objects; bloom only on flames, neon and jewels; AgX tone mapping; 3–5% film grain; no banding.

**Motion**
- **Physicality.** Springs, inertia and settling. No linear visible motion, no bounce or elastic easing, no constant per-frame lerps (use `damp` with `dt`).
- **Choreography.** The world moves first, then the headline (+150–200 ms), body (+100 ms) and UI. Only one lead motion at a time. Text never moves while the camera or a set piece performs.

**Craft details**
- **Typography as craft.** Authored line breaks for desktop and mobile, no widows, optical kerning on display type, tabular numerals for dates, one spacing scale (4/8/12/16/24/32/48/64/96/128).
- **Micro-interactions.**
  - Cursor states: ✕ on Home, an ember on the Red Room, a gold sparkle on DHAMAAKA.
  - Magnetic CTAs; links draw their underlines; the badge winks.
  - Every state can be interrupted, and every control has hover, focus and pressed states.

**Patterns to avoid.** These make it look AI-made or templated:
- generic gradient washes;
- glassmorphism or backdrop blur;
- pill buttons everywhere;
- numbered "01/02/03" section labels as decoration;
- emoji;
- Inter, Roboto or Arial;
- flat saturated pink fills;
- cartoon flame teardrops;
- stock "sparkle" stars sprinkled everywhere;
- centred-everything stacks with no hierarchy;
- confetti;
- anything that looks like a party flyer template.

## 5. ART DIRECTION PER WORLD

### 5.1 Home, "Gate to Rage" (Underdogs' own world)
- **Palette and mood:** ink black `#07090D`, magenta `#D73EBC` (the logo ring), white `#FCF9FC`. Streetwear-confident, nightclub at soundcheck, premium.
- **Hero:** the pink enamel badge as a physical object, with chrome edge highlights sliding as it tilts. It blinks, winks and wags its tongue, and looks at the door you hover.
- **Atmosphere:** slow magenta beams in haze and a glossy floor reflection.
- **Sections:** hero → who we are (three statements choreographed with the badge turning) → nights we've thrown (marquee) → this season → the two doors (`door-redroom.glb`, `door-diwali.glb`, grounded, flames on their anchors, light leaking underneath).

### 5.2 World One, The Red Room (Halloween)
- **Palette and mood:** void `#060101`, oxblood, velvet `#7C0F0C`, blood `#95120E`, neon `#FF2A1F`, candle light, bone text `#EFD9CD`. A Victorian gothic boudoir; seductive dread; slow, sensual tempo.
- **The set:** curtains part onto a candlelit room. The neon badge sits before the gilded mirror, which has a fog shader with "RED ROOM" wiped into the condensation. Candelabras and the chandelier have flames on all their `Flame_Anchor_*` points, plus single candles in clusters.
- **Signature moments:**
  - The smoke-and-ember dragon coils around the badge and unravels into the haze.
  - The wax-sealed velvet envelope cracks open and the invitation card rises.
- **Details:** partners as film-credit typography, and the poster in a gilt frame.
- **Mobile:** the dragon becomes a short pre-rendered loop.

### 5.3 World Two, DHAMAAKA — The Karan Johar Edition (follow the flyer)

**The mood is "Premiere Night."** A grand palace ballroom at night: sweeping staircase, balconies, crystal chandeliers, crimson and rani-pink drapes, gilded columns, golden elephants, roses. Add film-set glamour: black fresnel studio lights with hot white lenses, a clapperboard, marquee light bulbs, gentle paparazzi flashes, champagne gold. It should be maximal in mood, but immaculate and expensive in execution.

**Palette (from the flyer):**

| Colour | Hex | Share of each frame |
|---|---|---|
| Black | `#0A0606` | together with crimson shadow, about 60% |
| Crimson | `#8B0F22` | (part of the 60% above) |
| Gold | `#E5B25D` | about 25% warm gold light |
| Champagne | `#FFE3A3` | highlights |
| Bulb white | `#FFF1C9` | highlights |
| Rani pink | `#E0217A` | at most 15% pink, as sparkle and accent, not flat fills |
| Rose | `#F25C9A` | (part of the 15% above) |

**Type:**
- Cinzel 600 gold for labels and credits (letter-spacing 0.3–0.4em).
- "THE KARAN JOHAR EDITION" set on an arc (SVG `textPath`).
- Manrope for body text; Tiro Devanagari Hindi for the Devanagari accent.

**The title:** jewelled "DHAMAAKA" lettering.
- Use `brand-source/dhamaaka/title.png` if present.
- Otherwise build it in code: a heavy display serif filled with a generated rhinestone pattern (faceted rani/rose crystals with white speculars), a gold bevel (dual offset strokes), a 3–4 layer crimson extrusion and a soft glow. It must read as jewellery, not a gradient font.
- On entry: the letters settle (50 ms stagger, ease-out), then a marquee-bulb chase runs once around the outline. A diagonal light sweep glides across the rhinestones every ~6 s.

**3D:** the jewelled badge is the ONLY 3D element on this page. It sits at the centre of the staircase, under a warm gold key with a pink rim, with glints travelling across the pavé. Remove every other Diwali GLB and the old curtain, diya and toran layers.

**Scenes (desktop):**

| Scene | What happens |
|---|---|
| D0 · Opener (≤ 3 s, skippable; short version on repeat visits) | A clapperboard with "DIWALI 2026" in gold script snaps shut with one small flash at the hinge; "NO CTRL PRESENTS" appears; two studio lights switch on in turn; the ballroom is revealed |
| D1 · Hero | Ballroom atmosphere (a clean plate if supplied, otherwise a blurred, dimmed crop of the flyer's centre with no logos) behind 2D balconies and chandeliers; studio beams sweeping slowly; the title, arced subtitle and "NO CTRL PRESENTS" in the upper-middle; the badge on the staircase; soft foreground petals and bokeh; "Saturday 7 November 2026 · Centre Point, Nagpur" and a "Details ↓" chip |
| D2 · Story | Each line is a film title card in a thin gold film-strip frame, found by a spotlight; one elegant gold or pink firework per line (never confetti) |
| D3 · Invitation | A black "premiere invite" card with a thin rhinestone border, gold-foil corners and the small jewelled badge, carrying the details. It's an invitation, never a ticket |
| D4 · Sponsor wall | Opening-credits style, grouped by role exactly as in §3 (logos only if real files exist in `brand-source/dhamaaka/partners/`; otherwise names in Cinzel; never crop blurry logos out of the flyer) |
| D5 · Now showing | The flyer in a cinema lightbox ringed with marquee bulbs |
| D6 · Outro | "THIS YEAR, DIFFERENT.", "शुभ दीपावली", and links to the other world and back to the gate |

**Flash safety:** all flashes are small, under 3 per second and within WCAG 2.3.1. They are all off under reduced motion.

### 5.4 Mobile web app (under 768 px): a premium native-app feel
- **Shell:**
  - A slim top bar: badge + "UNDERDOGS" in Cinzel; on detail screens, a back button and the event name.
  - A floating capsule tab bar with **Home** and **Events** only: solid ink, hairline border, no blur.
  - A sliding pill indicator coloured by context: magenta on Home; neon red in the Red Room; champagne gold in DHAMAAKA; ivory on the Events list.
  - Line icons: the Underdogs face, and two arches. The Home icon winks when tapped.
  - Safe areas, `100dvh`, no URL-bar jumps, no bounce. Installable PWA.
- **Home tab:**
  - The 3D pink badge hero with touch-drag spin.
  - Swipeable statement cards; drifting chips of past nights.
  - "This season" mini cards opening each event.
  - No 3D doors on mobile.
- **Events tab:**
  - Two tall immersive cards, one per event, each in its world's language.
  - A live "X days to go" chip (computed; hidden after the date) and a slow light sweep across each title.
  - Shared-element expand into the event (View Transitions API, with a FLIP fallback; transform and opacity only).
- **Detail screens:**
  - The world's 3D badge is the only WebGL.
  - The heaviest effects have mobile versions (a pre-rendered dragon loop; 2D DHAMAAKA layers with reduced particles).
  - The invitation is a crisp DOM card.
- **Rules:** native momentum scrolling, no scroll-jacking, CSS scroll-snap only for card rows, transform/opacity animations only, one canvas rendering only while visible.

## 6. TECHNICAL STANDARDS

**Transitions**
- Curtains are ONLY for entering the Red Room.
- Into DHAMAAKA: home → a gold/white studio-light flare → the opener; from the Red Room → a 3-frame film-reel flicker → the short opener.
- The route changes only while the screen is covered. The cover opens when the destination's first frame has rendered, or after 1.2 s at most.
- The badge stays visible and moving through every transition. There are never black or empty frames.

**Badge loading**
- Preload all three badge GLBs after the loader goes idle, and immediately on hover, focus or touch of any world link.
- Mount all skins once (hidden, not unmounted) and pre-compile them with `renderer.compileAsync`.
- Keep a still-image fallback per skin (`public/media/badge-*-still.webp`) that crossfades to 3D when ready.
- Badge choreography falls back to the hero pose when scroll progress is undefined.

**Scroll**
- Lenis on desktop (lerp ~0.12, `wheelMultiplier` ~1.15). Native scrolling on mobile.
- Scrolling must work with Motion ON and OFF.
- Scene-progress keys must match the registered section ids.

**Performance budgets**

| Metric | Target |
|---|---|
| Frame rate | 60 fps desktop, at least 55 fps on a mid-range phone; no frame over 33 ms during scroll or transitions |
| Draw calls | At most 120 desktop and 70 mobile per world (DHAMAAKA at most 30) |
| Load | LCP ≤ 2.5 s on mobile; CLS ≤ 0.05; INP ≤ 200 ms |
| Shaders | No compiles after load |
| Memory | No growth across 20 route changes |

**Assets:** GLBs Meshopt-compressed with WebP or KTX2 textures; repeated props instanced; every standing model grounded by its bounding box; uniform scale only; flames on anchor empties; at most 3 real point lights per world.

**Accessibility:** semantic DOM for all content; the canvas `aria-hidden`; DOM twins for interactive 3D; contrast at least 4.5:1 (scrims over busy art); visible focus; touch targets at least 44 px. Reduced motion and the Motion toggle give composed stills and 300 ms crossfades.

**Client-facing finish:**
- favicon, Apple touch icon and PWA icons from the badge;
- Open Graph images per page (the posters/flyer);
- meta titles and descriptions;
- JSON-LD Organization + two Events (no offers);
- a winking-badge 404;
- styled selection and scrollbar per world;
- zero console errors or warnings.

## 7. HOW TO WORK (five passes; stop and report after each one)

Keep a checklist file, `REFINEMENT_TODO.md`, and update it as you go. Work through it without stopping to ask unless something is truly blocked or needs a creative decision only the human can make. Use your screenshot and browser abilities to critique your own output honestly; you read screenshots very accurately, so look closely.

**Pass 1 · Audit (no code changes)**
- Run the site in a **visible** browser window; background tabs pause `requestAnimationFrame` and give false results.
- Capture desktop (1440×900) and phone (390×844) screenshots of every scene, and recordings of a full scroll of each page and of every transition and tab switch.
- Score each scene 1–10 against §4. List the top problems per scene, verify every item in §2's known-issues list, and record fps, draw calls, program count and Web Vitals.
- Deliver a prioritised plan.

**Pass 2 · Stability and smoothness**
- Fix every glitch, transition, loading, scroll and placement bug, and anything that breaks the budgets. Nothing visual is "polished" until this pass is clean.

**Pass 3 · Art direction**
- Bring each world up to §5: composition, light, materials, typography and the DHAMAAKA flyer rebuild. Show before/after pairs.

**Pass 4 · Motion and interaction**
- Choreography, scroll feel, micro-interactions, transitions and the mobile app's feel (tab bar, card expand, haptics where supported).

**Pass 5 · Finish and QA**
- Copy QA against §3, accessibility, SEO/OG/PWA, testing on a real iPhone (Safari) and Android (Chrome), and a final re-score against Pass 1.
- Prepare a **client walkthrough**: a short `CLIENT_WALKTHROUGH.md` with the best screenshots, what's new, and how to move around the site and app. Then wait for approval before deploying.

**Report format after each pass:**
- what changed (with file references);
- before/after screenshots;
- recordings;
- metrics;
- anything you chose not to do, and why;
- open questions (as few as possible).

## 8. ACCEPTANCE (all must be true)

- Every scene scores at least 9/10 in your before/after table, and the DHAMAAKA hero visibly matches the flyer's theme.
- **The site works from every entry point:**
  - Opening each world from every path works perfectly: door, nav, the other world's link, mobile Events card, direct URL, refresh, and back/forward.
  - That holds with Motion ON and OFF, on desktop and phone, and with an empty cache on Slow 4G.
- No black, empty or striped frames; no floating or sunk models; no layout shift; no console errors.
- The §6 budgets are met.
- Content matches §3 exactly; there are no outbound links and no booking.
- Desktop and mobile both feel finished enough to show the client today.

---

### Why effort `xhigh`

This is a long, multi-hour, multi-file job that needs visual judgment and careful verification. Claude Opus 5.5 defaults to `medium`. `xhigh` is the level Anthropic documents for long-running agentic and coding work. Keep `max` for a single stubborn problem that `xhigh` hasn't solved after one attempt, because it costs a lot more for small gains on most work. Use `high` for follow-up fixes after you review a pass, and `medium` for small copy or style tweaks. If you run Opus 5.5 through the API, set `max_tokens` to 128,000 (the model's maximum) so long turns aren't cut off.
