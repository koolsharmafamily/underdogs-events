"use client";

import React from "react";
import { BallroomAtmosphere } from "./BallroomAtmosphere";
import { Chandeliers } from "./Chandeliers";
import { StudioSpotlights } from "./StudioSpotlights";
import { DhamaakaParticlesCanvas } from "./DhamaakaParticlesCanvas";

interface DhamaakaStageProps {
  d2Progress?: number;
  activeStoryLine?: number;
}

export function DhamaakaStage({
  d2Progress = 0,
  activeStoryLine = 0,
}: DhamaakaStageProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Layer 1: Ballroom Atmosphere Plate */}
      <BallroomAtmosphere parallaxY={-d2Progress * 25} />

      {/* Layer 2: Crystal Chandeliers */}
      <Chandeliers />

      {/* Layer 3: Studio Spotlights with sweeping beams */}
      <StudioSpotlights />

      {/* Layer 4: Particle Canvas (Bokeh, gold dust, flashes, fireworks) */}
      <DhamaakaParticlesCanvas
        d2Progress={d2Progress}
        activeStoryLine={activeStoryLine}
      />

      {/* Layer 5: Foreground Rose Petals & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,6,6,0.55)_75%,#0A0606_96%)]" />
    </div>
  );
}
