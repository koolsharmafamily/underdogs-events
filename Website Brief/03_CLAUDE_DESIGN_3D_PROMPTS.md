# Claude Design: 3D object prompts
### Underdogs "Two Worlds" · seven copy-paste prompts

## How to use these

**What Claude Design can and can't export.** Claude Design builds 3D as live code (three.js). Its Export menu offers .zip, PDF, PPTX, standalone HTML, Canva and a handoff to Claude Code, but **no 3D-model file**. So every prompt below asks Claude Design to add its own **"Download .glb"** buttons to the prototype.
- If a download button doesn't work inside Claude Design, reply: *"Downloads don't work here. Print the complete builder module as one code block."* Save that code as `<name>.js`, and Antigravity will run it to generate the same object.
- Either way, also use **Export → standalone HTML** and keep the file. It's a working reference the website agent can read.

**Steps for each prompt:**
1. Open **Claude Design** and start a **new project** (one per prompt keeps each session focused).
2. **Upload** the reference files listed at the top of the prompt. They're in the `reference/` folder next to this file. For Prompt 1 you also need the **clean logo SVG**.
3. Paste the prompt **exactly** as written. Each one ends with the same *Technical contract*; keep it in.
4. Iterate in plain words (useful phrases are at the end of this file).
5. Download the GLBs and modules with the **exact file names** given. Put them in your site project at `brand-source/3d/`.

**Order:** do Prompt 1 (the badge) first, since it's in every world. Then 2 (the doors), 5 and 6 (the dragon and the curtains, which are the hardest effects), then 3, 4 and 7.

---

## PROMPT 1: THE UNDERDOGS BADGE (three skins)
**Upload:**
- `underdogs-logo.svg` (the clean master, **required**)
- `underdogs-logo-reference-WATERMARKED.png`
- `badge-redroom-neon-reference.png`
- `badge-redroom-neon-reference-2.png`
- `badge-diwali-jewelled-reference.png`

**Exports:** `badge-enamel.glb`, `badge-neon.glb`, `badge-jewelled.glb`

