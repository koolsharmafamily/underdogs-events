# Mr. Dog — Phase 1 Audit & Technical Inspection Report

**Generated:** 2026-10-16  
**Branch:** `feat/mr-dog`  
**Inspected Assets:** `GLBs/mr-dog.glb` (source: `Mr. Dog/mr-dog.glb`), stills in `Mr. Dog/mr-dog-stills/`, sprites in `Mr. Dog/mr-dog-sprites/`.

---

## 1. GLB File & Geometry Summary

| Property | Value | Notes |
|---|---|---|
| **File Path** | `GLBs/mr-dog.glb` | Copied from `Mr. Dog/mr-dog.glb` |
| **Uncompressed Size** | **14.54 MB** (15,249,944 bytes) | 13.1 MB comes from 4 uncompressed 2048² PNG textures |
| **Target Compressed Size** | **≤ 1.2 MB** | Compression via `meshopt` + WebP 1024² (`scripts/optimize-models.mjs`) |
| **GLTF Version** | 2.0 | Standard binary container |
| **Total Triangles** | **38,400** | Across all 62 meshes and 3 complete outfits |
| **Total Nodes** | **100** | Rig hierarchy + sub-mesh parts + outfit variants |
| **Total Meshes** | **62** | Highly modular parts enabling zero-shader-switch outfit toggling |
| **Total Materials** | **34** | MeshStandardMaterial with PBR extensions |
| **Textures / Images** | **12 / 12** | Embedded PNGs |

### GLTF Extensions Used
- `KHR_materials_clearcoat` (satin vs gloss vinyl toy finish)
- `KHR_materials_sheen` (fabric lining on bomber and velvet cape)
- `KHR_materials_transmission` (sunglasses lenses)
- `KHR_materials_volume` (lens depth)
- `KHR_materials_ior` (refraction for lenses/eyes)
- `KHR_materials_emissive_strength` (neon red ✕ eyes glow for Red Room)
- `KHR_texture_transform` (UV coordinate transforms)

---

## 2. Rig Contract Verification

The GLB was evaluated against the character kit rig contract (§2.1 of `MR_DOG_BRIEF.md`):

| Contract Group | Required Nodes | Actual in GLB | Status |
|---|---|---|---|
| **Root, neck, head** | `MrDog_Root`, `Neck`, `Head` | `MrDog_Root`, `Neck`, `Head` | **EXACT MATCH** |
| **Ears and brows** | `Ear_L`, `Ear_R`, `Brow_L`, `Brow_R` | `Ear_L`, `Ear_R`, `Brow_L`, `Brow_R` | **EXACT MATCH** |
| **Open eyes** | `Eyes_Open`, `Eye_L`, `Eye_R`, `Pupil_L`, `Pupil_R` | `Eyes_Open`, `Eye_L`, `Eye_R`, `Pupil_L`, `Pupil_R` | **EXACT MATCH** |
| **✕ eyes** | `Eyes_X`, `X_L`, `X_R` | `Eyes_X`, `X_L`, `X_R` | **EXACT MATCH** |
| **Eyelids** | `Eyelid_L`, `Eyelid_R` | `Eyelid_L`, `Eyelid_R` | **EXACT MATCH** |
| **Face** | `Nose`, `Jowl_L`, `Jowl_R`, `Lip_L`, `Lip_R`, `Jaw`, `Tongue` | `Nose`, `Jowl_L`, `Jowl_R`, `Lip_L`, `Lip_R`, `Jaw`, `Tongue` | **EXACT MATCH** |
| **Collar** | `Collar`, `Tag` | `Collar`, `Tag` | **EXACT MATCH** |
| **Outfits** | `Outfit_Home`, `Outfit_RedRoom`, `Outfit_Diwali` | `Outfit_Home`, `Outfit_RedRoom`, `Outfit_Diwali` | **EXACT MATCH** |
| **Outfit extras** | `Fangs`, `Sunglasses` | `Fangs`, `Sunglasses` | **EXACT MATCH** |

**Contract Score:** **26 / 26 required nodes matched exactly (100%)**.

