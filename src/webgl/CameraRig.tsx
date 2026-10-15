"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { composition } from "./composition";

// Authored level-camera shots. Distances move forward monotonically; smoothstep
// joins stop at both ends and remain C1 continuous when scrolling backwards.
// [x, y, z, picture shift (fraction of the viewport height, default 0.015)]
const SHOTS: Record<string, number[][]> = {
  home: [
    [0, 1.75, 7],
    [0, 1.8, 6.85],
    // Doors: pulled back and raised so both doors end above their captions.
    [0, 1.6, 8.6, 0.125],
  ],
  redroom: [
    [0, 1.85, 7.8],
    [0, 1.8, 7.6],
    [-0.18, 1.75, 7.4],
    [0, 1.55, 7.2],
    [0, 1.8, 7],
    [0, 1.8, 6.8],
  ],
  diwali: [
    [0, 1.9, 7.2],
    [0, 2.05, 7.05],
    [0, 1.7, 6.9],
    [0, 1.75, 6.75],
    [0, 1.85, 6.6],
  ],
};
export function CameraRig() {
  const { camera, size } = useThree();
  const world = useStore((s) => s.world);
  const motionEnabled = useStore((s) => s.motionEnabled);
  // shot: index into SHOTS. Numbered scenes take the next shot; extra sections
  // (the DJ sections, R-DJ / D-DJ) keep the shot of the scene before them, so
  // they never shift which shot (and which composition.scene) a scene gets.
  const sections = useRef<{ id: string; top: number; height: number; shot: number }[]>([]);
  const position = useRef(new THREE.Vector3(0, 1.75, 7));
  const target = useRef(new THREE.Vector3());
  useEffect(() => {
    const prefix = world === "home" ? "H" : world === "redroom" ? "R" : "D";
    const measure = () => {
      sections.current = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-scene^="${prefix}"]`),
      )
        .filter((el) => el.dataset.scene !== "H6" && el.offsetHeight > 0)
        .map((el) => ({
          id: el.dataset.scene!,
          top: el.getBoundingClientRect().top + window.scrollY,
          height: el.offsetHeight,
          shot: 0,
        }));
      let shot = -1;
      for (const section of sections.current) {
        if (/\d$/.test(section.id) || shot < 0) shot++;
        section.shot = shot;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main);
    window.addEventListener("resize", measure);
    const raf = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [world]);
  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const shots = SHOTS[world];
    const scroll = frame.scroll;
    let index = 0;
    for (let i = 1; i < sections.current.length; i++) {
      if (scroll >= sections.current[i].top - size.height * 0.25) index = i;
    }
    const section = sections.current[index];
    const shotOf = (i: number) =>
      Math.min(sections.current[i]?.shot ?? 0, shots.length - 1);
    const blend =
      index === 0 || !section
        ? 1
        : THREE.MathUtils.smoothstep(
            scroll,
            section.top - size.height * 0.25,
            section.top,
          );
    const from = shots[shotOf(Math.max(0, index - 1))];
    const to = shots[shotOf(index)];
    target.current.set(
      THREE.MathUtils.lerp(from[0], to[0], blend),
      THREE.MathUtils.lerp(from[1], to[1], blend),
      THREE.MathUtils.lerp(from[2], to[2], blend),
    );
    composition.scene =
      section?.id ??
      `${world === "home" ? "H" : world === "redroom" ? "R" : "D"}1`;
    composition.local = section
      ? THREE.MathUtils.clamp(
          (scroll - section.top) / Math.max(1, section.height - size.height),
          0,
          1,
        )
      : 0;
    composition.hero = index === 0;
    const portrait = size.width < size.height;
    const transition = frame.transition;
    if (motionEnabled && transition.phase === "exit") {
      const p = transition.dollyProgress;
      if (transition.type === "T1" || transition.type === "T2") {
        const doorX = portrait ? 0 : transition.type === "T1" ? -1.65 : 1.65;
        target.current.x = THREE.MathUtils.lerp(target.current.x, doorX, p);
        target.current.z -= p * (transition.type === "T1" ? 3.2 : 3);
      } else if (transition.type === "T4") target.current.z += 3.6 * p;
    }
    if (motionEnabled && !portrait)
      target.current.x += frame.pointer.damped.x * 0.055;
    if (frame.snapCamera) position.current.copy(target.current);
    else position.current.lerp(target.current, 1 - Math.exp(-12 * delta));
    camera.position.copy(position.current);
    // Shift the projection instead of tilting: architectural verticals stay parallel.
    camera.rotation.set(0, 0, 0);
    camera.fov = portrait ? 36 : 34;
    const shiftY =
      portrait && index === 0
        ? 0.045
        : portrait
          ? 0.015
          : THREE.MathUtils.lerp(from[3] ?? 0.015, to[3] ?? 0.015, blend);
    // Past the last scene the footer scrolls in: move the picture up by the
    // same pixels, so the 3D (the doors under their captions) scrolls with the
    // page instead of staying put while the DOM slides over it.
    const last = sections.current[sections.current.length - 1];
    const overscroll = last
      ? Math.max(0, scroll - (last.top + last.height - size.height))
      : 0;
    camera.setViewOffset(
      size.width,
      size.height,
      0,
      shiftY * size.height + overscroll,
      size.width,
      size.height,
    );
    composition.focusDistance =
      camera.position.z - (world === "redroom" || world === "diwali" ? 0.6 : 0);
  }, -40);
  return null;
}