```
Build the Underdogs logo as a real, physical 3D object — a thick pin-badge — in three skins, as an interactive three.js prototype with GLB export. It is the hero object of an event website and travels between three "worlds", changing skin in each.

REFERENCES I'M UPLOADING
- underdogs-logo.svg — the clean master logo. Build ALL logo geometry from these vector paths (SVGLoader → shapes → extrude). Never substitute a font: the lettering must be the logo's own letterforms.
- underdogs-logo-reference-WATERMARKED.png — shape reference only (ignore the watermark).
- badge-redroom-neon-reference.png and badge-redroom-neon-reference-2.png — the Halloween "Red Room" neon look.
- badge-diwali-jewelled-reference.png — the Diwali jewelled look.

THE LOGO
A circle: an outer ring carrying the word UNDERDOGS twice (along the top arc, and along the bottom arc reading upright), a thin inner line, and a dark face disc with two X eyes and a mouth — a horizontal bar with a U-shaped tongue hanging below it. Colours: ring magenta #D73EBC, letters white #FCF9FC, face ink #10171F.

GEOMETRY (metres, Y up, the face looks toward +Z, origin = centre of the disc)
- Diameter 1.0, total thickness 0.12, rounded outer edge (bevel radius 0.02) that catches light.
- Ring: the enamel band, recessed 0.006 below the rim edge.
- Letters_Top / Letters_Bottom: extruded 0.012 above the enamel, 0.002 bevel.
- Inner_Line: raised 0.006.
- Face: slightly domed (0.015 rise at the centre).
- Eye_L, Eye_R: the X shapes raised 0.01; pivot at each X's own centre (so they can squash for a blink).
- Tongue: the bar + U tongue as one mesh raised 0.01; pivot at the TOP CENTRE of the bar (so it can wag).
- Back: flat back face with engraved (0.002 deep) text "GATE TO RAGE · NAGPUR" running around the edge and two small X marks in the centre. For this engraving only, a clean geometric sans is acceptable.

THREE SKINS — identical geometry and node names; each skin adds its own extras
1) ENAMEL (home)
   Ring: glossy magenta enamel #D73EBC (physical, roughness 0.18, clearcoat 1, clearcoatRoughness 0.05).
   Letters, inner line, eyes, tongue: white #FCF9FC, roughness 0.3, clearcoat 0.6.
   Face: glossy black enamel #10171F, roughness 0.12, clearcoat 1.
   Body edge and back: polished nickel-chrome (metalness 1, roughness 0.12, #D9DCE3).
2) NEON ("The Red Room", Halloween)
   Body: black lacquer #0A0505 (clearcoat 1). Ring: smoked black glass #120203 (roughness 0.08).
   Neon_Tubes: glass tubes (radius 0.006) tracing the OUTLINE of every letter (from the SVG contours, inset 0.004), plus the outer ring edge (radius 0.008), the inner line, the X eyes and the tongue — base #3A0504, emissive #FF2A1F, emissiveIntensity 4.
   Drips: 7–9 glossy blood drips (#6B0A08, roughness 0.1, clearcoat 1) hanging from the bottom-arc letters and the outer edge, 0.03–0.09 long with teardrop ends.
   Face: black glass #050102 (roughness 0.05, clearcoat 1).
3) JEWELLED (Diwali)
   Zari_Rim: an ornate gold rim (#D4AF6A, metalness 1, roughness 0.28) — a twisted-rope border with ~160 tiny gold beads (instanced) plus a scalloped filigree band.
   Paisley_L, Paisley_R: gold filigree paisley/floral medallions at 9 and 3 o'clock, overlapping the ring, each set with small pink and emerald stones.
   Ring: rani-pink enamel #C5287B (roughness 0.2, clearcoat 1). Letters: ivory #FFF6EE (roughness 0.35).
   Gems_Emerald: an inner bead ring of 24 emerald cabochons (#157A4F, roughness 0.05) alternating with gold beads (instanced).
   Gems_Pink: four pink oval jewels (#E0218A) at 12, 3, 6 and 9 o'clock.
   Face: black velvet #15181C (roughness 0.95, sheen 1, sheenColor #3A2430).
   Pave_Eye_L, Pave_Eye_R, Pave_Tongue: the X eyes and the tongue filled with tiny diamonds (simplified brilliant cut, ≤ 16 facets each, instanced; physical white, roughness 0.02, ior 2.4) inside thin gold outlines.

PREVIEW PAGE
- Dark studio (#07090D): soft magenta rim light from behind, a white key from top-left, and two tall reflection softboxes (one magenta, one white) so the enamel and chrome look expensive. Glossy black floor with a soft reflection.
- Skin switch: Enamel / Neon / Jewelled. Neon uses a dark red backdrop and candle-warm light; Jewelled uses a deep rani-pink velvet backdrop and warm gold light.
- Buttons: Blink (both eyes squash to 8% height in 80 ms, back in 140 ms) · Wink (left eye only) · Wag (tongue swings ±12° around its pivot with a springy settle) · Turntable on/off · Show back.
- The badge tilts up to 14° toward the mouse with a soft spring, and floats very gently (noise, not a sine wave).
- "Re-skin preview": dissolve one skin into another using object-space noise with a glowing edge (red embers → Neon, gold sparks → Jewelled, magenta → Enamel). Preview only — not exported.
- Bloom on the neon and the diamonds only (preview).

EXPORT
- Three buttons: "Download badge-enamel.glb", "Download badge-neon.glb", "Download badge-jewelled.glb".
- Every file contains the shared nodes — Badge, Body, Ring, Letters_Top, Letters_Bottom, Inner_Line, Face, Eye_L, Eye_R, Tongue, Back — with that skin's materials, plus that skin's extras (Neon: Neon_Tubes, Drips · Jewelled: Zari_Rim, Paisley_L, Paisley_R, Gems_Emerald, Gems_Pink, Pave_Eye_L, Pave_Eye_R, Pave_Tongue). Same transforms in all three files.
- Budgets: Enamel ≤ 40k triangles · Neon ≤ 55k · Jewelled ≤ 90k.
- A "Handoff" panel listing the node tree, every pivot, triangle counts per node and every material's parameters.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural (SVGLoader shapes + ExtrudeGeometry, LatheGeometry, TubeGeometry, instancing). No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- Materials: MeshStandardMaterial or MeshPhysicalMaterial only, so they survive glTF export. Custom-shader effects (glow, flicker, dissolve, smoke, fog) are preview-only and must be described in the Handoff panel, not baked.
- Node names exactly as listed — the website animates them by name. Put each pivot where specified (use an empty parent Group if needed).
- Clean topology, outward normals, no z-fighting, scale applied (no scaled parents).
- Export with GLTFExporter (binary: true, onlyVisible: true). InstancedMesh is fine (EXT_mesh_gpu_instancing); if unsupported, merge instances before export.
- If file downloads don't work in this environment, say so and print the complete builder module as ONE code block: an ES module exporting build(THREE, options) that returns the Group with these exact node names.
```

