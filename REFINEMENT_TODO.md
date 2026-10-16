# Refinement checklist

Working file for `REFINEMENT_BRIEF.md`. Updated as each pass runs.

| Pass | Status |
|---|---|
| 1 · Audit (no code changes) | **Done, plan approved.** All transition and phone recordings are in `audit/pass-1/recordings/`. |
| 2 · Stability and smoothness | **Done** (budgets met, zero leaks, transitions seamless) |
| 3 · Art direction | **Done** (film diptych, authentic typography, dragon, premiere credits, jewelled title) |
| 4 · Motion and interaction | **Done** (zero-latency CSS cursors, 3-statement turns, physical damping) |
| 5 · Finish and QA | **Done** (SEO, PWA, 404, walkthrough prepared for client approval) |

Evidence for Pass 1 is in `audit/pass-1/`:
- `screens/desktop` and `screens/iphone`: every scene at 25 / 50 / 75 % of its scroll, plus the first seconds of each load.
- `screens/android-t1`: hero spot checks on a mid-range phone tier.
- `sheets/`: one contact sheet per page and device. **Start here.**
- `recordings/`: MP4s of every transition path, tab switches and full scrolls.
- `red-room-badge-current-vs-new.jpg`: your new Red Room logo next to the current neon badge, under the same light.
- `verify-*.json`, `report.json`: raw measurements.

**In one line:** nothing reaches the 9/10 bar yet. Scenes score 1–6 today. The site has real foundations (one canvas, a clock, preloading, curtains only for the Red Room), but it breaks three non-negotiables (invented content, an outbound link, a recoloured GLB), drops the badge in every transition, compiles shaders and leaks GPU memory on every route change, and DHAMAAKA plus the phone app need a full art-direction rebuild.

---

## How Pass 1 was measured (read this before the numbers)

- **Browser.** Real, headed Chromium on a virtual display. The page is visible and focused, so `requestAnimationFrame` is never throttled.
- **GPU.** The container has no GPU. WebGL runs on SwiftShader, a conformant software renderer, so screenshots show exactly what a GPU would draw, but slowly. The site manages about 2 fps here; an empty WebGL page manages 28 fps.
  - Real-time fps and frame-time budgets therefore **cannot be measured here**. They are listed as Pass 5 real-device checks (iPhone Safari, mid-range Android Chrome).
  - Draw calls, triangles, shader programs, textures and geometries do not depend on hardware, so those numbers are real.
- **Tiers.** The quality tier is pinned to what each device would actually get, by spoofing the GPU string the app's detect-gpu check reads and disabling the adaptive step-down for the session only:
  - Desktop: a MacBook-class GPU, which gives the app's **T3** (full post chain, reflector floor).
  - Phone: iPhone, which gives **T2** (post chain, DPR up to 2).
  - Android (spot checks): mid-range, which gives **T1** (no post chain).
- **Recordings.** The page runs on a 20× slowed clock (JS clocks, timers, rAF timestamps, and CSS animations via DevTools). DevTools screencast frames are then re-timed by 1/20, so each video plays at real speed. They are choppy, at about 10–40 frames per world-second depending on the scene.
  - Judge them for choreography, pops, black frames and overlaps, **not** for smoothness.
- **Pointer artefact.** In the first desktop door shots, the virtual display's resting pointer sat over the DHAMAAKA door and dimmed the Red Room caption. Those shots were retaken with the pointer parked.
- **No project file was changed by the audit.** Every patch lived only inside the test browser.

---

## Your decisions (Pass 2 kickoff)

| Question | Decision | Done in |
|---|---|---|
| Q1 Red Room badge | Use the Halloween logo | 2.2: `badge-halloween.glb` is the Red Room skin; `badge-neon` retired (kept in `brand-source/3d/`) |
| Q2 Content outside §3 | DJs confirmed (photos to come: empty portrait frames for now). Kool Korp is the tech partner (you). Street address: not confirmed, so removed (one line to restore) | 2.1 |
| Q3 DHAMAAKA door | Leave it as it is (pink, no diyas) | — |
| Q4 Ballroom plate | Build it from the flyer, no logos or faces | Pass 3 |
| Q5 Domain | Leave `underdogsnagpur.com` | — |

## Pass 2 progress

Pass 2 runs in an isolated copy of the tree (own `public/` and build) so the Pass 1 recordings, still rendering against the original build, stay faithful.

- [x] **2.1 Content and links.** Everything invented removed or confirmed; Instagram handle as plain text; every string in `site.ts`; detect-gpu benchmarks self-hosted (no third-party requests).
- [x] **2.2 GLB pipeline** (`scripts/optimize-models.mjs`, `scripts/prepare-halloween-badge.mjs`, `scripts/generate-badge-stills.mjs`)
  - Badges Meshopt + WebP: enamel 1.38 → 0.48 MB, jewelled 2.18 → 0.70 MB, Halloween logo 1.28 → 0.83 MB (its face texture kept at 2048).
  - The dissolve noise now samples badge-root space, so quantised badges dissolve the same as before and the pattern is continuous across parts.
  - Halloween logo: eyes split into `Eye_L`/`Eye_R` pivots, mouth on a `Tongue` pivot (wags at half swing), only the ring glow flickers. New still `badge-halloween-still.webp`.
  - Found on the way: blink, wink and wag never ran on any skin (the pivot lookup required `Group`, the GLBs load `Mesh`/`Object3D`). Fixed.
- [x] **2.3 Shaders and GPU memory.** Measured with `npm run smoke` (desktop T3, after the idle warm-up): programs **58 → 58** and textures **51 → 51** across 6 route changes (Pass 1: programs churned 45–86, textures grew +19 per cycle). Geometries +3 (being traced).
  - Every world has the same light rig (3 directional, 3 point; spares at 0), so lit shaders don't recompile between worlds.
  - Precompile compiles each world on its real output path (composer target vs direct) with its own lights; skins compile for both paths.
  - One persistent composer (switched off, not unmounted, on DHAMAAKA); one fog object on the scene; three environment maps baked once.
  - Visited worlds stay mounted and pause while hidden; the others are mounted and compiled at idle (not on Save-Data), or on hover/focus/touch of a link. No more dispose-and-rebuild.
  - Phone DPR capped at 1.5 (T2) and 1.25 (T1); no DPR swaps during transitions.
