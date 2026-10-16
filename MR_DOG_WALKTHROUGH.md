# Mr. Dog — Underdogs Mascot & AI Concierge Walkthrough

**Branch:** `feat/mr-dog`  
**Date:** October 16, 2026  
**Status:** Complete (Phases 1–7 Verified)

---

## 1. Executive Summary

Mr. Dog is the official mascot and AI concierge for **Underdogs Events**, bringing Nagpur's premier nightlife brand to life with real-time conversational intelligence, 3D character animation, and responsive UI across desktop and mobile.

### Core Principles Maintained
- **Strictly Grounded in `site.ts`:** Mr. Dog answers exclusively from verified event facts. Any unannounced details (ticket prices, exact set times, VIP passes) are answered with *"Announcing soon"* or *"Keeping that under wraps"*.
- **Informative Only:** Zero ticketing links or outbound URLs.
- **Server-Side API Security:** The AI key is never bundled into client assets (verified with 0 occurrences in `.next/static`).
- **Zero Asset Contention:** No Mr. Dog assets or 3D models load before the site loader finishes (`store.phase === "complete"`).
- **Graceful Performance Degradation:** T2/T3 devices with Motion ON experience the real-time 3D Three.js model; T0/T1 or Motion OFF devices seamlessly receive optimised 2D stills.
- **Single Canvas Render on Mobile:** The main world canvas is paused via `chatCovering` while the mobile chat sheet is active, preserving 60 FPS scrolling.

---

## 2. Desktop Experience (≥ 768px)

### 2.1 "Ask Mr. Dog" Roll-Link in Top Navigation
An interactive roll-link button has been seamlessly integrated into the primary desktop navigation bar next to *The Red Room* and *DHAMAAKA*. Tapping it opens the Mr. Dog panel directly.

### 2.2 Floating Launcher Pill
- **Docked Position:** Fixed bottom-right (`bottom-6 right-6`), completely clear of other fixed UI elements.
- **Footer Collision Avoidance:** An `IntersectionObserver` detects the footer entering viewport and smoothly shifts the launcher upward.
- **Idle Life:** The 56px avatar winks every ~20 seconds (`avatar-wink.webp`).
- **Hover & Focus:** The avatar tilts 8° with a scale-up, label illuminates, and preloading of `mr-dog.glb` begins automatically.
- **Contextual Nudge:** After 20 seconds on `/the-red-room` or `/diwali` with no interaction, a gentle bubble appears: *"Got questions? I'm right here."*

### 2.3 3D Stage & Non-Modal Dialog Panel
- **Anchored Dialog:** 400px wide glassmorphic panel (`bg-[#090A0E]/94`, `backdrop-blur-2xl`) with world-accent glow and hairline border.
- **Peeking 3D Canvas:** A dedicated 280×280px WebGL canvas mounted in the header, allowing Mr. Dog to peek 45% above the panel.
- **Lighting:** Warm key light, soft fill, and a vivid rim light in the active world's accent colour (Home: `#EA28C1`, Red Room: `#FF1A35`, Diwali: `#E5B25D`).
- **World Outfit Switching:** Mr. Dog wears his bomber jacket on Home, vampire cape with fangs on Red Room, and Rani pink Bandhgala with gold zari on Diwali. Changing routes while chat is open triggers a smooth 360° turn on Y, swapping clothing when facing away.

---

## 3. Mobile App Experience (< 768px)

### 3.1 Raised Center Button in Docked Tab Bar
- **3-Column Architecture:** `[ Home | Mr. Dog | Events ]`.
- **Raised Silhouette:** 60px circular button raised 20px above the bar with Mr. Dog's ears breaking out of the top rim.
- **Conic Sheen:** Slow 8-second rotating accent ring with active-tab glow.
- **Dynamic ✕-Eyes Close State:** While the sheet is open, Mr. Dog's eyes transform into the brand ✕ eyes (`avatar-x`), turning the button into an intuitive close control (`aria-label="Close Mr. Dog"`).

### 3.2 Full-Screen Chat Sheet
- **Coverage:** Extends from top safe area down to the top of the tab bar, keeping Home and Events accessible with a single tap.
- **Visual Viewport & Keyboard Handling:** When the mobile virtual keyboard opens, the 3D stage smoothly collapses to a compact 56px avatar header, pinning the chat input directly above the keyboard.
- **Android Back Gesture:** Intercepts `popstate` to close the sheet without resetting page scroll or triggering route transitions.
- **World Canvas Pause:** Activates `chatCovering: true`, skipping world canvas renders while covered by the sheet.

---

## 4. Visual Verification & Deliverable Screenshots

All screenshots were captured live in production mode via Playwright Chromium.

| View | Screenshot | Description |
|---|---|---|
| **Desktop Home Panel** | `desktop_home_panel.png` | 3D Mr. Dog peeking above panel in Home bomber outfit with magenta rim lighting. |
| **Desktop Red Room Panel** | `desktop_redroom_panel.png` | Vampire cape with fangs, red rim light, and theme-accented chat panel. |
| **Desktop Diwali Panel** | `desktop_diwali_panel.png` | Rani Bandhgala with gold zari, warm gold lighting, and Diwali quick-replies. |
| **Mobile Home Tab Bar** | `mobile_home_tabbar.png` | Docked 3-column navigation with raised center Mr. Dog button and breakout ears. |
| **Mobile Sheet & Conversation** | `mobile_sheet_conversation.png` | Full-screen chat sheet with 3D model, streaming typewriter, and ✕-eyes close button. |
| **Mobile Red Room Sheet** | `mobile_redroom_sheet.png` | Red Room Dracula outfit in mobile sheet with red accents. |
| **Mobile Diwali Sheet** | `mobile_diwali_sheet.png` | Diwali premiere outfit with gold accents and Karan Johar Edition context. |

---

## 5. Part 10 Acceptance Checklist Verification

### Model & Rig
- [x] `scripts/mr-dog-report.md` authored with complete node, pivot, and material audits.
- [x] Model compressed to **840 KB** (target ≤ 1.2 MB) with 35,010 triangles and 100/100 nodes intact in `public/models/mr-dog.glb`.
- [x] Outfits correctly toggle on `/`, `/the-red-room`, and `/diwali`.
- [x] 360° turn on Y smoothly swaps outfits when facing away.

### Answers & Backend
- [x] Facts strictly grounded in `site.ts` (`src/content/mrDogFacts.ts` budget: 2,196 / 2,500 chars).
- [x] 12/12 trap questions and 12/12 normal questions verified with transcripts in `MR_DOG_QA.md`.
- [x] Fallback FAQ engine handles multilingual Hindi, Marathi, and Hinglish queries.
- [x] Zero API key leaks in `.next/static`.

### Mobile & Motion
- [x] 3-column tab bar with raised center button and safe-area padding across all mobile views.
- [x] Visual Viewport keyboard pinning verified.
- [x] Android back gesture closes sheet without navigation jump.
- [x] World canvas pauses during `chatCovering`.
- [x] Motion OFF gracefully downgrades to 2D stills.
- [x] `npm run typecheck`, `npm run check:scenes`, and `npm run build` all pass with 0 errors.