---

## PROMPT 2: THE TWO DOORS
**Upload:**
- `redroom-poster-full.png`
- `redroom-mirror-candles-reference.png`
- `diwali-poster-full.png`
- `badge-redroom-neon-reference.png`

**Exports:** `door-redroom.glb`, `door-diwali.glb`

```
Build two monumental doors as 3D objects for an event website — the gateways to two "worlds". Visitors hover a door and it opens slightly with light spilling out; clicking flies the camera through it. Interactive three.js prototype with GLB export.

REFERENCES I'M UPLOADING
- redroom-poster-full.png, redroom-mirror-candles-reference.png — the Red Room world: gothic boudoir, red velvet, candles, tarnished gilt.
- diwali-poster-full.png — the Diwali world: palace courtyard at night, ivory arches, pink and gold, garlands.
- badge-redroom-neon-reference.png — the Underdogs face (two X eyes and a tongue) for the door knocker.

DOOR A — "THE RED ROOM" (Halloween) → door-redroom.glb
Size (metres): opening 1.3 wide × 2.8 tall with a round-arched top; overall frame 1.8 × 3.2, depth 0.3. Origin on the floor at the centre of the threshold; faces +Z.
- Frame: black lacquered wood (#0A0505, clearcoat 1) with tarnished gilt mouldings (#C8A15A, metal, roughness 0.35, darker in recesses) and a simplified baroque scroll at the arch's crown.
- Leaf: one door covered in diamond-tufted blood-red velvet (tuft grid about 6 × 10, a brass button in every tuft), with brass edge trim. Velvet = MeshPhysicalMaterial #7C0F0C, roughness 0.8, sheen 1, sheenColor #FF5A4A, sheenRoughness 0.45, plus a generated crushed-velvet normal map.
- Knocker: a brass ring (#B8893F, metal, roughness 0.3) held by a small round medallion of the Underdogs face — two X eyes and the tongue, no letters.
- Sconces: one each side of the frame at 1.9 height, each holding a red wax candle; empties Flame_Anchor_L / Flame_Anchor_R at the wick tips (flames are added in code).
- Light_Leak: thin emissive red planes (#FF2A1F) under the door and inside the door gap.
- Hinge: pivot on the LEFT edge of the leaf; the door opens AWAY from the viewer (toward −Z), up to 75°.
Nodes: DoorRR_Root, Frame, Leaf (pivot at the hinge), Knocker, Sconce_L, Sconce_R, Flame_Anchor_L, Flame_Anchor_R, Light_Leak.

DOOR B — "DIWALI" → door-diwali.glb
Size: opening 1.6 wide × 2.9 tall under a cusped (multifoil) Mughal arch; overall frame 2.3 × 3.5, depth 0.4. Origin on the floor at the centre of the threshold; faces +Z.
- Frame: carved ivory stone (#F4EADB, roughness 0.6) with thin gold-leaf inlay lines tracing the arch, and a small jharokha-style canopy above it.
- Two leaves (a double door) with recessed carved panels — inset rectangles with lotus rosettes in relief — rows of brass studs, and inlaid rani-pink glass diamonds (#C5287B, slightly emissive so they glow when lit from behind). Brass ring handles on both leaves.
- Toran: a garland across the top — alternating marigold heads (#F3A21A) and pink roses with mango leaves, hanging in a soft curve, with three short strands dropping down.
- Bells: two brass bells hanging at the arch's sides (Bell_L, Bell_R; pivot at the top so they can swing).
- Two clay diyas at the threshold (Diya_L, Diya_R) with Flame_Anchor_L / Flame_Anchor_R empties at the wicks.
- Light_Leak: warm gold emissive planes (#FFC46B) in the gap between the leaves and under the doors.
- Hinges: Leaf_L pivots on its left edge, Leaf_R on its right edge; both open AWAY from the viewer, up to 70°.
Nodes: DoorDW_Root, Frame, Arch, Leaf_L, Leaf_R, Glass_Inlays, Toran, Bell_L, Bell_R, Diya_L, Diya_R, Flame_Anchor_L, Flame_Anchor_R, Light_Leak.

PREVIEW PAGE
- Both doors side by side on a glossy black floor in light haze, 2.4 apart; camera at eye level (1.6), vertical FOV 34°.
- Hover a door → it opens 10° with a springy settle (one small overshoot) and its light leak brightens ×2.5; click → it opens fully. The Diwali bells swing when its doors move.
- Flames as simple flickering billboards (preview only). Toggle "World light": red glow behind door A, warm gold behind door B.
- Budgets: ≤ 60k triangles per door. Two download buttons: door-redroom.glb and door-diwali.glb. A Handoff panel with node trees, pivots, triangle counts and materials.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural (Shape/ExtrudeGeometry, LatheGeometry, TubeGeometry, instancing). No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- Materials: MeshStandardMaterial or MeshPhysicalMaterial only, so they survive glTF export. Custom-shader effects are preview-only and must be described in the Handoff panel, not baked.
- Node names exactly as listed — the website animates them by name. Put each pivot where specified (use an empty parent Group if needed).
- Clean topology, outward normals, no z-fighting, scale applied (no scaled parents).
- Export with GLTFExporter (binary: true, onlyVisible: true). InstancedMesh is fine (EXT_mesh_gpu_instancing); if unsupported, merge instances before export.
- If file downloads don't work in this environment, say so and print the complete builder module as ONE code block: an ES module exporting build(THREE, options) that returns the Group with these exact node names.
```

