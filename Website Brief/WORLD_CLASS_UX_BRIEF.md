# WORLD_CLASS_UX_BRIEF.md
## Underdogs: a world-class UI/UX, layout and smoothness pass (website + mobile app)

> **For Kulviir (the agent can skip this box).** Save this file in the project root. In Antigravity choose **Gemini 4 Argon**, **Planning mode**, and paste the kickoff message from the bottom. Approve each phase only after you've looked at its screenshots.

---

## PART 0: YOUR ROLE AND THE GOAL

You are the design director and lead front-end engineer of a studio that builds flagship sites for the world's top event, nightlife and luxury brands. Your job is to take the **existing** Underdogs website and mobile web app (PWA) to world-class: Awwwards Site of the Day quality on desktop, and on mobile it should feel like a native app.

**"World class" here means:**
- Every screen has **one clear focal point**, a confident typographic hierarchy, and generous, rhythmic spacing.
- Motion is **purposeful, physical and consistent**: one motion language, never decorative noise.
- It holds **60 fps** while scrolling and during transitions, on a mid-range Android phone and a 3-year-old laptop.
- Nothing jumps, flashes, overlaps, clips or waits without feedback.
- Each of the three worlds feels distinct, yet clearly from one brand:
  - **Home:** "Gate to Rage", ink and magenta;
  - **The Red Room:** Halloween, candlelit red and neon;
  - **DHAMAAKA:** Diwali, rani-pink and gold premiere glamour.

**Read first:** `AGENTS.md` (this Next.js version differs from your training data, so read `node_modules/next/dist/docs/` before touching routing, metadata or images), `BRIEF.md`, `REFINEMENT_BRIEF.md`, `MR_DOG_BRIEF.md`, and `src/content/site.ts`.

---

## PART 1: NON-NEGOTIABLES

1. **Content stays exactly the same.**
   - Every fact, name, date, venue, partner, line of copy and section's *meaning* comes from `src/content/site.ts`, and you don't change, add or remove facts.
   - Unknowns stay "Announcing soon".
   - You may **re-layout, re-order within a page, re-style, re-pace and re-animate**. You may not rewrite copy unless it's a typo, and if so, list it for approval.
2. **Informative only:** no booking, RSVP, tickets or outbound links. Instagram appears as plain text.
3. **The 3D stays the hero.** Keep the persistent canvas, the badge GLBs and their materials (never override GLB colours), the per-world badge skins and the dissolve. Mr. Dog stays in the chat UI. Improve framing and choreography, not identity.
4. **One clock:** the GSAP ticker drives Lenis and then R3F (`frameloop="never"`). Use `damp` with `dt`, never fixed lerps. No shader compiles after load.
5. **No real-person likeness** (DHAMAAKA is "The Karan Johar Edition" by name only). Don't ship the watermarked logo.
6. **Respect Motion OFF and `prefers-reduced-motion`** everywhere.
7. **Honest QA.** Never disable, skip or weaken a test, check or lint rule to make it pass. Never claim a result you didn't measure. Every "before/after" claim comes with real screenshots or trace numbers.

---

## PART 2: PHASE 1, AUDIT (STOP FOR APPROVAL AFTER THIS)

Run the site locally and audit **every route on desktop (1440, 1280, 1024) and mobile (390, 375, 412 px, plus the installed PWA)**: `/`, `/events`, `/the-red-room`, `/diwali`, the 404 page, the loader, the transitions between every pair of routes, the Mr. Dog chat, and the menu.

Write `UX_AUDIT.md` with screenshots, scoring each item 1–5 and listing concrete issues:

| Area | What to check |
|---|---|
| **Layout** | Grid consistency, alignment, spacing rhythm, empty or dead zones, cramped zones, duplicated content, section order, above-the-fold clarity, the content's reading path |
| **Typography** | Type scale, line lengths (45–75 characters), line height, letter-spacing on caps, widows and orphans, font-loading flashes, too many typefaces |
| **Colour and contrast** | WCAG AA for every text and background pair, the accent discipline in each world |
| **Motion** | List every animation and transition with its duration and easing. Flag inconsistent timings, jank, double animations, scroll-jacking, anything over 600 ms without purpose, and layout shift |
| **Performance** | Lighthouse (mobile and desktop) per route, LCP, CLS, INP, JS per route, GLB and texture weight, a performance trace while scrolling each route (dropped frames, long tasks), memory after visiting all routes |
| **Mobile app** | Tab bar, safe areas, tap targets ≥ 44 px, scroll physics, the keyboard, back gestures, install experience, splash and theme colour, orientation |
| **Accessibility** | Keyboard path, focus visibility, screen-reader landmarks and headings, reduced motion, alt text |
| **Consistency** | Button, link, card and caption styles across pages; anything that looks like it came from a different site |

