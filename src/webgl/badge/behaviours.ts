/**
 * Badge interactive and autonomous behaviours per BRIEF.md Part 5.2
 */

import * as THREE from "three";
import { spring } from "@/motion/spring";
import { createNoise2D } from "simplex-noise";

export interface BadgeBehaviourState {
  time: number;
  dt: number;
  pointer: { x: number; y: number; lastMoveTime: number };
  hoverDoor: "redroom" | "diwali" | null;
  dragVelocity: number;
  dragRotationY: number;
  isDragging: boolean;
  manualBlinkTrigger: number;
  choreoYaw?: number;
  choreoPos?: THREE.Vector3;
  wobbleX?: number;
}

export class BadgeBehaviours {
  private tiltVelocity = [0, 0, 0];
  private noise2D = createNoise2D();
  private nextBlinkTime = 4.0;
  private isBlinking = false;
  private isWink = false;
  private blinkProgress = 0;
  private nextWagTime = 7.0;
  private isWagging = false;
  private wagProgress = 0;
  private lastManualTrigger = 0;

  public update(
    root: THREE.Group,
    eyeL: THREE.Object3D | null,
    eyeR: THREE.Object3D | null,
    tongue: THREE.Object3D | null,
    state: BadgeBehaviourState,
  ) {
    const {
      time,
      dt,
      pointer,
      hoverDoor,
      dragVelocity,
      dragRotationY,
      isDragging,
      manualBlinkTrigger,
      choreoYaw,
      choreoPos,
      wobbleX,
    } = state;

    // 1. Idle Float: y ±0.03m, rotation ±3° via low-frequency simplex noise at 0.12 Hz
    const floatY = this.noise2D(time * 0.12, 1) * 0.03;
    const floatRotX = this.noise2D(time * 0.1, 2) * THREE.MathUtils.degToRad(3);
    const floatRotZ =
      this.noise2D(time * 0.09, 3) * THREE.MathUtils.degToRad(2.5);

    // Apply position: choreography position + idle float Y
    if (choreoPos) {
      root.position.x = dt
        ? THREE.MathUtils.damp(root.position.x, choreoPos.x, 12, dt)
        : choreoPos.x;
      root.position.y = dt
        ? THREE.MathUtils.damp(root.position.y, choreoPos.y + floatY, 12, dt)
        : choreoPos.y;
      root.position.z = dt
        ? THREE.MathUtils.damp(root.position.z, choreoPos.z, 12, dt)
        : choreoPos.z;
    } else {
      root.position.y += floatY;
    }

    // 2. Idle Decay: after 3s without pointer movement, cursor influence fades over 1.2s
    const idleTime = time - pointer.lastMoveTime;
    const decayFactor =
      idleTime > 3 ? THREE.MathUtils.clamp(1 - (idleTime - 3) / 1.2, 0, 1) : 1;

    // 3. Cursor Tilt: up to 14° toward pointer (f = 2.2 Hz, damping)
    const tiltX = -pointer.y * THREE.MathUtils.degToRad(14) * decayFactor;
    let tiltY = pointer.x * THREE.MathUtils.degToRad(14) * decayFactor;

    // 4. Look-at Door (H5): turns 10° toward hovered door
    let eyeShiftX = 0;
    if (hoverDoor === "redroom") {
      tiltY -= THREE.MathUtils.degToRad(10);
      eyeShiftX = -0.02;
    } else if (hoverDoor === "diwali") {
      tiltY += THREE.MathUtils.degToRad(10);
      eyeShiftX = 0.02;
    }

    // 5. Coin Spin: Rotates fully like a real coin on click and swipe-through
    const totalTargetRotY = (choreoYaw ?? 0) + tiltY + dragRotationY;
    const isSpinning = isDragging || Math.abs(dragVelocity) > 0.05;

    [root.rotation.x, this.tiltVelocity[0]] = spring(
      root.rotation.x,
      this.tiltVelocity[0],
      dt ? floatRotX + tiltX + (wobbleX ?? 0) : 0,
      dt || 1,
      2.2,
      0.75,
    );

    if (isSpinning) {
      // Actively dragged or spinning with angular momentum: direct smooth coin rotation
      root.rotation.y = totalTargetRotY;
      this.tiltVelocity[1] = dragVelocity;
    } else {
      // Settled or idling: spring gently to target face orientation
      [root.rotation.y, this.tiltVelocity[1]] = spring(
        root.rotation.y,
        this.tiltVelocity[1],
        dt ? totalTargetRotY : (choreoYaw ?? 0),
        dt || 1,
        2.2,
        0.75,
      );
    }

    [root.rotation.z, this.tiltVelocity[2]] = spring(
      root.rotation.z,
      this.tiltVelocity[2],
      dt ? floatRotZ : 0,
      dt || 1,
      2.2,
      0.75,
    );

    // 6. Blink / Wink logic: every 3.5 - 7s randomly, or on manual trigger
    if (manualBlinkTrigger !== this.lastManualTrigger) {
      this.lastManualTrigger = manualBlinkTrigger;
      this.isBlinking = true;
      this.isWink = true;
      this.blinkProgress = 0;
    }

    if (!this.isBlinking && time >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.isWink = Math.random() < 0.166; // 1 in 6 is a wink (left eye only)
      this.blinkProgress = 0;
      this.nextBlinkTime = time + THREE.MathUtils.randFloat(3.5, 7.0);
    }

    if (this.isBlinking) {
      this.blinkProgress += dt;
      let scaleY = 1.0;
      if (this.blinkProgress <= 0.08) {
        // Close down to 0.08 in 80ms
        scaleY = THREE.MathUtils.lerp(1.0, 0.08, this.blinkProgress / 0.08);
      } else if (this.blinkProgress <= 0.22) {
        // Reopen in 140ms
        scaleY = THREE.MathUtils.lerp(
          0.08,
          1.0,
          (this.blinkProgress - 0.08) / 0.14,
        );
      } else {
        this.isBlinking = false;
        scaleY = 1.0;
      }

      if (eyeL) {
        const baseScaleY = (eyeL.userData.baseScaleY ??= eyeL.scale.y);
        const baseX = (eyeL.userData.baseX ??= eyeL.position.x);
        eyeL.scale.y = baseScaleY * scaleY;
        eyeL.position.x = baseX + eyeShiftX;
      }
      if (eyeR) {
        const baseScaleY = (eyeR.userData.baseScaleY ??= eyeR.scale.y);
        const baseX = (eyeR.userData.baseX ??= eyeR.position.x);
        eyeR.scale.y = this.isWink ? baseScaleY : baseScaleY * scaleY;
        eyeR.position.x = baseX + eyeShiftX;
      }
    } else {
      if (eyeL) {
        const baseX = (eyeL.userData.baseX ??= eyeL.position.x);
        eyeL.position.x = baseX + eyeShiftX;
      }
      if (eyeR) {
        const baseX = (eyeR.userData.baseX ??= eyeR.position.x);
        eyeR.position.x = baseX + eyeShiftX;
      }
    }

    // 7. Tongue Wag: every ~9s or hover, swings ±12° around pivot for ~1.2s
    if (!this.isWagging && time >= this.nextWagTime) {
      this.isWagging = true;
      this.wagProgress = 0;
      this.nextWagTime = time + THREE.MathUtils.randFloat(8.0, 11.0);
    }

    if (this.isWagging && tongue) {
      this.wagProgress += dt;
      if (this.wagProgress <= 1.2) {
        // Harmonic swing damped with f = 3 Hz, damping
        const decay = Math.exp(-0.35 * Math.PI * 6 * this.wagProgress);
        const swing =
          Math.sin(this.wagProgress * Math.PI * 6) *
          THREE.MathUtils.degToRad(12) *
          (tongue.userData.wag ?? 1) *
          decay;
        tongue.rotation.z = swing;
      } else {
        this.isWagging = false;
        tongue.rotation.z = 0;
      }
    }
  }
}