---

## PROMPT 3: THE RED ROOM INVITATION (envelope, wax seal, tray, card)
**Upload:**
- `redroom-envelope-wax-seal-reference.png`
- `badge-redroom-neon-reference.png`

**Export:** `redroom-invitation.glb`

```
Build a secret-invitation still life as an animatable 3D set: a red velvet envelope sealed with black wax, resting on an ornate silver tray with a string of pearls. On a Halloween event website, scrolling breaks the seal, opens the flap and slides the invitation card out toward the viewer. Interactive three.js prototype + GLB export.

REFERENCES I'M UPLOADING
- redroom-envelope-wax-seal-reference.png — the exact mood: red velvet envelope, black wax seal with the Underdogs face, silver tray, pearls.
- badge-redroom-neon-reference.png — the face for the seal: two X eyes and a tongue (no letters on the seal).

PARTS (metres; origin at the centre of the tray's base; Y up; the set is mostly seen from above-front, about 25° down)
- Tray: an oval silver tray 0.62 × 0.42, rim height 0.025, with a raised repoussé scroll border. Tarnished silver: metalness 1, roughness 0.25, darker in the crevices.
- Pearls: a string of about 70 pearls (Ø 0.008) draped across the tray in a loose S-curve, spilling over the rim on one side (instanced; pearl material: white #F3EDE4, roughness 0.2, clearcoat 1, slight sheen).
- Envelope_Body: 0.26 × 0.18 × 0.006, red velvet (MeshPhysicalMaterial #7C0F0C, roughness 0.85, sheen 1, sheenColor #FF5A4A, generated velvet normal map), lying on the tray and rotated about 12°.
- Envelope_Flap: the triangular top flap as a SEPARATE mesh with its pivot along the hinge (the top edge of the body), so it can rotate open up to 170°.
- Seal: a wax seal Ø 0.045, thickness 0.006, with an irregular blobby edge — glossy #1A0405 with deep red highlights — on the tip of the flap, embossed with the Underdogs face. Pre-fracture it into Seal_Shard_1, Seal_Shard_2 and Seal_Shard_3 along jagged crack lines through the face; at rest the shards sit perfectly assembled.
- Card: the invitation inside, 0.24 × 0.165 × 0.002, aged ivory paper (#EFD9CD, roughness 0.9) with a thin oxblood border printed 0.01 in from the edge and small corner ornaments. The CENTRE of the front face must be blank — the website overlays its own text there. UVs 0–1 across the front face. At rest it sits inside the envelope.
- Glass (optional): a crystal coupe with dark red liquid at one corner of the tray.

PREVIEW
- A low warm candle light from the left (#FF9A4A), a red fill from the right, deep shadows, a black-red background, one soft shadow.
- A timeline slider 0→1 that performs the website's exact sequence:
  0–0.25 slow push in · 0.25–0.40 the seal cracks (shards part 2–4 cm with small rotations, a few wax crumbs) · 0.40–0.55 the flap opens to 170° with a soft settle · 0.55–0.80 the card slides out, rises and turns to face the camera · 0.80–1 hold.
  It must play backwards correctly when the slider is dragged back.
- Budget ≤ 45k triangles. Download button: redroom-invitation.glb (assembled rest pose).
- Handoff panel: node tree, pivots, and the timeline's exact transforms per part at each keyframe (so the website can reproduce the sequence), plus all materials.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural (Shape/ExtrudeGeometry, LatheGeometry, TubeGeometry, instancing). No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- Materials: MeshStandardMaterial or MeshPhysicalMaterial only, so they survive glTF export. Custom-shader effects are preview-only and must be described in the Handoff panel, not baked.
- Node names exactly as listed — the website animates them by name. Put each pivot where specified (use an empty parent Group if needed).
- Clean topology, outward normals, no z-fighting, scale applied (no scaled parents).
- Export with GLTFExporter (binary: true, onlyVisible: true). InstancedMesh is fine (EXT_mesh_gpu_instancing); if unsupported, merge instances before export.
- If file downloads don't work in this environment, say so and print the complete builder module as ONE code block: an ES module exporting build(THREE, options) that returns the Group with these exact node names.
```