End with the **10 changes that would most improve the experience**, ranked by impact versus effort, and a **phase plan**. **Stop and wait for my approval.**

---

## PART 3: THE DESIGN SYSTEM (PHASE 2)

Consolidate everything into tokens in `src/theme/tokens.ts` and CSS variables, then refactor the components to use only those.

- **Grid:** 12 columns on desktop (max content width ~1280 px, gutters 24–32 px), 4 columns on mobile with 20 px side margins. Every section aligns to it.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160. Section rhythm is consistent: 128–160 px between major scenes on desktop, 72–96 px on mobile.
- **Type scale:** a fluid `clamp()` scale with at most six steps (display, h1, h2, h3, body, caption). Each world keeps its display face, and the body and UI type stay one family everywhere. Caps get tracking of 0.08–0.28em, used consistently. Use `text-wrap: balance` on headings and `pretty` on body text.
- **Colour:** one neutral system (ink, paper, steel) plus **one accent per world**. Each accent is used for emphasis only, never as large flat fills, except on intentional moments.
- **Components:** one button and link system (primary CTA, quiet text link, icon button), one card style per world sharing the same structure, one caption style, one divider, one "Announcing soon" treatment, and one lightbox.
- **Radius, borders and shadows:** a small, consistent set. The glass treatment (blur plus hairline) is reused, not reinvented.

---

## PART 4: LAYOUT AND STORYTELLING (PHASE 3)

Keep each page's content and order of ideas, but compose it like a film.

