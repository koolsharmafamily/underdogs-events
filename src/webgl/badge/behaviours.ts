/**
 * Badge interactive and autonomous behaviours per BRIEF.md Part 5.2
 */

import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export interface BadgeBehaviourState {
  time: number;
  dt: number;
  pointer: { x: number; y: number; lastMoveTime: number };
  hoverDoor: 'redroom' | 'diwali' | null;
  dragVelocity: number;
  dragRotationY: number;
  isDragging: boolean;
  manualBlinkTrigger: number;
  choreoYaw?: number;
  choreoPos?: THREE.Vector3;
}

export class BadgeBehaviours {
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
    eyeL: THREE.Group | null,
    eyeR: THREE.Group | null,
    tongue: THREE.Group | null,
    state: BadgeBehaviourState
  ) {
    const { time, dt, pointer, hoverDoor, dragVelocity, dragRotationY, isDragging, manualBlinkTrigger, choreoYaw, choreoPos } = state;

    // 1. Idle Float: y ±0.03m, rotation ±3° via low-frequency simplex noise at 0.12 Hz
    const floatY = this.noise2D(time * 0.12, 1) * 0.03;
    const floatRotX = this.noise2D(time * 0.1, 2) * THREE.MathUtils.degToRad(3);
    const floatRotZ = this.noise2D(time * 0.09, 3) * THREE.MathUtils.degToRad(2.5);

    // Apply position: choreography position + idle float Y
    if (choreoPos) {
      root.position.x = choreoPos.x;
      root.position.y = choreoPos.y + floatY;
      root.position.z = choreoPos.z;
    } else {
      root.position.y += floatY;
    }

    // 2. Idle Decay: after 3s without pointer movement, cursor influence fades over 1.2s
    const idleTime = time - pointer.lastMoveTime;
    const decayFactor = idleTime > 3 ? THREE.MathUtils.clamp(1 - (idleTime - 3) / 1.2, 0, 1) : 1;

    // 3. Cursor Tilt: up to 14° toward pointer (f = 2.2 Hz, damping)
    const tiltX = -pointer.y * THREE.MathUtils.degToRad(14) * decayFactor;
    let tiltY = pointer.x * THREE.MathUtils.degToRad(14) * decayFactor;

    // 4. Look-at Door (H5): turns 10° toward hovered door
    let eyeShiftX = 0;
    if (hoverDoor === 'redroom') {
      tiltY -= THREE.MathUtils.degToRad(10);
      eyeShiftX = -0.02;
    } else if (hoverDoor === 'diwali') {
      tiltY += THREE.MathUtils.degToRad(10);
      eyeShiftX = 0.02;
    }

    // 5. Drag to Spin with inertia and spring return + choreography yaw
    const totalTargetRotY = (choreoYaw ?? 0) + tiltY + dragRotationY;
    root.rotation.x = THREE.MathUtils.damp(root.rotation.x, floatRotX + tiltX, 7, dt);
    root.rotation.y = THREE.MathUtils.damp(root.rotation.y, totalTargetRotY, 6, dt);
    root.rotation.z = THREE.MathUtils.damp(root.rotation.z, floatRotZ, 5, dt);

    // 6. Blink / Wink logic: every 3.5 - 7s randomly, or on manual trigger
    if (manualBlinkTrigger !== this.lastManualTrigger) {
      this.lastManualTrigger = manualBlinkTrigger;
      this.isBlinking = true;
      this.isWink = false;
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
        scaleY = THREE.MathUtils.lerp(0.08, 1.0, (this.blinkProgress - 0.08) / 0.14);
      } else {
        this.isBlinking = false;
        scaleY = 1.0;
      }

      if (eyeL) {
        eyeL.scale.y = scaleY;
        eyeL.position.x = -0.13 + eyeShiftX;
      }
      if (eyeR) {
        eyeR.scale.y = this.isWink ? 1.0 : scaleY;
        eyeR.position.x = 0.13 + eyeShiftX;
      }
    } else {
      if (eyeL) eyeL.position.x = -0.13 + eyeShiftX;
      if (eyeR) eyeR.position.x = 0.13 + eyeShiftX;
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
        const decay = 1 - this.wagProgress / 1.2;
        const swing = Math.sin(this.wagProgress * Math.PI * 6) * THREE.MathUtils.degToRad(12) * decay;
        tongue.rotation.z = swing;
      } else {
        this.isWagging = false;
        tongue.rotation.z = 0;
      }
    }
  }
}