---

## PROMPT 4: RED ROOM PROPS (candelabra, gilded mirror, chandelier, candle)
**Upload:**
- `redroom-mirror-candles-reference.png`
- `redroom-poster-full.png`

**Exports:** `redroom-candelabra.glb`, `redroom-mirror.glb`, `redroom-chandelier.glb`, `redroom-candle.glb`

```
Build four props for a candlelit gothic room — "The Red Room", a Halloween event world: a candelabra, a gilded mirror, a crystal chandelier with red candles, and a single candle. Interactive three.js prototype + one GLB per prop. Flames are NOT modelled — the website adds them in code at the anchor points.

REFERENCES I'M UPLOADING: redroom-mirror-candles-reference.png and redroom-poster-full.png — a baroque gilt mirror, red candles with wax drips, a crystal chandelier, red velvet everywhere.

1) CANDELABRA → redroom-candelabra.glb (≤ 25k triangles)
   A baroque 5-arm candelabra, 0.85 tall (about 1.1 to the candle tips), base Ø 0.22. Aged dark bronze (#3A2A1C, metalness 1, roughness 0.45) with gilt highlights on the scrolls.
   Five red wax candles (#8E0F0E, roughness 0.55) of different heights (0.18–0.26) with wax drips running down, and black wicks.
   Nodes: Candelabra (origin at the base centre), Candle_1…Candle_5, Flame_Anchor_1…Flame_Anchor_5 (empties exactly at the wick tips).
2) GILDED MIRROR → redroom-mirror.glb (≤ 40k triangles)
   An arched baroque frame, outer 1.3 wide × 2.2 tall, depth 0.08, with an ornate crest at the top and acanthus scrolls along the sides. Tarnished gold (#C8A15A, metalness 1, roughness 0.35, darker in recesses).
   Mirror_Glass: a SEPARATE flat mesh filling the opening, UVs 0–1 across it (the website applies its own fog/condensation shader). Placeholder material: dark reflective (metalness 1, roughness 0.08).
   Nodes: Mirror (origin at the bottom centre), Frame, Crest, Mirror_Glass.
3) CHANDELIER → redroom-chandelier.glb (≤ 50k triangles)
   A two-tier gilt frame Ø 1.1, height 1.2; 8 arms, each with a red candle with drips; about 120 crystal drops (instanced; physical, roughness 0.02, ior 1.5) and bead swags; a chain rising 1.0.
   Nodes: Chandelier (origin at the TOP of the chain — the pivot it swings from), Chain, Frame, Crystals, Candle_1…Candle_8, Flame_Anchor_1…Flame_Anchor_8.
4) SINGLE CANDLE → redroom-candle.glb (≤ 3k triangles)
   Three variants in one file — Candle_A (tall), Candle_B (medium), Candle_C (short) — each with different drips and its own Flame_Anchor_A/B/C.

PREVIEW: a dark red room corner with fog; flames as flickering billboards and one flickering warm point light (preview only); orbit controls; buttons to isolate each prop; a "Sway" toggle that swings the chandelier ±1.5° at 0.12 Hz from its pivot. Download buttons for all four files. A Handoff panel with node trees, pivots, triangle counts and materials.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural (Shape/ExtrudeGeometry, LatheGeometry, TubeGeometry, instancing). No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- Materials: MeshStandardMaterial or MeshPhysicalMaterial only, so they survive glTF export. Custom-shader effects are preview-only and must be described in the Handoff panel, not baked.
- Node names exactly as listed — the website animates them by name. Put each pivot where specified (use an empty parent Group if needed).
- Clean topology, outward normals, no z-fighting, scale applied (no scaled parents).
- Export with GLTFExporter (binary: true, onlyVisible: true). InstancedMesh is fine (EXT_mesh_gpu_instancing); if unsupported, merge instances before export.
- If file downloads don't work in this environment, say so and print the complete builder module as ONE code block: an ES module exporting build(THREE, options) that returns the Group with these exact node names.
```

---