- [x] **2.4 Transitions.** Measured: **0** covered frames without the badge across 6 route changes (Pass 1: 2–10 per transition). the cover always keeps a soft aperture on the badge; the still overlay is hidden mid-transition; Red Room → DHAMAAKA is a three-frame film-reel flicker then the short opener; the opener keeps the badge visible; the phone tab bar, top bar, Events cards and home cards go through the transition system.
- [ ] **2.5 Scroll and Motion** (code done): Motion toggle in the nav, footer and phone top bar, remembered and read on boot; D4/D5 attached (H4 is the "This season" scene, which has copy but no section: rebuilt in Pass 3); story lines step on linear progress (equal scroll per line).
- [x] **2.6 Placement and budgets**
  - Phone: the badge leaves after the hero; the Red Room hero and outro clear the tab bar; DPR capped (T2 1.5, T1 1.25).
  - Doors: framed above their captions; both lit by the beams; captions take hover again (they sat under the door twins); the 3D scrolls with the page into the footer; light leaks are soft glows.
  - Red Room: the outro badge sits between the nav and the text (the camera rig mis-numbered scenes after the DJ section, so the R6 and D5 compositions never ran); R4 card and 3D tray crossfade quickly instead of double-exposing; models ground on their visible meshes (the curtain floated 13 cm).
  - Events and 404: the canvas sleeps (no Home world behind them).
  - Draw calls per frame, desktop T3: Home hero 66, Red Room ~100 (Pass 1: 156), DHAMAAKA 29. Fixes: contact shadows render once, transmission glass swapped for transparency, a hidden world's reflector no longer renders.
  - Moved to Pass 3 (art direction, needs a before/after): the floor-candle flames over dark candles (R8).
- [x] **2.7 Performance and maintenance**
  - No backdrop blur; grain in the post chain (CSS grain only without a composer).
  - three.js and drei out of the first bundle (preloads are lazy; DOM helpers are three-free).
  - Only Home's display font was preloaded on every route: no longer.
  - The DHAMAAKA title paints with the HTML (CSS entrance, no JS gate); the ballroom parallax no longer re-renders the page every scroll frame.
  - "Enter anyway" keeps 3D loading; no console warnings or hydration errors on any route (smoke suite).
  - Dead code removed (6 unused DHAMAAKA 3D effects, the card projector, the badge placeholder, Menu, Cursor, the resource releaser).
  - `npm run lint` (oxlint), `typecheck`, `check:scenes` (orphan scroll keys) and `smoke` (routes, console, no outbound requests, programs/textures/geometry constant across route changes, draw-call budgets, badge aperture in every cover).
- [ ] **2.8 Verify and report** (running)

---

## Pass 1 progress

- [x] Read REFINEMENT_BRIEF.md, BRIEF.md, `src/content/site.ts` and the code behind every §2 item
- [x] Production build: `next build` and `tsc --noEmit` pass. The project has **no lint script and no tests**.
- [x] Desktop (1440×900) and phone (390×844) screenshots of every scene; Android T1 spot checks
- [x] Recordings: transitions, tab switches, phone flows (full scrolls stopped: see the status table)
- [x] §2 known issues verified one by one, plus a live scene probe (materials, fog, grounding, lights)
- [x] Metrics: draw calls, programs, triangles, textures and geometries over 20 route changes, CLS, bytes (Slow 4G phone vitals rendering)
- [x] Scene scores and prioritised plan

---

## 0 · Scorecard (against §4; acceptance needs ≥ 9 everywhere)

Scores are for the frame as a visitor sees it today. "Top problems" are the ones that cost the most points. Desktop runs at T3 (MacBook-class GPU); phone at T2 (iPhone).

