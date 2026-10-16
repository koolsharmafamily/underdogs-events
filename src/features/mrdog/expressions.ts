import * as THREE from "three";
import { MrDogRig, setRigOutfit, setRigEyes } from "./rig";
import { MrDogOutfit, MrDogExpression } from "./store";
import { damp } from "@/motion/eases";
import { spring } from "@/motion/spring";

const DEG2RAD = Math.PI / 180;

export interface AnimParams {
  dt: number;
  time: number;
  expression: MrDogExpression;
  outfit: MrDogOutfit;
  jawTarget: number;
  pointer: { x: number; y: number }; // NDC [-1, 1]
  motionEnabled: boolean;
  isPeeking: boolean;
}

export class MrDogAnimator {
  private rig: MrDogRig;
  private currentOutfit: MrDogOutfit;
  private pendingOutfit: MrDogOutfit | null = null;

  // Turn animation
  private isTurning = false;
  private turnElapsed = 0;
  private turnTotalDuration = 0.7; // 700ms

  // Peek animation
  private peekY = -0.6;
  private peekVy = 0;

  // Blinking timer
  private blinkTimer = 0;
  private nextBlink = 3.5;
  private isBlinking = false;
  private blinkDuration = 0.12;

  // Ear twitch timer
  private earTwitchTimer = 0;
  private nextEarTwitch = 6.0;
  private twitchingEar: "L" | "R" = "L";

  // Damped transforms
  private headPitch = 0;
  private headYaw = 0;
  private headRoll = 0;
  private jawAngle = 0;
  private tongueAngle = 0;
  private tagAngle = 0;
  private tagVelocity = 0;
  private eyelidL = 0;
  private eyelidR = 0;
  private earRotL = 0;
  private earRotR = 0;
  private browY = 0;

  // Initial base transforms to preserve model rig rest poses
  private baseHeadPos = new THREE.Vector3();
  private baseHeadRot = new THREE.Euler();
  private baseJawRot = new THREE.Euler();
  private baseTongueRot = new THREE.Euler();
  private baseEarLRot = new THREE.Euler();
  private baseEarRRot = new THREE.Euler();
  private baseTagRot = new THREE.Euler();
  private baseRootPos = new THREE.Vector3();

  constructor(rig: MrDogRig, initialOutfit: MrDogOutfit) {
    this.rig = rig;
    this.currentOutfit = initialOutfit;

    if (rig.head) {
      this.baseHeadPos.copy(rig.head.position);
      this.baseHeadRot.copy(rig.head.rotation);
    }
    if (rig.jaw) this.baseJawRot.copy(rig.jaw.rotation);
    if (rig.tongue) this.baseTongueRot.copy(rig.tongue.rotation);
    if (rig.earL) this.baseEarLRot.copy(rig.earL.rotation);
    if (rig.earR) this.baseEarRRot.copy(rig.earR.rotation);
    if (rig.tag) this.baseTagRot.copy(rig.tag.rotation);
    if (rig.root) this.baseRootPos.copy(rig.root.position);

    setRigOutfit(rig, initialOutfit);
    setRigEyes(rig, "open");
  }

  public triggerOutfitChange(newOutfit: MrDogOutfit, motionEnabled: boolean) {
    if (newOutfit === this.currentOutfit) return;

    if (!motionEnabled) {
      this.currentOutfit = newOutfit;
      setRigOutfit(this.rig, newOutfit);
      return;
    }

    this.pendingOutfit = newOutfit;
    this.isTurning = true;
    this.turnElapsed = 0;
  }