### Extra Nodes Found (69 nodes)
The model includes authored modular child nodes that provide exceptional granular control:
1. **Eyes & Expression Layers**:
   - `Sclera_L/R`, `Cornea_L/R`, `Iris_L/R`, `Pupil_Disc_L/R` (under `Eye_L/R` and `Pupil_L/R`).
   - `X_L_White`, `X_L_Neon`, `X_R_White`, `X_R_Neon` (allows swapping between standard white ✕ eyes and neon emissive ✕ eyes in Red Room).
   - `Eyelid_L/R_Skin`, `Eyelid_L/R_Rim`.
2. **Face Details**:
   - `Tongue_Mesh` (under `Tongue`).
   - `Whiskers_L/R` (under `Jowl_L/R`).
   - `Wet_Line_L/R`, `Mouth_Inside` (under `Head`).
3. **Collar & Coin Tags**:
   - `Collar_Band`, `Collar_Edge_Top/Bottom`.
   - `Tag_Ring`, `Tag_Bail`, `Tag_Chain`.
   - `Tag_Home`, `Tag_Home_Coin`, `Tag_Home_Face` (mini enamel badge tag).
   - `Tag_RedRoom`, `Tag_RedRoom_Coin`, `Tag_RedRoom_Face` (mini neon badge tag).
   - `Tag_Diwali`, `Tag_Diwali_Coin`, `Tag_Diwali_Face` (mini jewelled badge tag).
4. **Outfit Meshes**:
   - `Outfit_Home`: `Bomber_Collar`, `Bomber_Lining`, `Bomber_Lining_Edge`, `Bomber_Edge_L/R`, `Enamel_Pin` (`Pin_Rim`, `Pin_Face`).
   - `Outfit_RedRoom`: `Cape_Collar_Outer`, `Cape_Collar_Lining`, `Cape_Neck_Band`, `Fangs` (`Fang_L`, `Fang_R`).
   - `Outfit_Diwali`: `Bandhgala_Collar`, `Bandhgala_Inner`, `Zari_Rim_Top/Bottom`, `Gold_Button`, `Marigold` (`Marigold_Bloom`, `Marigold_Heart`, `Marigold_Leaf`), `Sunglasses` (`Lens_L/R`, `Rim_L/R`, `Temple_L/R`, `Bridge`).
5. **Head Skin**:
   - `Head_Skin` attached directly under `MrDog_Root`.

---

## 3. Pivot & Bounding Box Analysis

Measured origins and descendant bounds for all moving nodes (§2.2):

