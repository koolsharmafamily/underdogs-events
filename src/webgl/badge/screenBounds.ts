export const badgeScreenBounds = {
  x: 0,
  y: 0,
  /** Projected badge diameter in CSS px. */
  size: 210,
  ready: false,
  readySkin: null as "enamel" | "halloween" | "jewelled" | null,
  /** Some skin (incoming or still-dissolving outgoing) is on screen this frame. */
  drawn: false,
};

/**
 * CSS mask for a full-screen cover that leaves the badge showing through a soft
 * round aperture, or "none" when no badge is drawn (never an empty hole).
 */
export function badgeApertureMask() {
  const b = badgeScreenBounds;
  if (!b.drawn || b.size < 8) return "none";
  const inner = b.size * 0.56;
  const outer = b.size * 0.78;
  return `radial-gradient(circle at ${b.x}px ${b.y}px, transparent ${inner}px, #000 ${outer}px)`;
}
