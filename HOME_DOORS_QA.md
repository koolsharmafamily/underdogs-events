# Home Page Hero Climax: Doors & Flyer Backdrop Merge QA Report

**Branch:** `feat/doors-flyer-blend`  
**Date:** October 16, 2026  
**Quality Bar:** Blue-chip event house flagship — restrained, cinematic, zero clutter.

---

## 1. Executive Summary

Previously, the Underdogs Events Home page presented the user with two back-to-back "choose a world" sections:
1. **H4:** Framed diptych poster cards featuring the official flyers.
2. **H5:** Interactive 3D WebGL doors and caption cards.

In this release, both sections have been unified into **ONE cinematic hero climax**:
- **Removed Duplicate Diptych:** The duplicate poster cards from H4 were eliminated, while retaining the season headline and tagline text block, cleanly moved to the top of the scene as the hero introduction.
- **Ghosted Flyer Backdrops (WebGL Desktop):** Each official flyer (`/media/red-room-poster-1024.webp` and `/media/dhamaaka-flyer-1024.webp`) is rendered directly inside the WebGL canvas on a dedicated plane ~0.6m behind its respective 3D door.
- **Custom Shader Atmosphere:**
  - Resting opacity at $\approx 0.14$.
  - Desaturated $\approx 25\%$ and tint-mixed $\approx 45\%$ toward each world's palette (ember red `#4A0706` for Red Room; rani pink `#E0217A` + gold for Diwali).
  - Soft procedural arch mask feathered 15–20% matching the door silhouette, plus a vertical floor haze melt.
  - Soft focus via texture LOD bias (mip LOD 2.2).
  - Film grain blending with scene lighting.
  - Interactive hover state: active door's flyer sharpens and rises to $\approx 0.32$, while inactive dims to $\approx 0.06$.
  - Gentle pointer parallax (~30% of door parallax), perfectly grounded and synchronized with door elevation.
- **Accessible Official Flyer Lightbox:**
  - Under each caption card, a quiet text button *"View official flyer"* (Cinzel 11px, 0.24em tracking, 70% opacity $\to$ 100% on hover) opens the official flyer full-size in an in-page modal dialog.
  - Accessible focus trap, `Esc` dismiss, body scroll lock, dark scrim backdrop, max 88–90vh, zero outbound links/downloads.
- **Mobile Experience (`< md`):**
  - Consolidated into a single "This season" section.
  - Mobile cards display coin artwork in front with a faint, tinted, arch-masked, blurred flyer backdrop via CSS only (0 extra WebGL calls on phones, preserving 60 fps).
  - Tap target = whole tile navigates to the world; *"View official flyer"* button opens the full-screen lightbox sheet.
- **Tier Fallback (T0/T1 or WebGL disabled):**
  - CSS-based ghosted flyer backdrop positioned behind door captions with world-tint mix, arch mask, and 2px blur.

---

## 2. Multi-Breakpoint Visual Verification

### 2.1 Desktop 1440px Viewport (Resting State)
![Desktop 1440px Doors Blend](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_1440px.png)
- **Top:** Season headline (*"TWO WORLDS. TWO CELEBRATIONS. ONE UNFORGETTABLE SEASON."*).
- **Center:** 3D doors rising into view with faint, feathered ghosted flyer backdrops visible behind each door.
- **Bottom:** Clear caption cards with primary action (*"ENTER WORLD ONE / TWO →"*) and quiet *"View official flyer"* trigger.

---

### 2.2 Breakpoint Progression (1024px & 768px)
| 1024px Landscape / Small Desktop | 768px Portrait Tablet |
|---|---|
| ![1024px Breakpoint](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_1024px.png) | ![768px Breakpoint](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_768px.png) |

---

### 2.3 Mobile 390px Viewport
| Mobile Feed ("This Season") | Mobile Full-Screen Flyer Lightbox |
|---|---|
| ![Mobile 390px Feed](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_390px_feed.png) | ![Mobile 390px Lightbox](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_lightbox_390px.png) |

---

## 3. Interaction States

### 3.1 Door Hover & Active Flyer Revelation
| Red Room Door Hovered | Diwali Door Hovered |
|---|---|
| ![Hover Red Room](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_hover_redroom.png) | ![Hover Diwali](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_hover_diwali.png) |
- **Hover Red Room:** Red flyer sharpens (LOD $2.2 \to 1.0$) and rises to opacity 0.32; Diwali flyer dims to 0.06.
- **Hover Diwali:** Diwali flyer sharpens and rises to opacity 0.32; Red Room flyer dims to 0.06.

---

### 3.2 In-Page Lightbox Modals
| Red Room Official Lightbox | Diwali Official Lightbox |
|---|---|
| ![Red Room Lightbox](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_lightbox_redroom.png) | ![Diwali Lightbox](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_lightbox_diwali.png) |

---

## 4. Resilience & Fallback Tests

### 4.1 Motion OFF Mode
![Motion OFF](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_motion_off.png)
- Flyers remain static at resting opacity 0.14 without pointer parallax or damped opacity lag.

### 4.2 T1 / T0 Fallback Mode
![T1 Fallback](file:///C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/doors_blend_t1_fallback.png)
- When WebGL is disabled or tier is T0/T1, the CSS layer automatically displays the faint tinted, arch-masked, 2px blurred flyer behind each door caption.

---

## 5. Technical Verification & Budgets

| Test / Audit | Result | Status |
|---|---|---|
| **Leftover H4 References** | 0 references in `src/` (badge choreography & camera rig re-timed directly from H2 to H5) | **PASS** |
| **Scene Progress Keys** | `npm run check:scenes` $\to$ 14 registered, 14 read, 0 pending | **PASS** |
| **TypeScript Validation** | `npm run typecheck` $\to$ 0 errors | **PASS** |
| **Production Build** | `npm run build` $\to$ Successful compilation, 10 static prerendered routes | **PASS** |
| **Shader Precompilation** | Compiled during initial loader via `HomeStageGroup` in `Precompile.tsx`; 0 scroll-time compiles | **PASS** |
| **Console Errors** | 0 console errors across all breakpoints and interactions | **PASS** |
| **Lighthouse Accessibility** | **100 / 100** | **PASS** |
| **Lighthouse Best Practices** | **100 / 100** | **PASS** |
| **Lighthouse SEO** | **100 / 100** | **PASS** |
| **Cumulative Layout Shift (CLS)** | **0.012** (Target: $< 0.05$, zero new CLS) | **PASS** |
| **Informative Rule** | Zero outbound links, zero downloads, no ticket booking | **PASS** |

---

## 6. Conclusion
The merged Home scene delivers a cohesive, cinematic climax fitting a blue-chip event house. The doors remain the clear interactive heroes while the official flyers provide subtle depth and context, remaining fully accessible on demand via the cinema lightbox.
