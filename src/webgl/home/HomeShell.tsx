"use client";
import { Beams } from "./Beams";
import { StageFloor } from "../StageFloor";
import { SpareLights } from "../LightRig";
/** The existing hero rig, without the below-fold doors or their textures. */
export function HomeShell() { return <group name="HomeHeroShell">
  <Beams /><ambientLight intensity={0.35} color="#0B0E14" />
  <directionalLight position={[-4,5.5,4]} intensity={2.4} color="#FFFFFF" />
  <directionalLight position={[3.5,2.5,3.5]} intensity={0.35} color="#C5CCEF" />
  <SpareLights directional={1} />
  <pointLight position={[0,2.4,-1.8]} intensity={2.8} color="#D9DCE3" distance={6} />
  <pointLight position={[-1.65,.5,.45]} intensity={0} color="#FF2A1F" distance={5.5} />
  <pointLight position={[1.65,.5,.45]} intensity={0} color="#FFC46B" distance={5.5} />
  <StageFloor world="home" />
</group>; }