| Node | World Origin `[X, Y, Z]` | Subtree Bounds relative to Origin | Stated Ideal Pivot | Verification / Action |
|---|---|---|---|---|
| **`Head`** | `[0.000, 0.200, 0.000]` | `min: [-0.35, -0.03, -0.08]`<br>`max: [0.35, 0.72, 0.31]` | Neck: bottom centre of head bbox | **Verified**: Origin sits at `Y = 0.200` (`Y_min = -0.027`), precisely at the neck socket. Natural head bob, yaw, and tilt rotate around the base of the skull cleanly. |
| **`Jaw`** | `[0.000, 0.230, 0.150]` | `min: [-0.00, -0.05, 0.03]`<br>`max: [0.07, 0.01, 0.14]` | Hinge: top-back edge of jaw bbox | **Verified**: Origin is positioned at the top-back hinge point (`Y_max = +0.015`, `Z_min = +0.033`). Pitch rotation (`rotation.x > 0`) opens the mouth naturally. |
| **`Ear_L`** | `[0.165, 0.635, 0.015]` | `min: [-0.13, -0.04, -0.05]`<br>`max: [0.13, 0.27, 0.01]` | Base: bottom centre | **Verified**: Base of the ear shell sits at `Y ~ 0` relative to node. Twitches and perking rotate around the base. |
| **`Ear_R`** | `[-0.165, 0.635, 0.015]` | `min: [-0.13, -0.04, -0.05]`<br>`max: [0.13, 0.27, 0.01]` | Base: bottom centre | **Verified**: Symmetrical with `Ear_L`. |
| **`Eyelid_L`** | `[0.122, 0.404, 0.228]` | `min: [-0.06, -0.06, 0.02]`<br>`max: [0.06, 0.06, 0.06]` | Top centre of eye aperture | **Note**: Eyelid geometry is spherical. Blink works via rotation on X / scale on Y around origin. |
| **`Eyelid_R`** | `[-0.122, 0.404, 0.228]` | `min: [-0.06, -0.06, 0.02]`<br>`max: [0.06, 0.06, 0.06]` | Top centre of eye aperture | Symmetrical with `Eyelid_L`. |
| **`Tongue`** | `[0.030, 0.225, 0.190]` | `min: [-0.03, -0.10, -0.01]`<br>`max: [0.03, 0.00, 0.02]` | Root: top centre | **Verified**: `Y_max = 0.000`. Rotating on Z or X wags from the root cleanly without clipping into the palate. |
| **`Tag`** | `[0.000, 0.092, 0.191]` | `min: [-0.05, -0.11, -0.01]`<br>`max: [0.05, 0.00, 0.05]` | Ring: top centre | **Verified**: `Y_max = +0.004`. Acts as a natural pendulum swinging from the collar ring. |
| **`Jowl_L`** | `[0.150, 0.290, 0.220]` | `min: [-0.05, -0.12, 0.04]`<br>`max: [0.10, -0.01, 0.09]` | Upper outer corner | **Verified**: Origin is at top of jowl (`Y_max = -0.009`). Lifts into grin via rotation on Z/X. |
| **`Jowl_R`** | `[-0.150, 0.290, 0.220]` | `min: [-0.10, -0.12, 0.04]`<br>`max: [0.05, -0.01, 0.09]` | Upper outer corner | Symmetrical with `Jowl_L`. |
| **`Brow_L/R`** | `[±0.095, 0.482, 0.260]` | `Empty locator` | Forehead brow pads | **Note**: Present as transform locator nodes on forehead. Since the forehead skin is part of `Head_Skin`, brow acting is reinforced via eyelid adjustments and head tilt. |

---

## 4. Materials & Texture Breakdown

### Materials (34 total)
- **Vinyl Skin Materials**:
  - `Mat_Fawn_Skin` (base coat, roughness: 0.40, clearcoat: 0.30).
  - `Mat_Deep_Fawn` (wrinkles, ear backs).
  - `Mat_Black_Mask` (muzzle, eye mask, nose: roughness: 0.15, clearcoat: 1.0 - ultra glossy).
  - `Mat_Magenta_Ears` / `Mat_Tongue` (roughness: 0.30, clearcoat: 0.60).
- **Eye Materials**:
  - `Mat_Eyes_Normal` (dark brown `#2B1710`, roughness: 0.05, clearcoat: 1.0).
  - `Mat_Eyes_X_White` (white `#FCF9FC`, clearcoat: 0.80).
  - `Mat_Eyes_X_Neon` (emissive neon red `#FF2A1F`, emissiveIntensity: 4.0).
- **Outfit Materials**:
  - Home: `Mat_Bomber_Black` (satin sheen), `Mat_Bomber_Magenta_Lining`, `Mat_Pin_Chrome`.
  - Red Room: `Mat_Cape_Outer` (matte black), `Mat_Cape_Velvet_Lining` (blood red velvet sheen), `Mat_Fangs`.
  - Diwali: `Mat_Bandhgala_Rani` (`#E0217A`), `Mat_Zari_Gold` (metallic gold embroidery), `Mat_Aviators_Gold`, `Mat_Aviators_Lens` (transmission glass), `Mat_Marigold`.