  public update(params: AnimParams) {
    const { dt, time, expression, outfit, jawTarget, pointer, motionEnabled, isPeeking } = params;

    // Handle outfit changes
    if (outfit !== this.currentOutfit && outfit !== this.pendingOutfit) {
      this.triggerOutfitChange(outfit, motionEnabled);
    }

    // 1. Outfit Turn (360° on Y over 700ms, swap at 180°)
    let turnY = 0;
    if (this.isTurning && motionEnabled) {
      this.turnElapsed += dt;
      const progress = Math.min(1, this.turnElapsed / this.turnTotalDuration);
      turnY = progress * Math.PI * 2;

      if (progress >= 0.5 && this.pendingOutfit) {
        this.currentOutfit = this.pendingOutfit;
        setRigOutfit(this.rig, this.pendingOutfit);
        this.pendingOutfit = null;
      }

      if (progress >= 1) {
        this.isTurning = false;
        turnY = 0;
      }
    } else if (!motionEnabled && this.pendingOutfit) {
      this.currentOutfit = this.pendingOutfit;
      setRigOutfit(this.rig, this.pendingOutfit);
      this.pendingOutfit = null;
      this.isTurning = false;
    }

    // 2. Peek-in Spring (y: -0.6 -> 0)
    if (motionEnabled) {
      const targetPeek = isPeeking ? 0 : -0.6;
      const [newY, newVy] = spring(this.peekY, this.peekVy, targetPeek, dt, 2.5, 0.72);
      this.peekY = newY;
      this.peekVy = newVy;
    } else {
      this.peekY = isPeeking ? 0 : -0.6;
    }

    if (this.rig.root) {
      this.rig.root.position.y = this.baseRootPos.y + this.peekY;
      this.rig.root.rotation.y = turnY;
    }

    // 3. Eye Mode: ✕ eyes in "rage", open elsewhere
    if (expression === "rage") {
      setRigEyes(this.rig, "x");
    } else {
      setRigEyes(this.rig, "open");
    }

    if (!motionEnabled) {
      // With Motion OFF: reset transforms to rest pose and return
      this.resetTransforms();
      return;
    }

    // 4. Idle Breathing & Sway
    // Head bob ±0.004 m, ~0.25 Hz
    const breathBob = Math.sin(time * Math.PI * 2 * 0.25) * 0.004;
    // Head sway ±2°
    const breathSway = Math.sin(time * Math.PI * 2 * 0.18) * (2 * DEG2RAD);

    // 5. Pointer follow (max yaw 12°, pitch 8°, lambda 6)
    const targetFollowYaw = -pointer.x * (12 * DEG2RAD);
    const targetFollowPitch = pointer.y * (8 * DEG2RAD);

    // 6. Expression Pose Targets
    let targetHeadPitch = targetFollowPitch;
    let targetHeadYaw = targetFollowYaw + breathSway;
    let targetHeadRoll = 0;
    let targetEarL = 0;
    let targetEarR = 0;
    let targetBrowY = 0;

    switch (expression) {
      case "listening":
        // Head tilts 12° on Z. Ears perk (-6° on X)
        targetHeadRoll = 12 * DEG2RAD;
        targetEarL = -6 * DEG2RAD;
        targetEarR = -6 * DEG2RAD;
        break;

      case "thinking":
        // Pupils up/left, Brow_L rises, Head tilts -6°
        targetHeadRoll = -6 * DEG2RAD;
        targetHeadYaw += 6 * DEG2RAD;
        targetHeadPitch += -4 * DEG2RAD;
        targetBrowY = 0.012;
        break;

      case "shrug":
        // Ears out sideways (airplane ears), brows up, head tilt 8°
        targetHeadRoll = 8 * DEG2RAD;
        targetEarL = 14 * DEG2RAD;
        targetEarR = -14 * DEG2RAD;
        targetBrowY = 0.015;
        break;

      case "rage":
        // Bounce overshoot, tongue wags at 3Hz
        targetHeadPitch += Math.sin(time * Math.PI * 2 * 3) * (5 * DEG2RAD);
        targetEarL = 10 * DEG2RAD;
        targetEarR = 10 * DEG2RAD;
        break;

      case "greet":
        // Double eyebrow raise, ears perk
        targetEarL = -8 * DEG2RAD;
        targetEarR = -8 * DEG2RAD;
        targetBrowY = (Math.sin(time * 12) > 0 ? 0.018 : 0);
        break;

      case "talking":
        // Nod at sentence end, speech envelope
        break;

      default:
        // Idle
        break;
    }

    // 7. Blinking (every 3-6 s, 120ms duration)
    this.blinkTimer += dt;
    if (this.blinkTimer >= this.nextBlink) {
      this.isBlinking = true;
      if (this.blinkTimer >= this.nextBlink + this.blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.nextBlink = 3.0 + Math.random() * 3.0;
      }
    }

    // 8. Ear Twitching (every 6-9 s, 8° in 180ms)
    this.earTwitchTimer += dt;
    let twitchAngle = 0;
    if (this.earTwitchTimer >= this.nextEarTwitch) {
      const twitchElapsed = this.earTwitchTimer - this.nextEarTwitch;
      if (twitchElapsed <= 0.18) {
        twitchAngle = Math.sin((twitchElapsed / 0.18) * Math.PI) * (8 * DEG2RAD);
      } else {
        this.earTwitchTimer = 0;
        this.nextEarTwitch = 6.0 + Math.random() * 3.0;
        this.twitchingEar = Math.random() > 0.5 ? "L" : "R";
      }
    }

    if (this.twitchingEar === "L") targetEarL += twitchAngle;
    else targetEarR += twitchAngle;

    // Wink expression
    let targetEyelidL = (this.isBlinking || expression === "wink") ? 1 : 0;
    let targetEyelidR = this.isBlinking ? 1 : 0;

    // Damping transforms
    this.headPitch = damp(this.headPitch, targetHeadPitch, 6, dt);
    this.headYaw = damp(this.headYaw, targetHeadYaw, 6, dt);
    this.headRoll = damp(this.headRoll, targetHeadRoll, 8, dt);
    this.earRotL = damp(this.earRotL, targetEarL, 10, dt);
    this.earRotR = damp(this.earRotR, targetEarR, 10, dt);
    this.browY = damp(this.browY, targetBrowY, 12, dt);
    this.eyelidL = damp(this.eyelidL, targetEyelidL, 24, dt);
    this.eyelidR = damp(this.eyelidR, targetEyelidR, 24, dt);

    // Jaw envelope (opens at most 18° = 0.314 rad, damped with lambda = 18)
    const targetJaw = Math.min(1, Math.max(0, jawTarget)) * (18 * DEG2RAD);
    this.jawAngle = damp(this.jawAngle, targetJaw, 18, dt);

    // Tongue follows jaw at 60%, plus 3Hz wag in rage
    let targetTongue = this.jawAngle * 0.6;
    let tongueWagZ = 0;
    if (expression === "rage") {
      tongueWagZ = Math.sin(time * Math.PI * 2 * 3) * (15 * DEG2RAD);
    }
    this.tongueAngle = damp(this.tongueAngle, targetTongue, 15, dt);

    // Tag swings as pendulum driven by head motion
    const tagDriver = (this.headYaw - targetFollowYaw) * 1.5;
    const [newTagA, newTagV] = spring(this.tagAngle, this.tagVelocity, tagDriver, dt, 3.2, 0.4);
    this.tagAngle = newTagA;
    this.tagVelocity = newTagV;

    // Apply to Three.js Nodes
    if (this.rig.head) {
      this.rig.head.position.y = this.baseHeadPos.y + breathBob;
      this.rig.head.rotation.x = this.baseHeadRot.x + this.headPitch;
      this.rig.head.rotation.y = this.baseHeadRot.y + this.headYaw;
      this.rig.head.rotation.z = this.baseHeadRot.z + this.headRoll;
    }

    if (this.rig.jaw) {
      this.rig.jaw.rotation.x = this.baseJawRot.x + this.jawAngle;
    }

    if (this.rig.tongue) {
      this.rig.tongue.rotation.x = this.baseTongueRot.x + this.tongueAngle;
      this.rig.tongue.rotation.z = this.baseTongueRot.z + tongueWagZ;
    }

    if (this.rig.earL) {
      this.rig.earL.rotation.x = this.baseEarLRot.x + this.earRotL;
    }
    if (this.rig.earR) {
      this.rig.earR.rotation.x = this.baseEarRRot.x + this.earRotR;
    }

    if (this.rig.eyelidL) {
      this.rig.eyelidL.scale.y = 1 - this.eyelidL * 0.85;
    }
    if (this.rig.eyelidR) {
      this.rig.eyelidR.scale.y = 1 - this.eyelidR * 0.85;
    }

    if (this.rig.browL) {
      this.rig.browL.position.y = this.browY;
    }
    if (this.rig.browR) {
      this.rig.browR.position.y = this.browY;
    }

    if (this.rig.tag) {
      this.rig.tag.rotation.z = this.baseTagRot.z + this.tagAngle;
    }
  }

  private resetTransforms() {
    if (this.rig.head) {
      this.rig.head.position.copy(this.baseHeadPos);
      this.rig.head.rotation.copy(this.baseHeadRot);
    }
    if (this.rig.jaw) this.rig.jaw.rotation.copy(this.baseJawRot);
    if (this.rig.tongue) this.rig.tongue.rotation.copy(this.baseTongueRot);
    if (this.rig.earL) this.rig.earL.rotation.copy(this.baseEarLRot);
    if (this.rig.earR) this.rig.earR.rotation.copy(this.baseEarRRot);
    if (this.rig.eyelidL) this.rig.eyelidL.scale.set(1, 1, 1);
    if (this.rig.eyelidR) this.rig.eyelidR.scale.set(1, 1, 1);
    if (this.rig.tag) this.rig.tag.rotation.copy(this.baseTagRot);
  }
}
