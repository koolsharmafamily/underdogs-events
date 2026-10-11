'use client';

import React, { Suspense, lazy } from 'react';
import { useStore } from '@/state/store';
import { Badge } from './badge/Badge';

const HomeStage = lazy(() =>
  import('./home/HomeStage').then((m) => ({ default: m.HomeStage }))
);
const RedRoomSet = lazy(() =>
  import('./redroom/RedRoomSet').then((m) => ({ default: m.RedRoomSet }))
);
const DiwaliSet = lazy(() =>
  import('./diwali/DiwaliSet').then((m) => ({ default: m.DiwaliSet }))
);

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

      {/* World sets rendered in Suspense, lazy-loaded per Part 12.4 & 13.3 */}
      <Suspense fallback={null}>
        {world === 'home' && <HomeStage />}
        {world === 'redroom' && <RedRoomSet />}
        {world === 'diwali' && <DiwaliSet />}
      </Suspense>
    </group>
  );
}