### Textures & Images (12 total)
| Index | Name | MimeType | Resolution | Uncompressed Size | Role / Optimisation Path |
|---|---|---|---|---|---|
| 0 | `image_0` | `image/png` | 1024 × 256 | 243.8 KB | Collar & text decal |
| 1 | `image_1` | `image/png` | 1024 × 64 | 12.0 KB | Trim pattern |
| 2 | `image_2` | `image/png` | 1024 × 64 | 26.2 KB | Zari border strip |
| 3 | `image_3` | `image/png` | 512 × 512 | 95.4 KB | Eye catchlight / iris |
| 4 | `image_4` | `image/png` | 512 × 512 | 248.6 KB | Badge coin texture (Home) |
| 5 | `image_5` | `image/png` | 512 × 512 | 59.2 KB | Badge coin texture (Red Room) |
| 6 | `image_6` | `image/png` | 512 × 512 | 97.2 KB | Badge coin texture (Diwali) |
| 7 | `image_7` | `image/png` | 512 × 64 | 4.8 KB | Noise map |
| 8 | `image_8` | `image/png` | 2048 × 2048 | 311.8 KB | Mask roughness map |
| 9 | `image_9` | `image/png` | 2048 × 2048 | 1,949.5 KB | Head normal map |
| 10 | `image_10` | `image/png` | 2048 × 2048 | **9,719.3 KB** | Head base color map |
| 11 | `image_11` | `image/png` | 2048 × 2048 | 823.8 KB | Head AO / roughness map |

**Compression Strategy:**
- Images 8–11 will be resized from 2048² to 1024² and encoded to WebP (quality 85) via `scripts/optimize-models.mjs`.
- Vertex geometry compressed with `EXT_meshopt_compression`.
- Expected final size: **~850 KB – 1.1 MB** (well under the 1.2 MB budget).

---

## 5. Stills & Sprites Inventory

The `Mr. Dog/` folder contains a complete set of 2D assets:

| Category | Count | Resolution | Formats Available | Target Layout (`public/media/mr-dog/`) |
|---|---|---|---|---|
| **Avatars** | 12 (4 per outfit) | 256 × 256 | PNG | `avatars/{outfit}/avatar.webp`, `avatar-blink.webp`, `avatar-wink.webp`, `avatar-x.webp` |
| **Expression Stills** | 39 (13 per outfit) | 512 × 512 | PNG | `{outfit}/idle.webp`, `blink.webp`, `listening.webp`, `thinking.webp`, `talking.webp`, `talk-closed.webp`, `talk-open.webp`, `talk-round.webp`, `talk-small.webp`, `rage.webp`, `wink.webp`, `shrug.webp`, `sorry.webp`, `greet.webp` |
| **Sprite Sheets** | 3 (1 per outfit) | 2304 × 256 | PNG | `{outfit}/talk-blink-strip.webp` |

All 54 source stills exist and will be converted into crisp WebP assets meeting the ≤ 35 KB (stills) and ≤ 12 KB (avatars) budget.

---

## 6. Fixed UI Collision & Layering Audit

### Desktop (≥ 768px Viewport)
1. **Launcher Placement (`bottom-right`)**:
   - Proposed coordinate: `fixed bottom-6 right-6` (`bottom: 24px, right: 24px`), `z-index: 40`.
   - **Scene Navigation**: Sits vertically centered at `right: 8px; top: 50%; transform: translateY(-50%); z-index: 35`. Distance between bottom of scene navigation and top of launcher is > 180px. **No collision**.
   - **Header (`Nav.tsx`)**: Fixed top bar (`h-20`, `z-40`). **No collision**.
   - **Skip Link**: `top: 12px, left: 16px`. **No collision**.
   - **Transition Stage**: `fixed inset-0 z-50 pointer-events-none`. While covered, launcher will hide via `store.isTransitioning` per brief.
   - **Footer Collision (`Footer.tsx`)**: The in-flow footer contains the copyright, motion toggle, and the "Back to top" link at the right.
     - *Mitigation*: Implement an `IntersectionObserver` on `#site-footer`. When the footer intersects the bottom viewport, add a smooth translate up (`translateY(-48px)`) to maintain comfortable clearance above the footer text.
