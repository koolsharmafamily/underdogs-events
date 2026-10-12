'use client';

import React from 'react';
import { useStore } from '@/state/store';
import { Badge } from './badge/Badge';
import { HomeStage } from './home/HomeStage';
import { RedRoomSet } from './redroom/RedRoomSet';
import { DiwaliSet } from './diwali/DiwaliSet';
import { Precompile } from './Precompile';

/**
 * WorldDirector manages world sets and fog.
 * Pre-mounts all worlds and skins so renderer.compileAsync warms up all shaders
 * during the loader (Part B Item 1), keeping renderer.info.programs.length constant.
 * Keeps all world groups mounted permanently so geometry/textures are never disposed mid-transition.
 */
export function WorldDirector() {
  const world = useStore((s) => s.world);

  return (
    <group name="WorldDirector">
      {/* Fog per Part 5.4 */}
      {world === 'redroom' ? (
        <fogExp2 attach="fog" args={['#1A0202', 0.08]} />
      ) : world === 'diwali' ? (
        <fogExp2 attach="fog" args={['#2A0A1C', 0.045]} />
      ) : (
        <fogExp2 attach="fog" args={['#0B0E14', 0.06]} />
      )}

      {/* Protagonist Badge: persistent across worlds per Part 13.3 */}
      <Badge position={world === 'diwali' ? [0, 1.9, 0] : [0, 1.5, 0]} />

      {/* All world sets pre-mounted and precompiled at load; visibility toggled exclusively so lights never mix */}
      <group name="HomeStageGroup" visible={world === 'home'}>
        <HomeStage />
      </group>
      <group name="RedRoomSetGroup" visible={world === 'redroom'}>
        <RedRoomSet />
      </group>
      <group name="DiwaliSetGroup" visible={world === 'diwali'}>
        <DiwaliSet />
      </group>

      {/* Precompile runs after all suspended GLB children in WorldDirector have mounted */}
      <Precompile />
    </group>
  );
}