- **Home:**
  - The hero badge and "Gate to Rage" must be striking within one second.
  - The page then moves through *Who we are* → *Nights we've thrown* → *This season* → *Choose a door* → footer, and each scene gets one idea and one focal point.
  - There must be **no duplicated "choose a world" content**. The flyers live faintly behind the doors, with a "View official flyer" lightbox (if that isn't already done, do it).
  - The "Nights we've thrown" list should feel like a premium archive (marquee or editorial list), not a plain list.
- **/events:** two equal, beautiful world tiles that preview each world's mood, with date and place in a consistent caption, plus the badge skin or door art.
- **The Red Room:** candlelit, cinematic and readable. The event details (date, venue, dress code, partners) must be **scannable in under 5 seconds** in one clear "invitation" block. Atmosphere never covers information.
- **DHAMAAKA:** a premiere-night grandeur with editorial restraint. The title card, the details card, the artist (if `site.ts` has one), the partner wall and the outro. Pink and gold are used with discipline, and it should feel luxurious, never kitsch.
- **Footer and 404:** finish the story with the same craft.
- **Mobile (PWA):** don't shrink the desktop; **recompose** for the thumb.
  - Primary information is reachable in one scroll, cards are full-bleed, and the tab bar (Home | Mr. Dog | Events) is clean and safe-area-correct.
  - Sticky contextual headers on event pages.
  - Swipeable galleries only where they help.

---

## PART 5: MOTION AND SMOOTHNESS (PHASE 4)

**One motion language.** Define it in `src/motion/eases.ts` and document it in `MOTION.md`:

| Token | Duration | Use |
|---|---|---|
| `micro` | 120–160 ms | Hovers, presses, toggles |
| `ui` | 220–320 ms | Menus, sheets, cards, captions |
| `scene` | 600–900 ms | Section reveals, the badge re-skin, world transitions |

- **Two eases only:**
  - "out", for entrances, like `cubic-bezier(0.16, 1, 0.3, 1)`;
  - "in-out", for transitions between states.
- **Springs only for physical objects:** the badge, the coin, the sheet drag.
- **Reveals:** text lines rise 12–24 px with a short stagger of 40–60 ms, at most once per element. No reveal waits on scroll position after the content is already visible.
- **Scrolling:**
  - Lenis is tuned so the wheel feels weighty but responsive. Touch is native.
  - No scroll-jacking: sticky scenes never trap the user, and the scroll position always matches the content.
- **Route transitions:**
  - Under 1.2 s total, interruptible, with the route swapped only while the screen is covered.
  - Back and forward are instant and restore the scroll position.
  - Prefetch on hover and on viewport entry.
- **Perceived speed:**
  - The loader shows the pink badge immediately and never blocks longer than needed.
  - Use skeleton or placeholder states for anything async, so no element ever pops in without a transition.
- **60 fps rules:**
  - Animate only `transform`/`opacity`/`filter` (light), and never layout properties.
  - Use `will-change` only during an animation.
  - No React re-renders per frame; use refs and transient zustand subscriptions.
  - Pause offscreen 3D work, the canvas when hidden, and the world render under full-screen sheets.
  - Use instancing for repeated props; cap DPR by tier; keep `PerformanceMonitor` tiers working.
- **Images:** next/image with correct `sizes`, AVIF/WebP, blur placeholders for flyers, fixed aspect ratios (zero CLS), and preload only the LCP image.
- **Fonts:** subset, `font-display: swap` with metric-matched fallbacks (no visible reflow), and preload only the display font needed above the fold.

---

## PART 6: PERFORMANCE AND QUALITY TARGETS (MEASURED, NOT CLAIMED)

| Metric | Mobile | Desktop |
|---|---|---|
| Lighthouse performance | ≥ 85 on every route | ≥ 95 |
| LCP | < 2.5 s (4G, mid-range) | < 1.5 s |
| CLS | < 0.02 | < 0.02 |
| INP | < 150 ms | < 100 ms |
| Scroll frame rate (trace, 10 s per route) | ≥ 58 fps median, no long task > 100 ms | ≥ 60 fps median |
| Accessibility (Lighthouse + axe) | 100 / 0 serious issues | same |

Record the before and after numbers in `UX_RESULTS.md`, with the trace screenshots.

---

## PART 7: PHASES (approval gate after each)

| Phase | Work | Deliverable |
|---|---|---|
| **1. Audit** | Part 2 | `UX_AUDIT.md` + screenshots + plan. **Stop.** |
| **2. Design system** | Part 3: tokens, grid, type, components; no visual regressions yet | Component sheet page at `/_styleguide` (noindex, removed before production or behind an env flag) |
| **3. Layout** | Part 4, page by page: Home → Events → Red Room → DHAMAAKA → footer/404 → mobile | Before/after screenshots per page at all breakpoints |
| **4. Motion and smoothness** | Part 5 | `MOTION.md`, screen recordings of transitions, traces |
| **5. Performance** | Part 6 targets | `UX_RESULTS.md` |
| **6. QA and handoff** | Full regression on every route and breakpoint, Motion OFF, reduced motion, keyboard, screen reader, PWA install, Mr. Dog chat, 3D tiers T0–T3 | `CLIENT_WALKTHROUGH.md` with screenshots |

Work on the branch **`feat/world-class-ux`**. Make small, well-named commits, and make sure `npm run build` passes at every commit. If a change risks breaking the 3D, transitions or Mr. Dog, stop and ask.

---

## KICKOFF MESSAGE (paste into Antigravity)

```
Read WORLD_CLASS_UX_BRIEF.md in full, then AGENTS.md (and the Next docs it points to), BRIEF.md, REFINEMENT_BRIEF.md, MR_DOG_BRIEF.md and src/content/site.ts.

You are the design director and lead front-end engineer of a studio that builds flagship sites for the world's top event and nightlife brands. Make the Underdogs website and mobile web app world-class in UI/UX, layout and smoothness — WITHOUT changing any content or facts (site.ts is the single source of truth; unknowns stay "Announcing soon"; no booking or links).

Create the branch feat/world-class-ux and do Phase 1 only: run the site, audit every route at 1440/1280/1024 and 390/375/412 px plus the installed PWA, measure Lighthouse and scroll traces, and write UX_AUDIT.md with real screenshots, scores, issues, the top 10 changes ranked by impact vs effort, and your phase plan. Then stop and wait for my approval.

Never disable or weaken tests or checks to make them pass, and never report a number you didn't measure.
```