## PROMPT 5: THE SMOKE DRAGON (effect, code module and head model)
**Upload:**
- `badge-redroom-neon-reference.png`
- `redroom-poster-full.png`

**Exports:** `smokeDragon.js`, `dragon-head.glb`

```
Build a dragon made of red smoke and embers that coils around a glowing neon badge — the signature effect of a Halloween event world called "The Red Room". This is mainly a real-time effect, so I need three things: (1) an interactive three.js prototype with a choreography timeline, (2) a reusable code module, and (3) a small GLB of the dragon's head.

REFERENCES I'M UPLOADING: badge-redroom-neon-reference.png (the neon badge it coils around) and redroom-poster-full.png (the mood: blood red, black, candlelight, velvet).

THE LOOK
An Eastern, serpentine dragon (long body, no wings), suggested by smoke rather than solid scales: dense crimson-to-black smoke forms the body, with ember sparks glowing inside it and peeling off its edges. The head is the only solid part: a low-poly sculpted shell rendered as dark smoked glass with a red fresnel rim and two ember eyes, with smoke pouring off its edges. Elegant and menacing — never cartoonish. A particle's colour over its life: ember #FF7A2E → blood #B3120E → smoke #2A0404 → fade out.

THE SCENE (metres)
A 1.0-diameter glowing red disc at (0, 2, 0), emissive #FF2A1F, stands in for the neon badge. Black-red background, light fog, one warm candle light from the left.

CHOREOGRAPHY (a timeline slider plus a Play button)
0.0–2.2 s  ENTER — a thin smoke trail appears from the left; the head leads the body along a spline that coils 1.5 turns around the badge (radius 0.9–1.3). The body thickens behind the head (max radius 0.22) and tapers to the tail.
2.2–3.0 s  ROAR — the head rises above the badge and turns to the camera; the jaw opens 18°; the eyes flare ×3; a burst of about 300 ember sparks; one short bloom pulse.
3.0 s +    IDLE — the coil breathes (radius ±4% at 0.15 Hz); smoke curls off the body (curl noise); embers drift upward.
UNRAVEL    a separate 0→1 slider: the body releases into loose haze from tail to head, and the head dissolves into embers last. Fully reversible — dragging back re-forms the dragon.
POINTER    moving the mouse near the body swirls the smoke away (curl offset), but never moves the head more than 0.2.

QUALITY PRESETS, switchable live with an FPS readout: High (60k particles) · Mid (25k) · Low (8k). It must hold 60 fps at Mid on a laptop and still look good at Low on a phone.

TECHNIQUE (guidance)
- Body: GPU particles (Points or instanced billboards) sampled along a CatmullRom spline with a thickness profile; the particle parameter u is biased by the taper; particles respawn along the spline; curl-noise advection in the vertex shader.
- Smoke: a procedurally generated soft-noise sprite atlas (made in code), normal blending, depthWrite off.
- Embers: additive, tiny, HDR-bright so they bloom.
- Head: follows the spline's leading point; extra smoke emits from its vertices.
- three.js only — no other libraries — and no allocations per frame.

DELIVERABLES
1) The prototype page described above.
2) A reusable ES module, printed in full AND downloadable as smokeDragon.js:
   createSmokeDragon({ THREE, scene, quality: 'high'|'mid'|'low', colors, headGLTF, badgeCenter, badgeRadius })
     → { group, setEntry(t01), setUnravel(t01), update(dt, elapsed, pointerWorldOrNull), dispose() }
   No globals, no DOM access, documented parameters, readable GLSL (≤ 150 lines in total).
3) dragon-head.glb (≤ 6k triangles): a stylised Eastern dragon head — long snout, brow ridges, swept-back horns, flowing whiskers as thin tubes, a separate lower jaw.
   Nodes: Head (origin at the neck joint, looking toward +Z), Jaw (pivot at the jaw hinge), Horn_L, Horn_R, Whiskers, Eye_L and Eye_R (empties at the eye centres).
   Material: MeshPhysicalMaterial dark smoked glass (#120203, roughness 0.15, clearcoat 1).
A Handoff panel listing the module's API, the timeline values, and which parts are preview-only.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural. No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- Materials in the GLB: MeshStandardMaterial or MeshPhysicalMaterial only. The smoke and ember shaders live in the module, not in the GLB.
- Node names exactly as listed — the website animates them by name. Put each pivot where specified (use an empty parent Group if needed).
- Clean topology, outward normals, scale applied (no scaled parents).
- Export the head with GLTFExporter (binary: true, onlyVisible: true).
- If file downloads don't work in this environment, say so and print both the module and a buildDragonHead(THREE) function as code blocks.
```

