"use client";
import { lazy, Suspense, useEffect } from "react";
import { useStore } from "@/state/store";
import { Badge } from "./badge/Badge";
import { Precompile } from "./Precompile";
import { preloadWorldAssets } from "./preload";
import { StudioEnvironment } from "./StudioEnvironment";
import { ForegroundHaze } from "./ForegroundHaze";
const HomeStage = lazy(() =>
  import("./home/HomeStage").then((m) => ({ default: m.HomeStage })),
);
const RedRoomSet = lazy(() =>
  import("./redroom/RedRoomSet").then((m) => ({ default: m.RedRoomSet })),
);
const DiwaliSet = lazy(() =>
  import("./diwali/DiwaliSet").then((m) => ({ default: m.DiwaliSet })),
);

/**
 * Every set stays mounted once it has been visited or warmed (residentWorlds) and
 * is only hidden when another world is current, so going back never re-uploads
 * or recompiles anything. Each set pauses its own frame work while hidden.
 */
export function WorldDirector() {
  const world = useStore((s) => s.world);
  const resident = useStore((s) => s.residentWorlds);
  useEffect(() => {
    preloadWorldAssets(world);
  }, [world]);
  return (
    <group name="WorldDirector">
      <StudioEnvironment />
      <ForegroundHaze />
      <Suspense fallback={null}>
        <Badge position={world === "diwali" ? [0, 1.9, 0] : [0, 1.5, 0]} />
      </Suspense>
      <group name="HomeStageGroup" visible={world === "home"}>
        {resident.home ? (
          <Suspense fallback={null}>
            <HomeStage />
          </Suspense>
        ) : null}
      </group>
      <group name="RedRoomSetGroup" visible={world === "redroom"}>
        {resident.redroom ? (
          <Suspense fallback={null}>
            <RedRoomSet />
          </Suspense>
        ) : null}
      </group>
      <group name="DiwaliSetGroup" visible={world === "diwali"}>
        {resident.diwali ? (
          <Suspense fallback={null}>
            <DiwaliSet />
          </Suspense>
        ) : null}
      </group>
      <Precompile />
    </group>
  );
}