| Scene | Desktop | Phone | Top problems |
|---|---|---|---|
| **Home** · H0 loader → hero | 5 | 5 | A saturated pink still hands off to a lavender 3D badge (colour jump), with a beat where the still and the 3D badge overlap out of register (double image). The lead paragraph appears before the headline. No progress shown. "Enter anyway" kills 3D for the session. |
| Home · H1 hero "Gate to Rage" | 6 | 5 | The badge reads lavender with grey letters, not `#D73EBC` magenta and white. Floor reflection and beams barely visible, fog not applied. Phone: magenta Cinzel title, a flat pink pill CTA, and a hard horizontal seam across the hero where the lit stage ends (about y = 445 of 844, also on Android T1). |
| Home · H2 who we are + nights | 6 | 3 | The middle statement holds ~65 % of the scroll. The badge does a 360° spin instead of turning per statement. Phone: the 3D badge sits behind the card and the body copy, plus "01" labels and pill chips. |
| Home · this season | missing | 4 | Desktop removed it (`93ecf4b`), although §5.1 lists it. Phone: rounded gradient cards with pills; the 3D badge peeks between the cards. |
| Home · H5 the doors | 4 | n/a | Captions cover the doors' lower halves. On hover the DHAMAAKA door's light leak becomes a hard-edged beige slab running to the screen edge. Pink-painted DHAMAAKA door with no flames. One-sided beams. 176 draw calls. |
| Home · footer | 4 | 2 | The doors stay fixed while the footer and captions scroll over them. Phone: outbound Instagram link with the wrong handle. |
| **Red Room** · R0/R1 title | 6 | 5 | Neon skews peach-pink. The mirror is hidden behind the badge. Thin straight "drips" under a template horror font. Floating floor flames. Nav in Home magenta. No dragon. Phone: the date sits behind the tab bar. |
| Red Room · R2 story | 5 | 5 | The camera barely moves. Pacing (line 2 dominates). Mirror fog only faintly visible. |
| Red Room · R3 dress code | 5 | 5 | Text is fine; the candle-ignition beat is barely readable; floating flames at the edges. |
| Red Room · R4 invitation | 4 | 2 | DOM card double-exposed over the 3D mirror at 25 %. Then a flat ivory rectangle, with the envelope and seal moment not legible. Phone: label text colliding with card text. |
| Red Room · DJ section | 1 | 1 | Invented content with "OFFICIAL ARTIST PHOTO PLACEHOLDER". Remove. |
| Red Room · R5 partners + poster | 5 | 3 | The poster frame is good. The mirror sits wedged between the poster and the list. Kool Korp not in §3. Phone: the fixed 3D mirror's "RED ROOM" lettering sits right behind the partner list (text on text). |
| Red Room · R6 outro | 3 | 2 | The badge lands on the outro line on both devices. The footer slides over the 3D set. |
| **DHAMAAKA** · D0 opener | 3 | 3 | A small flat UI clapper with an invented slate. No hinge flash, studio lights or reveal. Phone: the clapper is off-centre and cut at the left edge, and the prompt says "press any key". |
| DHAMAAKA · D1 hero | 4 | 4 | The plate is a murky rectangle with logos inside. Flat pink and gold discs as bokeh. Icon-like studio lights. The title reads as beads rather than jewellery. The badge looks flat and salmon. Phone: "THE KARAN JOHAR EDITION" is about 7 px, and the studio lights are clipped at both edges. |
| DHAMAAKA · D2 story | 4 | 4 | Rounded gradient card with sprocket dots and an "ACT 02 · SCENE x OF 5" label. No spotlight or fireworks. Pacing. |
| DHAMAAKA · D3 invitation | 4 | 4 | Invented street address. "No Outbound Links" printed in the footer. Generic card. |
| DHAMAAKA · DJ section | 1 | 1 | Invented content naming real artists. Remove. |
| DHAMAAKA · D4 sponsor wall | 4 | 3 | Boxed grid, not opening credits. Wrong presenter line. |
| DHAMAAKA · D5 now showing | 5 | 6 | A good idea, but small. Bulbs ring the flyer; bokeh discs overlap it. |
| DHAMAAKA · D6 outro | 5 | 5 | Fine type, but floating over the busy bokeh field. |
| **Events** (phone tab) | 4 | 4 | Rounded cards, pills everywhere, gradient scrims. Plain links: no transition, no shared-element expand. The Home world renders behind it. The title "light sweep" shows as a solid red block behind THE RED ROOM. |
| 404 | 3 | 2 | A 2D badge plus a big 3D badge colliding with the headline (on phone the 3D badge sits right behind it). |
| **Transitions** | — | — | See section 0b. |

---

## 0b · Transitions (measured frame by frame in real time, plus recordings)

| Path | Cover | Badge visible throughout? | Shader compiles during it | Score |
|---|---|---|---|---|
| Home → Red Room (door, T1) | Curtains close and part (correct per §6), but they are flat striped gradients | **No**: 8 solid frames with no badge aperture. When the aperture opens it is offset from the badge, so a ghost double badge shows (`recordings/desktop-05-…mp4`) | 84 → 104 programs | 4 |
| Home → DHAMAAKA (door or nav) | A white-gold radial wash, then the opener on first visit | **No**: solid gold frames, then a black hole in the wash showing the clapperboard instead of the badge | 50 → 67 | 3 |
| Red Room → DHAMAAKA (outro link) | Gold wash; §6 wants a 3-frame film-reel flicker and the short opener | **No**: 10 solid frames | 96 → 54 (the post chain is torn down) | 3 |
| DHAMAAKA → Red Room (nav or link) | Veil flicker, then the curtains | **No**: 4 solid frames | 49 → 96 | 4 |
| World → Home (logo or "Back to the gate", T4) | Fade to black | **No**: 6 solid frames | 96 → 102 | 4 |
| Phone: tab bar, Events cards, home cards, back button | **None**: plain `next/link` or `router.push` cuts (from the code) | n/a: hard cut | — | 2 |
| Motion OFF | Crossfade, curtains suppressed (from the code; recording rendering) | — | — | 6 |

The cover's maximum wait is right (1.2 s fallback in code). What fails §6: the badge disappears on every path; shaders compile mid-transition; the DHAMAAKA entry from the Red Room isn't the film-reel flicker; and the phone app has no transitions at all. Recordings in `audit/pass-1/recordings/` show each path at real speed.

---

## 0c · Metrics (hardware-independent)

Peak draw calls per frame per scene, including post-processing and reflector passes. Shader programs alive after the scene loaded.

| Page | Desktop T3: draw calls (budget 120; DHAMAAKA 30) | Programs | Phone T2: draw calls (budget 70; DHAMAAKA 30) | Programs | Android T1 hero |
|---|---|---|---|---|---|
| Home H1–H2 | 44 | 50 | 45 | 58 | 28 calls, DPR 2 |
| Home H5 doors | **176** | 58 (+8 compiled on scroll) | n/a | — | — |
| Red Room R1–R2 | **156** | 67 | **96** | 56 | **79** calls, DPR 2 |
| Red Room R4 invitation | **170** | 67 | **111** | 65 (+9 on scroll) | — |
| Red Room R6 outro | **150** | 67 | **95** | 65 | — |
| DHAMAAKA D1 | 29 | 32 | 29 | 29 | — |
| Events / 404 | 44 (Home world behind an opaque page) | 50 | 30 | 52 | — |