2. **Desktop Panel (`MrDogPanel.tsx`)**:
   - Anchored to bottom-right: `bottom: 88px, right: 24px`, dimensions `400px` wide × `min(640px, calc(100vh - 120px))`.
   - Non-modal dialog (`role="dialog"`, `aria-modal="false"`), closing on `Escape` or outside click.
   - 3D stage peeks 45% above panel top edge (`overflow: visible`).

### Mobile (< 768px Viewport / PWA)
1. **Tab Bar Conversion (`MobileTabBar.tsx`)**:
   - Existing: 2 columns (`Home` 50%, `Events` 50%), sliding indicator centered at 25% or 75%.
   - Required: 3 equal columns (`Home` 33.3%, `Mr. Dog` 33.3%, `Events` 33.3%).
   - Centre Button:
     - 60 px circular button raised so its center is on the bar top edge (`top: -22px`).
     - Touch target ≥ 60 × 60.
     - Conic sheen border in active world accent.
     - 52 px avatar with Frenchie ears breaking out of the top of the circle.
   - Sliding Indicator:
     - Moves between `16.67%` (Home) and `83.33%` (Events).
     - Never sits under the center column.
     - Fades out (`opacity-0`) when the chat sheet is open.
   - The Notch:
     - Smooth concave notch with 6 px clearance around the 60 px button.
     - Drawn with an SVG top hairline stroke and `clip-path` background.
2. **Page Bottom Padding Audit**:
   - Current padding on mobile:
     - `MobileHomeFeed.tsx`: `pb-28` (112px).
     - `EventsView.tsx`: `pb-28` (112px).
     - `RedRoomView.tsx` (R6 outro): `pb-[calc(76px+env(safe-area-inset-bottom))]`.
     - `DiwaliPremiereView.tsx`: `pb-24` (96px).
   - *Collision Risk*: With the raised Mr. Dog button reaching ~72px above bar base + safe area, `pb-24` or `76px` brings the last line of copy/caption right against the top of Mr. Dog's ears.
   - *Mitigation*: Standardize bottom scroll clearance on mobile to `pb-[calc(100px+env(safe-area-inset-bottom,0px))]` across all views.
3. **Mobile Chat Sheet (`MrDogSheet.tsx`)**:
   - Covers viewport from top safe area down to top of tab bar (`bottom: calc(50px + env(safe-area-inset-bottom))`).
   - The tab bar remains visible and interactive above the sheet.
   - Tapping Home or Events closes sheet first, then navigates.
   - 3D canvas active on `tier >= T2` with `chatCovering` pausing the underlying world canvas.
4. **Popstate / Android Back Guard**:
   - `Providers.tsx` handles `popstate` for T5 route transitions.
   - *Required Guard*: In `Providers.tsx`, if `window.history.state?.mrDog` or if the Mr. Dog sheet is open on the same pathname, return early and do **not** run `runRouteTransition("T5")` or restore scroll.

---

## 7. Step-by-Step Implementation Plan

### Phase 2: Backend & Facts Engine
1. **Facts Generator (`src/content/mrDogFacts.ts`)**:
   - Build compact, deterministic plain-text representation directly from `src/content/site.ts`.
   - Enforce strictly ≤ 2,500 characters budget.
   - Unit tests to verify all dates, venues, partners, and literal "Announcing soon" for unknowns.
2. **FAQ Engine (`src/features/mrdog/faq.ts`)**:
   - Keyword/intent matcher for `when`, `where`, `dress`, `entry`, `partners`, `artist`, `about`, `past`, `events`, `greeting`, `thanks`.
   - Generates instant in-character replies from `site.ts`.
3. **Route Handler (`app/api/mr-dog/route.ts`)**:
   - Node runtime `POST` handler with 25s timeout.
   - Input sanitization (cap 300 chars, max 6 turns, rate limit 10/10min).
   - System prompt assembly (`MR_DOG_CHARACTER_KIT.md` §6 + FACTS block + dynamic date/world context).
   - Groq / OpenRouter streaming client with fallback model cascade, `<think>` tag stripping, and output filter (URL/email/phone/price filter).
   - Mock mode (`MRDOG_MOCK=1` or when API key is missing) returning word-by-word streamed FAQ responses.

