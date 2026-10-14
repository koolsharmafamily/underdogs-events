/**
 * Real coin rotational physics for the 3D Underdogs badge coin.
 * Supports full 360° multi-rotation on click and swipe-through with inertia,
 * gyroscopic flutter, and smooth settling.
 */

import * as THREE from "three";

class CoinPhysicsManager {
  public isDragging = false;
  public angleY = 0;
  public velocity = 0;
  public wobbleX = 0;
  public settled = true;

  private smoothVx = 0;

  public onPointerDown() {
    this.isDragging = true;
    this.velocity = 0;
    this.smoothVx = 0;
    this.settled = false;
  }

  public onPointerMove(deltaX: number, deltaY: number, dt: number) {
    if (!this.isDragging) return;

    // Direct tactile rotation: dragging across rotates the coin smoothly
    const radDelta = deltaX * 0.016;
    this.angleY += radDelta;

    if (dt > 0.001) {
      const instantVelocity = radDelta / Math.max(0.008, dt / 1000);
      this.smoothVx = THREE.MathUtils.lerp(this.smoothVx, instantVelocity, 0.45);
    }
  }

  public onPointerUp(wasSwipe: boolean, swipeSpeed: number) {
    this.isDragging = false;

    if (wasSwipe && (Math.abs(swipeSpeed) > 0.8 || Math.abs(this.smoothVx) > 0.8)) {
      // Swipe-through: impart angular velocity with inertia like spinning a coin
      const v = Math.abs(swipeSpeed) > Math.abs(this.smoothVx) ? swipeSpeed : this.smoothVx;
      // Cap maximum spin speed to 6 full turns/sec (Math.PI * 12)
      this.velocity = Math.sign(v) * Math.min(Math.PI * 12, Math.max(Math.PI * 2.5, Math.abs(v)));
      this.settled = false;
    } else {
      // Gentle release: let it finish rotating and settle
      if (Math.abs(this.smoothVx) > 1.2) {
        this.velocity = this.smoothVx * 0.8;
      } else {
        this.velocity = 0;
      }
    }
  }

  /**
   * Click / tap trigger: spins the coin fully 360° (or 720°) like a real flipped/spun coin
   */
  public triggerCoinFlip(direction = 1) {
    this.settled = false;
    // Impart high initial rotational impulse (~3 full spins that decelerate)
    const spinImpulse = Math.PI * 9.5;
    this.velocity = direction * spinImpulse;
  }

  public update(delta: number, time: number) {
    if (delta <= 0) return;

    if (this.isDragging) {
      // While dragging, no air friction; wobble is slight
      this.wobbleX = THREE.MathUtils.damp(this.wobbleX, 0, 8, delta);
      return;
    }

    if (!this.settled) {
      // Apply rotational velocity
      this.angleY += this.velocity * delta;

      // Realistic angular air friction (decelerates naturally)
      this.velocity = THREE.MathUtils.damp(this.velocity, 0, 1.85, delta);

      // Gyroscopic precession / wobble during fast spin
      const spinSpeed = Math.abs(this.velocity);
      if (spinSpeed > 1.5) {
        const wobbleIntensity = Math.min(0.09, spinSpeed * 0.0065);
        this.wobbleX = Math.sin(time * 22) * wobbleIntensity;
      } else {
        this.wobbleX = THREE.MathUtils.damp(this.wobbleX, 0, 7, delta);
      }

      // When slowed down near rest, gently settle to the nearest clean full turn (face-forward)
      if (spinSpeed < 0.45) {
        const fullTurn = Math.PI * 2;
        const targetAngle = Math.round(this.angleY / fullTurn) * fullTurn;
        this.angleY = THREE.MathUtils.damp(this.angleY, targetAngle, 5.5, delta);

        if (Math.abs(this.angleY - targetAngle) < 0.003 && spinSpeed < 0.05) {
          this.angleY = targetAngle;
          this.velocity = 0;
          this.wobbleX = 0;
          this.settled = true;
        }
      }
    }
  }
}

export const coinSpin = new CoinPhysicsManager();

if (typeof window !== "undefined") {
  (window as unknown as { __coinSpin?: CoinPhysicsManager }).__coinSpin = coinSpin;
}