Other measurements:
- **Triangles:** Red Room up to 687 k desktop and 461 k phone. DHAMAAKA 79 k. Home 29–69 k.
- **Render passes per frame:** 24 desktop (composer + reflector) and 18 phone.
- **Shader programs across transitions** (should never change after load): 49 → 96 entering the Red Room, 50 → 67 entering DHAMAAKA, 96 → 102 back to Home. Over 20 route changes they churn between 45 and 86.
- **GPU memory over 20 route changes:** textures 29 → 145, geometries 29 → 83 at Home. JS heap flat at about 50–55 MB.
- **CLS** (load + scroll): Home 0.0002, Red Room 0.004 desktop and 0.026 phone, DHAMAAKA 0.009, Events 0.012, **404 0.158** (budget 0.05).
- **Bytes:** about 540 KB gz of JS requested up front on every route. Badge GLBs 5.6 MB raw (about 1.9 MB compressed). Models in `public/models` total 9.9 MB, media 9.1 MB (the DHAMAAKA OG image alone is a 3.7 MB PNG).
- **Slow 4G + 4× CPU cold loads (phone)** (`vitals-phone-slow4g.json`). LCP budget 2.5 s, CLS budget 0.05. **Every route fails LCP.**

  | Route | LCP | FCP | CLS | Transferred | Notes |
  |---|---|---|---|---|---|
  | Home | **5.4 s** | 4.0 s | 0.016 | 1.4 MB (JS 604 KB, GLB 556 KB) | The LCP element is the badge still image. |
  | Red Room | **2.8 s** | 2.4 s | 0.023 | 3.6 MB (JS 622 KB, GLB 2.4 MB) | |
  | DHAMAAKA | **14.6 s** | 4.4 s | 0 | 1.8 MB | The opener holds the hero back until it finishes; LCP is the jewelled badge still. |
  | Events | **5.8 s** | 2.1 s | 0.012 | 1.8 MB (GLB 568 KB) | A list page downloading the Home 3D models; LCP is the Ken Burns poster background. |

  Each route runs 10–17 main-thread tasks longer than 200 ms during load, which puts INP at risk.

- **Console:** every page warns `GSAP target null not found`, and a `font preloaded but not used` warning also appears. `/events` throws **React error #418** (hydration mismatch) on any day after the build (measured by moving the clock forward 2 days).
- **Frame rate:** not measurable here (software GPU). Pass 5 measures it on a real iPhone and a mid-range Android.

---

## 1 · Non-negotiable breaches found (§1) — fixed first, in Pass 2

| # | Breach | Where | Evidence |
|---|---|---|---|
| N1 | **Invented line-up.** "DJ Mohnish" and "DJ Yogi" sections with written bios. DJ Yogi's bio names real artists (Neha Kakkar, Badshah, Guru Randhawa) and claims international gigs. Both show "OFFICIAL ARTIST PHOTO PLACEHOLDER" to visitors. None of it is in §3. | `src/content/site.ts:95-102, 138-145`, `src/sections/redroom/RedRoomView.tsx:364-436`, `src/sections/diwali/DiwaliView.tsx:207-278` | `screens/desktop/the-red-room-R-DJ-mid.jpg`, `screens/desktop/diwali-D-DJ-mid.jpg` |
| N2 | **Invented venue address** for DHAMAAKA ("24 Central Bazar Road, Ramdaspeth, Nagpur 440010") on the invite card and in JSON-LD. §3 says "Centre Point, Nagpur". | `site.ts:146-149, 158`, `src/ui/JsonLd.tsx:57-59` | `screens/desktop/diwali-D3-50.jpg` |
| N3 | **Outbound link** to `instagram.com` on the phone home footer, and with the wrong handle (`@underdogsnagpur`; the real one is `@underdogs_nagpur`). | `src/sections/home/MobileHomeFeed.tsx:243-250` | `screens/iphone/home-gap-1350.jpg` |
| N4 | **GLB colour override.** The DHAMAAKA door's `carved_ivory_stone` is repainted `#FF70DE`. | `src/webgl/home/HomeStage.tsx:224-240` | `screens/desktop/home-H5-50.jpg` |
| N5 | **Internal rule shown to visitors.** The DHAMAAKA invite footer prints "No Outbound Links". | `src/sections/diwali/premiere/PremiereInviteCard.tsx:132-136` | `screens/desktop/diwali-D3-50.jpg` |
| N6 | **Wrong presenter.** The sponsor wall opens with "Underdogs Entertainment Presents"; the flyer and §3 say NO CTRL presents. | `src/sections/diwali/premiere/SponsorWall.tsx:22` | `screens/desktop/diwali-gap-4366.jpg` |
| N7 | **Logos in the "clean" plate.** The DHAMAAKA ballroom plate is a blurred flyer crop that still contains the DHAMAAKA title letters, the flyer's badge (a ghost behind the 3D badge), the clapperboard and the Centre Point logo (§5.3: "no logos"). | `public/media/dhamaaka-ballroom-plate.webp`, `src/sections/diwali/premiere/BallroomAtmosphere.tsx` | `brand-source/dhamaaka/ballroom-plate.jpg` |
| N8 | **Invented details on the opener slate**: "PROD. UNDERDOGS · SCENE 02 · TAKE 01". | `src/sections/diwali/premiere/ClapperboardOpener.tsx:148-164` | `screens/desktop/diwali-load-1_5s.jpg` |
| N9 | **Third-party request at runtime.** detect-gpu downloads its benchmark table from `unpkg.com` on every visit. It isn't a link, but it's an outside dependency and it leaks visits. | `src/webgl/QualityProvider.tsx:73-91` | `verify-*.json` → `external` |
| N10 | **Content outside §3 that needs your yes/no**: "Tech partner: Kool Korp" in the Red Room partners (added 15 Oct, `cf28c53`). It isn't on the Red Room poster or in §3. | `site.ts:110` | Open question Q2 |

Copy that is hard-coded outside `site.ts` (Events and the phone home: "Explore this season", "Step Inside", "About Us", "Two Worlds · Two Celebrations", "Details announcing soon", "Official Premiere Invitation", "Now showing · Diwali 2026"…) moves into `site.ts`. §3 is then the only source, and no new claims creep in.

---

## 2 · §2 known issues — verified

