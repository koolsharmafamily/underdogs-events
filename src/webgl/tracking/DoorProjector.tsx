"use client";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { composition } from "../composition";
import { doorModels } from "./doorModels";
export const domTwinRefs: {
  red: HTMLAnchorElement | null;
  diwali: HTMLAnchorElement | null;
} = { red: null, diwali: null };
const box = new THREE.Box3(),
  point = new THREE.Vector3();
export function DoorProjector() {
  const { camera, size } = useThree();
  useFrame(() => {
    for (const key of ["red", "diwali"] as const) {
      const el = domTwinRefs[key],
        model = doorModels[key];
      if (!el) continue;
      const visible = composition.scene === "H5" && model?.visible;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      if (!visible || !model) continue;
      model.updateWorldMatrix(true, true);
      box.setFromObject(model);
      let left = Infinity,
        top = Infinity,
        right = -Infinity,
        bottom = -Infinity;
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            point.set(x, y, z).project(camera);
            const px = (point.x * 0.5 + 0.5) * size.width,
              py = (-point.y * 0.5 + 0.5) * size.height;
            left = Math.min(left, px);
            right = Math.max(right, px);
            top = Math.min(top, py);
            bottom = Math.max(bottom, py);
          }
      el.style.transform = `translate3d(${Math.round(left)}px,${Math.round(top)}px,0)`;
      el.style.width = `${Math.round(right - left)}px`;
      el.style.height = `${Math.round(bottom - top)}px`;
    }
  });
  return null;
}