### Phase 3: Shared Chat & 2D Experience
1. **Zustand Store (`src/features/mrdog/store.ts`)**:
   - Manages dialog open/close, conversation history (`sessionStorage`), active expression state, speech queue, `chatCovering`.
2. **Convert & Organize 2D Assets**:
   - Script `scripts/convert-mr-dog-stills.mjs` converting PNG stills in `Mr. Dog/` to optimized `.webp` in `public/media/mr-dog/{outfit}/`.
3. **Shared Chat UI (`MrDogChat.tsx`)**:
   - World greetings from `site.ts`, quick-reply chips, message list, typewriter reveal driven by speech queue, composer with 300-char counter and stop button.
4. **2D Stills Renderer (`MrDogStills.tsx`)**:
   - Lightweight sprite/still component with smooth crossfades, idle breathing, and eye winks for Motion OFF and low-tier devices.

### Phase 4: Mobile Tab Bar & Full-Screen Sheet
1. **Refactor `MobileTabBar.tsx`**:
   - 3-column layout: `Home | Mr. Dog | Events`.
   - Raised 60px circle button with ear breakout and conic sheen.
   - Smooth concave notch clipping.
   - Sliding indicator repositioned to 16.67% / 83.33% with fade-out on open.
2. **Mobile Sheet (`MrDogSheet.tsx`)**:
   - Circular portal reveal from button origin.
   - Anchored above tab bar.
   - VisualViewport integration for keyboard pinning.
   - Popstate integration with Android back gesture.
   - Lenis scroll locking while sheet is open.
   - Update mobile page bottom padding.

### Phase 5: Desktop Launcher, Panel & 3D Stage
1. **Model Optimization**:
   - Add `mr-dog.glb` to `scripts/optimize-models.mjs` to output `public/models/mr-dog.glb` (≤ 1.2 MB).
2. **3D Stage (`MrDogStage3D.tsx`)**:
   - On-demand 280×280 canvas with `frameloop="never"`.
   - Hook into ticker via `addTickerRenderer` in `src/motion/clock.ts`.
   - Directional lighting + rim light in world accent.
   - Spring-based peek-in and pointer tracking.
3. **Rig Controller (`rig.ts` & `expressions.ts`)**:
   - Map 26 exact nodes.
   - Drive jaw speech envelope synced to stream, eye blinks, ear twitches, tag pendulum, and rage mode.
   - Outfit swap on 360° turn during route changes.
4. **Desktop Launcher (`MrDogLauncher.tsx`) & Panel (`MrDogPanel.tsx`)**:
   - Floating pill with avatar and glow; non-modal dialog; footer collision avoidance.

### Phase 6: Mobile 3D Upgrade & Performance Tuning
1. Enable `MrDogStage3D` in mobile sheet on `tier >= T2` with Motion ON.
2. Implement `chatCovering` flag in `Experience.tsx` to pause world canvas when sheet is open.
3. Rigorous context loss and resource cleanup on panel/sheet dismissal.

### Phase 7: QA, Traps, Performance & Documentation
1. Run all 20 facts tests and 12 trap tests (pricing, tickets, line-ups, Hindi/Marathi/Hinglish).
2. Verify API key privacy (`.next/static` bundle audit).
3. Lighthouse verification (within 2 points, zero CLS).
4. Write `MR_DOG_QA.md` and `MR_DOG_WALKTHROUGH.md` with full desktop & mobile screenshots.

---

## 8. Open Questions & Confirmation Points

1. **API Provider**: Which LLM provider do you plan to use in Vercel (`Groq` or `OpenRouter`)? We will configure `app/api/mr-dog/route.ts` with OpenAI-compatible streaming supporting both seamlessly via `MRDOG_API_BASE` and `MRDOG_API_KEY`.
2. **Mock Mode During Development**: Confirm that we should build and verify Phases 2–6 using mock mode (`MRDOG_MOCK=1`) until your API key is configured.
3. **Desktop Menu Link**: Would you like an "Ask Mr. Dog" entry added to the desktop navigation/menu as an optional alternative entry point?