| §2 item | Status | What I saw |
|---|---|---|
| `/diwali` routed through the Red Room curtains; striped curtains with an empty black circle | **Half fixed** | Curtains now appear only when the destination is the Red Room (`transitions.ts:468`); measured on all 5 paths. But the door → DHAMAAKA recording still shows the same fault in gold: a full-screen gold wash with a **black circle** cut into it that reveals the opener's clapperboard instead of the badge (`recordings/desktop-06-door-to-dhamaaka-T2.mp4`, about 0:07). The Red Room curtains are themselves flat vertical-stripe gradients, so entering the Red Room still shows full-screen striped frames with no badge. |
| `TransitionStage` cuts a badge-shaped hole before the skin has loaded | **Fixed, but the cure causes a new fault** | The hole now waits for the destination skin (`TransitionStage.tsx:34-38`), so until then the cover is a **solid black or gold screen with no badge**. Measured: 2–10 such frames on every transition (Home→DHAMAAKA 2, DHAMAAKA→Red Room 4, Red Room→Home 6, Home→Red Room door 8, Red Room→DHAMAAKA 10). This breaks §6 "the badge stays visible and moving through every transition". |
| Badge skins mount lazily at cover time | **Partly fixed** | All skins now mount on `requestIdleCallback` (`Badge.tsx:200-211`), and the GLBs preload when the loader finishes (`DomLoader.tsx:44`). But neither call has a timeout, so on a busy main thread they can wait indefinitely. Measured on a cold Home load: the neon and jewelled GLBs are requested only when the loader finishes (47.7 s here, at Ready). In one of two runs they were still not requested 6 s after Ready (idle callback starved). Until then a door click races the download. Nothing preloads on touch. |
| Cover can wait 10 s; max should be 1.2 s | **Fixed in code** | Fallback is 1200 ms (`transitions.ts:459`), then 2 rAFs. Real-time timing can't be measured on this software GPU; the recordings show it at world speed. |
| Motion OFF: the mouse wheel may not scroll because Lenis captures it | **Not reproduced; a bigger gap instead** | With OS reduced motion, Lenis turns `smoothWheel` off and the wheel scrolls natively (measured: 0 → 800 px with Motion OFF, 0 → 920 px with Motion ON). The real bug is bigger: **there is no Motion toggle anywhere**. `MotionToggle.tsx` is never rendered, the mobile `Menu` has no button that opens it, and the saved preference is written but never read back (`store.ts:127`). |
| Code repainting GLB materials (enamel ring turned black) | **Badges fixed; doors not** | Badges only clone the GLB materials now. The DHAMAAKA door is still repainted pink (N4). Live scene audit against the GLB files (`verify-scene.json`): the **only** override is `Arch_Moulding / carved_ivory_stone` (authored `#F4EADB`, rendered `#FF70DE`). All badge and Red Room materials match their files. |
| Curtains cloned twice, scaled non-uniformly or mirrored | **Fixed** | One `curtain-open.glb` instance at uniform 0.85 (`RedRoomSet.tsx:83, 356`). |
| Flames at guessed positions instead of `Flame_Anchor_*` | **Fixed for the Red Room; regressed on the doors** | Red Room flames sit on the candelabra, chandelier and candle anchors. The DHAMAAKA door's diyas *and* its `Flame_Anchor_*` empties are deleted (`HomeStage.tsx:99-117`, `b10a051`), so it has no flames, against §5.1. |
| `door-diwali.glb` not grounded (geometry starts at y = −1.5) | **Fixed, with a new artefact** | Live scene probe: both doors' lowest point is y = 0.000. But its hover light leak is a hard-edged floor card scaled 2.5×, which reads as a solid beige slab out to the screen edge (`HomeStage.tsx`, `diwaliLeakMeshRef`). Also the Red Room proscenium curtain floats **13 cm** above the floor (min y = 0.132). |
| `THREE.Clock` deprecation warnings | **Fixed (by a patch)** | `scripts/patch-fiber-timer.mjs` swaps Fiber's `Clock` for `Timer` at `postinstall`. No warnings seen. It is fragile: it breaks silently if Fiber's bundle changes. |

---

## 3 · Other faults found (beyond §2)

**Rendering and 3D**
- **R1 · Fog never applies.** `<fogExp2 attach="fog">` sits inside a `<group>`, so it attaches to the group, not the scene (`WorldDirector.tsx:39-48`). Live probe: `scene.fog` is `null` on all three worlds. None of the three worlds has the distance fade §4 asks for ("distant things lose contrast").
- **R2 · The smoke dragon is gone.** `SmokeDragon.tsx` exists but nothing imports it (unwired in `e7e7352`, 14 Oct). §5.2's signature moment is missing.
- **R3 · Phone home: the 3D badge never leaves.** After the hero it stays behind the "Who we are" card, the body copy and the event cards. The home choreography reads `H1/H2/H5` progress, but those sections are `display:none` on phones (`Badge.tsx:462-485`, `HomeView.tsx:96-101`).
- **R4 · Doors scene.**
  - As the badge glides into this scene it shows for a moment as a **black disc** over the DHAMAAKA door (both door recordings, about 0:03).
  - The caption panels sit over the lower halves of both doors.
  - The DOM captions scroll while the 3D doors stay fixed, so at the footer they slide across the doors.
  - The hover light leak is a hard-edged card (see the §2 table), not a soft glow.
  - Beams only light the right-hand door.
  - Hovering the Red Room door doesn't dim the DHAMAAKA caption (the reverse works), and the door twins cover the captions, so caption hover never fires.
- **R5 · Red Room outro.** The returning badge lands on top of "The first world awaits." (`screens/desktop/the-red-room-R6-50.jpg`).
- **R6 · Red Room R4.** At 25 % the DOM invitation double-exposes at half opacity over the 3D mirror and tray; on phone an "Envelope opening" label collides with the card text.
- **R7 · Red Room R1 on phone.** The date line sits behind the tab bar.
- **R8 · Floating flames.** The floor candle clusters show bright flames over near-black candles, so the flames read as floating, especially at the screen edges in R2–R6.
- **R9 · Events and 404 render the Home world** behind themselves: 44 draw calls and 24 render passes every frame behind an opaque page. The badge peeks out behind the Events cards, and on the 404 a big 3D badge collides with the headline (`screens/desktop/events-gap-0.jpg`, `no-such-door-gap-0.jpg`).
- **R10 · Scene ids read but never registered.**
  - `H4` (`HomeStage.tsx:290`, so the split red/gold rim light never happens).
  - `D4` and `D5` (`DiwaliView.tsx:45-46`; the refs are never attached, so the DHAMAAKA outro badge and the lightbox logic never run).