---

## PROMPT 6: VELVET CURTAINS (two skins)
**Upload:**
- `redroom-poster-full.png`
- `diwali-poster-full.png`

**Exports:** `velvetCurtain.js` (and optionally `curtain-open.glb`)

```
Build a pair of luxurious velvet theatre curtains as a real-time three.js effect, in two skins — one for a gothic Halloween world ("The Red Room") and one for a glamorous Diwali world. They open and close as page transitions, so the MOTION matters as much as the look. Deliver an interactive prototype and a reusable code module.

REFERENCES I'M UPLOADING: redroom-poster-full.png (red velvet drapes, gold fringe, candlelight) and diwali-poster-full.png (rani-pink velvet with gold zari borders, warm light).

THE CURTAIN (metres): two panels, Left and Right, each 3.2 wide × 4.5 tall when closed, meeting at the centre, plus a top valance 6.6 wide × 0.6 tall with swags. Origin at the floor centre; faces +Z.
- Pleats: vertical folds via vertex displacement (10–14 folds per panel, depth 0.06–0.12) with natural irregularity (noise), a heavier weighted hem, and a very subtle sway (wind noise).
- Opening — setPart(t), t 0→1: the panels draw apart to the sides; the folds BUNCH (frequency and depth increase) as each panel compresses toward its edge; the leading edge lags slightly, like heavy cloth, and settles with one soft overshoot.
- Lifting (Diwali only) — setLift(t), t 0→1: the BACK drapes rise upward, folds gathering at the top like an Austrian curtain.
- Velvet look: MeshPhysicalMaterial with sheen 1, sheenRoughness 0.35–0.5, roughness 0.8 and a procedurally generated crushed-velvet normal map. The light must catch the fold crests with that characteristic velvet glow.

SKINS
- "redroom": velvet #7C0F0C (shadow #2A0403), sheenColor #FF5A4A; tarnished gold bullion fringe along the hems and leading edges (instanced tassels or a fringe strip); tie-back tassels.
- "diwali": rani-pink velvet #C5287B (shadow #7E1347), sheenColor #FFB6D9; a wide ivory-and-gold zari border (0.18) along the leading edges and hem with small mirror-work sequins (instanced metallic discs that glint); pink silk tassels.

PREVIEW: a stage with a warm key light from above-left and a soft fill; a skin switch; sliders for part and lift; buttons "Open" (1.4 s, ease-in-out) and "Close" (0.6 s) so I can judge transition timing; a quality switch (High: 160 × 80 segments per panel, Low: 80 × 40) with an FPS readout.

DELIVERABLES
1) The prototype page.
2) velvetCurtain.js — an ES module, printed in full AND downloadable:
   createVelvetCurtain({ THREE, width, height, skin: 'redroom'|'diwali', quality: 'high'|'low' })
     → { group, setPart(t01), setLift(t01), update(dt, elapsed), dispose() }
   No globals, no allocations per frame, readable GLSL.
3) Optional: curtain-open.glb — a static export of the open pose, as a fallback.
A Handoff panel listing the API, every parameter and its default.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z; origins as specified.
- Everything procedural. No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 1024²).
- MeshPhysicalMaterial for the velvet (sheen); the fold motion lives in the module's shader code.
- No allocations per frame; dispose() frees every geometry, material and texture.
- If file downloads don't work in this environment, say so and print the complete module as ONE code block.
```

---

## PROMPT 7: DIWALI PROPS (diyas, marigold, rose petal, gold-foil card, lantern)
**Upload:**
- `badge-diwali-jewelled-reference.png`
- `diwali-poster-full.png`

**Exports:**
- `diwali-diya-terracotta.glb`
- `diwali-diya-brass.glb`
- `diwali-marigold.glb`
- `diwali-rose-petal.glb`
- `diwali-card.glb`
- `diwali-kandil.glb` (optional)