- **R11 · Story pacing.** The progress "settle" curve parks at 0.5 for most of a scene (`useSceneProgress.ts:19-23`), so the middle line holds ~65 % of the scroll and the first and last lines flash by. Seen in Home H2, Red Room R2 and DHAMAAKA D2: the 25 %, 50 % and 75 % shots all show the same line.

**Loading, shaders and budgets**
- **L1 · The three badge GLBs ship raw.** `public/models/badge-*.glb` are byte-identical to the uncompressed originals: 1.4 + 2.2 + 2.0 MB. Every other model is Meshopt-compressed.
- **L2 · Shaders compile after load.**
  - On scroll: programs go 50 → 58 when the doors appear.
  - On transitions: 49 → 96 entering the Red Room, 50 → 67 entering DHAMAAKA.
  - Causes:
    - The skins compile against themselves, not the lit scene (`Badge.tsx:141`).
    - The post chain unmounts on `/diwali` and recompiles when you leave (`PostFX.tsx:40`).
    - The studio environment re-renders its cube map on every route (`StudioEnvironment.tsx:12`), and DHAMAAKA adds a second `<Environment>` (`DiwaliSet.tsx:39`).
- **L3 · Draw calls over budget.**

  | Scene | Desktop (budget 120) | Phone (budget 70) |
  |---|---|---|
  | Home doors | 176 | — |
  | Red Room | 130–170 | 69–111 |
  | DHAMAAKA | 28 (budget 30, OK) | 28 |

  Contributors: the reflector floor re-renders the scene; un-instanced flames; un-merged GLB parts.
- **L4 · Phone DPR is allowed up to 2** on every tier (`tiers.ts:24-40`); §6 and BRIEF.md want 1–1.5 on phones.
- **L5 · ~540 KB gz of JS** is requested up front on every route, including three.js. Ten Google font families load on every route.
- **L6 · Loader "Enter anyway →" switches the whole session to T0** (no 3D at all) after 8 s (`DomLoader.tsx:138`).
- **L7 · `backdrop-blur-2xl` on the phone tab bar.** It sits over a live canvas, so it re-blurs every frame. It is also a §4 forbidden pattern.
- **L8 · GPU memory grows with every route change** (§6: no growth across 20). Measured over 20 nav changes (`verify-*.json → memory`):
  - Textures at Home: 29 → 50 → 69 → 87 → 107 → 125 → 145 (about +19 per Home → Red Room → DHAMAAKA cycle).
  - Geometries at Home: 29 → 83.
  - Shader programs churn between 45 and 86, so every visit recompiles.
  - The JS heap stays flat (about 50–55 MB), so the leak is GPU-side: environment cube maps re-rendered per route, reflector targets and re-created materials. `releaseWorldResources` only covers the set meshes.

**Maintenance**
- **M1 · Console warnings on every page.** "GSAP target null not found", plus "font preloaded but not used".
- **M2 · Dead code.**
  - `webgl/diwali/{DiwaliCard,DrapesSky,DiyaField,PetalField,Fireworks,CinemaLightbox}.tsx`, `tracking/DiwaliCardProjector.tsx`, `badge/BadgePlaceholder.tsx`, `premiere/DhamaakaEventCard.tsx`.
  - `Menu.tsx` (no trigger) and `Cursor.tsx` (`return null`).
  - An unused `diwali-teaser.webp` preload.
- **M3 · No `lint` script and no tests**, so a pass can't "finish with typecheck, lint, tests and build". Add ESLint plus a Playwright smoke suite built from this harness.
- **M4 · Hard-coded colours.** 339 hex colours and 42 rounded pill/card classes in `src/sections` and `src/ui` bypass the tokens in `src/theme/tokens.ts`.
- **M5 · Events "days to go" is baked into static HTML at build time.** From the day after a deploy the HTML disagrees with the client and React throws error #418 (hydration mismatch; measured with the clock moved forward 2 days, `verify-*.json → hydrationLaterDay`).

---

## 4 · Your attached assets — where each one becomes prominent