```
Build the small objects that fill a glamorous Diwali event world — think a Karan Johar film's Diwali: pink, white and gold, desi with a modern touch. Two diyas, a marigold, a rose petal, a gold-foil invitation card and an optional paper lantern. They will be instanced dozens to hundreds of times on a website, so keep them light. Interactive three.js prototype + one GLB per object. Flames are NOT modelled — the website adds them in code.

REFERENCES I'M UPLOADING: badge-diwali-jewelled-reference.png (the palette and ornament: rani pink, gold zari, emerald, ivory) and diwali-poster-full.png (warm candlelight, palace courtyard, pink fireworks).

1) DIYA, TERRACOTTA → diwali-diya-terracotta.glb (≤ 2k triangles)
   A classic clay oil lamp: almond-shaped bowl Ø 0.11, height 0.05, pinched spout. A hand-painted look generated in code: rani-pink (#C5287B) and gold (#C6A76A) bands with white dot-work on terracotta (#B5562B, roughness 0.85). A dark glossy oil surface inside and a cotton wick in the spout.
   Nodes: Diya (origin at the base centre), Oil, Wick, Flame_Anchor (an empty at the wick tip).
2) DIYA, BRASS → diwali-diya-brass.glb (≤ 2k triangles)
   The same silhouette in polished brass (#C9A24E, metalness 1, roughness 0.25) with an engraved petal pattern (normal map generated in code). Same nodes.
3) MARIGOLD (genda) → diwali-marigold.glb (≤ 2.5k triangles)
   A Ø 0.06 pom-pom of ruffled petals in about 4 rings. Two variants in one file: Marigold_Orange (#F3A21A) and Marigold_Yellow (#F7C21B).
4) ROSE PETAL → diwali-rose-petal.glb (≤ 120 triangles)
   One gently cupped, curled petal 0.035 long, double-sided, in three variants: Petal_Rani (#C5287B), Petal_Blush (#F7CFE0), Petal_Ivory (#FFF6EE). It will be instanced about 400 times and tumble as it falls.
5) GOLD-FOIL INVITATION CARD → diwali-card.glb (≤ 3k triangles)
   0.24 × 0.165 × 0.003: an ivory card (#FFF6EE, roughness 0.85) with a rani-pink inner panel inset 0.012, a raised (0.0006) gold-foil border with paisley corners, and a small four-point star ornament at the top and bottom centres (gold: metalness 1, roughness 0.25). The CENTRE must stay blank — the website overlays its own text. UVs 0–1 across the front.
   Nodes: Card, Panel, Foil.
6) OPTIONAL PAPER LANTERN (kandil) → diwali-kandil.glb (≤ 4k triangles)
   A six-pointed star lantern in rani-pink and gold paper with cut-out patterns and short tassels; a Light_Anchor empty inside it.

PREVIEW: a rani-pink velvet backdrop, warm gold key light, pink fill, a soft ivory marble floor; 20 diyas floating and bobbing with flickering billboard flames (preview only), 150 petals falling with tumble and flutter, the card turning slowly, gold dust in the air. Buttons to isolate each object, with triangle counts on screen. One download button per GLB. A Handoff panel with nodes, pivots and materials.

TECHNICAL CONTRACT — keep exactly
- three.js (latest stable, ES modules) in one self-contained prototype page. Units metres, Y up, front faces +Z unless stated; origins and pivots exactly as specified.
- All geometry is procedural (LatheGeometry, Shape/ExtrudeGeometry, instancing). No downloaded models, HDRIs or image textures — any texture is generated in code (CanvasTexture/DataTexture, ≤ 512² for these small props).
- Materials: MeshStandardMaterial or MeshPhysicalMaterial only, so they survive glTF export. Flames and other shader effects are preview-only and must be described in the Handoff panel, not baked.
- Node names exactly as listed — the website uses them by name.
- Clean topology, outward normals, no z-fighting, scale applied (no scaled parents).
- Export with GLTFExporter (binary: true, onlyVisible: true).
- If file downloads don't work in this environment, say so and print the complete builder module as ONE code block: an ES module exporting build(THREE, options) that returns a Group per object with these exact node names.
```

---

## Useful follow-up phrases in Claude Design

**When something looks wrong:**
- "The lettering doesn't match the logo. Rebuild Letters_Top and Letters_Bottom directly from the SVG paths; don't use a font."
- "Make it look more expensive: stronger reflection strips, slightly lower roughness on the enamel, and a crisper bevel highlight."
- "The neon looks flat. Make the tubes rounder and add a hotter core with a softer outer glow (preview bloom only)."
- "The smoke looks like fog. Give it more structure: tighter curl noise near the body, thinner wisps at the edges, more contrast between ember and smoke."
- "The curtain folds look like a sine wave. Add irregular pleat spacing, heavier weight at the hem and a slower settle."

**Checking and exporting:**
- "Show triangle counts per node and confirm every node name and pivot matches the brief."
- "Downloads don't work here. Print the complete builder module as one code block."

## After exporting

Put every file in `brand-source/3d/` inside the website project, with the names above. Then tell Antigravity: *"New 3D assets are in brand-source/3d/. Run scripts/optimize-models.mjs and replace the placeholders."*