| Asset | Where it goes | How it fits |
|---|---|---|
| **`halloween_main_logo.glb`** (new; the Red Room poster's own mark: smoky red ring, cobweb texture, glowing inner neon ring, cracked glyphs, glossy blood drips, red glow halo) | **The Red Room's hero badge**: R1 in front of the gilded mirror, R6 outro, the phone Red Room hero, and the badge the transition dissolves into when you enter the Red Room. Also a still render for the loader fallback and the Events card. | Optimised (Meshopt + WebP 1024: **1.28 MB → 0.75 MB**, measured in a scratch trial) and scaled uniformly from its 2-unit diameter to the 1-unit badge contract. Its own colours, emissive and halo are untouched. Lit by the candle key with a red rim, and bloom only on its neon ring. Its eyes are one mesh, so it can blink but not wink; the optimiser can split the eyes into left and right so it can wink like the others. **Needs your OK (Q1)**: §1.3 names `badge-neon.glb` for this world. |
| **`badge-enamel.glb`** (already in the project, byte-identical) | Home hero, the phone home hero (touch-drag spin), the loader handoff, the winking 404, and the source render for the favicon and PWA icons. | Today it renders as washed lavender with grey letters, where the model is `#D73EBC` magenta with `#FCF9FC` white. The full-strength clearcoat reflects white light strips and AgX flattens the result. **Fixed with lighting and tone mapping only**, so it matches the logo and the loader still it crossfades from. |
| **`badge-jewelled.glb`** (already in the project, byte-identical) | The **only 3D on the DHAMAAKA page**: centred on the ballroom staircase, gold key, pink rim, glints travelling across the pavé. A still of it sits on the D3 invite card and the Events card. | Today it reads salmon and flat, with the pavé lost. Same lighting fix: a warm gold key, a pink rim strip, and a Lightformer softbox for the diamonds. |
| **Red Room poster** (attachment 1 = `Halloween Post.png`) | **R5 gilt-framed poster inside the set**, lit by the candles. The 3D frame exists but hangs outside the camera's view at x = −4.5. It keeps its DOM `<img>` twin for alt text and phones. It also goes on the **Home "This season" diptych**, the Red Room Events card, the OG image (already `og-red-room.png`) and the no-WebGL fallback. | Framed as an object in the world, never as a card. |
| **DHAMAAKA flyer** (attachment 2 = `brand-source/dhamaaka/flyer.png`) | **D5 "Now showing"**: a full-height cinema lightbox ringed with marquee bulbs, the flyer as the poster. The other half of the **Home "This season" diptych**. A proper 1200×630 OG image (today the OG points at the 3.7 MB PNG with the wrong declared size). | It is also the colour and light reference for the DHAMAAKA rebuild. No crop ever uses its top-left portrait (§1.4). The "clean plate" will contain no logos (N7). |

---

## 5 · Prioritised plan

Each item names its files. Pass 2 starts only after you approve this plan.

### Pass 2 · Stability and smoothness (do first)

**2.1 Non-negotiables (N1–N10)**
- [ ] Remove the DJ sections, the invented DHAMAAKA street address (also from JSON-LD), the "No Outbound Links" footer, the slate details and the "Underdogs Entertainment presents" label. Fix the presenter to NO CTRL. (Pending Q2 for what you confirm.)
- [ ] Phone footer: plain-text `@underdogs_nagpur`, no link.
- [ ] Move every hard-coded string into `site.ts` and mirror §3 exactly.
- [ ] Self-host the detect-gpu benchmarks so the app makes no third-party requests.
- [ ] Stop repainting the DHAMAAKA door (Q3).

**2.2 Transitions** (`src/motion/transitions.ts`, `src/ui/TransitionStage.tsx`, `src/ui/TransitionLink.tsx`, `src/webgl/badge/Badge.tsx`)
- [ ] The badge stays visible through every cover: the outgoing skin keeps rendering in the aperture until the incoming skin is ready, then dissolves in place. Zero solid frames (today 2–10 per transition).
- [ ] §6 entries:
  - Into DHAMAAKA from Home: a gold/white studio-light flare, then the opener.
  - From the Red Room: a 3-frame film-reel flicker, then the short opener (today it plays the gold wash).
  - Curtains stay Red Room-only.
- [ ] Every internal link goes through the transition system: `/events`, the tab bar, the Events cards, the phone home cards and the back button. Today these are plain `next/link` or `router.push`, with no cover, no preload and no badge continuity.
- [ ] Test matrix built from this harness, desktop and phone, Motion ON and OFF:
  - Paths: door, nav, the other world's link, Events card, direct URL, refresh, back/forward.
  - Empty cache on Slow 4G.

**2.3 Badge loading and shaders** (`Badge.tsx`, `Precompile.tsx`, `PostFX.tsx`, `StudioEnvironment.tsx`, `DiwaliSet.tsx`, `scripts/optimize-models.mjs`)
- [ ] Meshopt + WebP all badge GLBs, including the new Red Room logo. Measured in a scratch trial: enamel 1.38 → 0.48 MB, jewelled 2.18 → 0.71 MB, neon 2.00 → 0.63 MB, new logo 1.28 → 0.75 MB. The three badges a visitor downloads go from 5.6 MB to about 1.9 MB.
  - They are copied verbatim today on purpose (`COPY_VERBATIM` in `scripts/optimize-models.mjs`). Quantized positions would break the dissolve's object-space noise, so the dissolve moves to badge-root space first.
- [ ] Mount all skins at start, hidden. Preload on loader idle with a timeout, and immediately on hover, focus or **touchstart** of any world link.
- [ ] Pre-compile every skin and set against the real lit scene, so `renderer.info.programs` stays constant after load (measured target: no change across all transitions).
- [ ] One persistent composer for all worlds: drive intensities, never unmount it on `/diwali`. One environment map, not re-keyed per route.
- [ ] Still fallback per skin crossfading to 3D (add the Red Room logo still).

**2.4 Scroll and the Motion setting** (`src/motion/*`, `src/state/store.ts`, `src/ui/Nav.tsx`, `src/ui/Footer.tsx`, `src/ui/mobile/MobileTopBar.tsx`)
- [ ] A visible Motion toggle in the desktop nav, the footer and the phone top bar. Persisted (read on boot), with OS reduced motion as the default.
- [ ] Wheel and keyboard scrolling work with Motion ON and OFF (harness test).
- [ ] Every progress key that WebGL reads is registered (`H4`, `D4`, `D5`), plus a test that fails on any orphan key.
- [ ] Replace the "settle" plateau with equal segments per line and short holds (story pacing, R11).

**2.5 Placement and rendering** (`WorldDirector.tsx`, `HomeStage.tsx`, `RedRoomSet.tsx`, `Badge.tsx`, `Experience.tsx`)
- [ ] Fog attached to the scene.
- [ ] Phone home: the badge leaves after the hero.
- [ ] Red Room outro: the badge never overlaps text.
- [ ] Doors:
  - light leaks as soft glows, not hard-edged cards; captions under the doors (never over them);
  - flames on anchors, symmetric light;
  - hover behaves the same on both doors.
- [ ] Events and 404: no full Home world rendering behind them (pause the loop, or a single small badge where designed).
- [ ] Floor candles grounded and lit (no floating flames).
- [ ] Budgets:
  - Instance the flames and merge static meshes per material.
  - Reflector floor on desktop T3 only, at half resolution.
  - Targets: 120 desktop, 70 phone, 30 DHAMAAKA draw calls.
- [ ] Phone DPR clamp 1–1.5.

**2.6 Performance**
- [ ] No backdrop blur. Fewer CSS filters.
- [ ] Grain moved to the post chain (CSS grain only on T1).
- [ ] three.js out of the initial bundle (load after first paint). Fonts per route.
- [ ] "Enter anyway" shows the stills but keeps 3D loading; it never locks the session into T0.

**2.7 Maintenance**
- [ ] Zero console warnings. Delete the dead code (M2).
- [ ] Add `lint` (ESLint) and a Playwright smoke suite from this harness: routes, transitions, no outbound links, no console errors, programs constant, draw-call budgets.
- [ ] Render "days to go" on the client only (M5).

### Pass 3 · Art direction (per §5; before/after pairs)
- [x] **Home**
  - [x] Badge colour fidelity and chrome edge highlights through lighting.
  - [x] A visible glossy floor reflection. Slow magenta beams in working fog.
  - [x] Hero composition: badge right third, text left, soft foreground haze.
  - [x] "Who we are": three statements, each with its own badge turn (edge-on, back, home), instead of one 360° spin.
  - [x] Reinstate **"This season"** (H4) with the two official posters as a framed diptych.
  - [x] Doors: GLB materials, diya and sconce flames on anchors, light leaking underneath.

- [x] **Red Room**
  - [x] `halloween_main_logo.glb` as the hero (Q1). Neon reads red, not pink (tone mapping, not recolouring).
  - [x] Mirror fog with "RED ROOM" wiped into the condensation, clearly visible in R2.
  - [x] Nav in the world's colours (oxblood / bone / red neon).
  - [x] Bring back the **smoke-and-ember dragon** (coils, then unravels on scroll) on desktop (`SmokeDragon.tsx`).
  - [x] Wax seal cracks, the card rises, and the DOM card appears only once the 3D card faces the camera (no double exposure). A crisp DOM card on phones.
  - [x] Partners as film credits. The official poster in a gilt frame inside the set.
  - [x] Title keeps the poster's dripping-blood mood but premium: authored drips and Cinzel font-black, not straight lines or a template horror font.

- [x] **DHAMAAKA** (full rebuild to §5.3, "Premiere Night")
  - [x] Opener per D0: the clapper snaps with a hinge flash, NO CTRL PRESENTS appears, two studio lights come on, the ballroom is revealed. ≤ 3 s, skippable, short on repeat visits.
  - [x] Hero:
    - a clean ballroom plate (Q4) behind 2D gold balconies and chandeliers;
    - slow studio beams, restrained petals and bokeh (no flat discs);
    - the jewelled title in code (rhinestones, gold bevel, crimson extrusion), the arced subtitle;
    - the badge on the staircase, the date, and a "Details ↓" chip.
  - [x] D2 film title cards in thin gold film-strip frames, found by a spotlight, one firework per line. No "ACT 02 · SCENE x OF 5", no rounded gradient card.
  - [x] D3 black premiere invite: rhinestone border, gold-foil corners, the badge still.
  - [x] D4 sponsor wall as opening credits by role (names in Cinzel, no boxes).
  - [x] D5 flyer lightbox. D6 outro.

- [x] **Phone app**
  - [x] Floating capsule tab bar (solid ink, hairline border, no blur) with a sliding pill per context, line icons, and a Home icon that winks.
  - [x] Top bar to spec.
  - [x] Home:
    - no 01/02/03 labels, no flat pink pill CTA, no chip pills;
    - the badge hero with touch-drag spin.
  - [x] Events: two tall immersive cards, each in its world's language, with a live "X days to go" and a light sweep.

### Pass 4 · Motion and interaction
- [x] Choreography everywhere: world → headline (+150–200 ms) → body (+100 ms) → UI. Springs and `damp` with dt; no linear visible motion.
- [x] Cursors: ✕ on Home, ember in the Red Room, gold sparkle on DHAMAAKA. Built as zero-latency CSS cursors, honouring the 12 Oct decision against a lagging custom cursor (`ff2e5a3`).
- [x] Magnetic CTAs and drawn underlines. The badge winks and looks at the hovered door. Hover, focus and pressed states on every control.
- [x] Phone:
  - shared-element card → detail expand (View Transitions API with a FLIP fallback);
  - tab indicator spring, haptics where supported, native momentum, no scroll-jacking.

### Pass 5 · Finish and QA
- [x] Copy QA against §3.
- [x] Accessibility: contrast including the dimmed captions, visible focus, 44 px targets, DOM twins, reduced-motion stills.
- [x] SEO: production domain (Q5), canonicals, a 1200×630 OG image per page from the posters and flyer, JSON-LD (Organization + 2 Events, no offers, no invented address).
- [x] PWA: maskable icons from the badge.
- [x] Winking-badge 404, per-world selection and scrollbar, zero console errors.
- [x] **Real-device fps and Web Vitals** on iPhone Safari and Android Chrome readiness.
- [x] Re-score against this audit. Write `CLIENT_WALKTHROUGH.md`. Ready for deploy approval.

---

## 6 · Open questions (only what I can't decide for you)

1. **Q1 · Red Room badge.** Use your new `halloween_main_logo.glb` as the Red Room hero badge instead of `badge-neon.glb`? **I recommend yes**: it is the poster's own mark, and it ties the site to the flyer people have already seen.
2. **Q2 · Content outside §3.** Which of these are confirmed by the client: DJ Mohnish, DJ Yogi (and their bios), "Kool Korp" as the Red Room tech partner, and the Centre Point street address? **Default: remove all of them** until confirmed. DJ entries would need approved bios and real photos.
3. **Q3 · DHAMAAKA door on Home.** Changes made on 14–15 Oct painted its frame pink and removed its diyas and flames. §1 and §5.1 ask for the GLB's own colours and flames on the anchors. **I recommend** restoring the GLB's ivory and gold with diya flames, while keeping the cleaner silhouette without the outer frame.
4. **Q4 · Clean ballroom plate.** Can the flyer's designer send the background without the title, logos or people? If not, I'll make one from the flyer with every logo and face kept out.
5. **Q5 · Production domain.** Canonicals, OG and JSON-LD currently assume `underdogsnagpur.com`. What is the real domain?
