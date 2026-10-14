/** Stable analytic underdamped spring; frequency in Hz, damping ratio below one. */
export function spring(
  value: number,
  velocity: number,
  target: number,
  dt: number,
  frequency = 2.2,
  damping = 0.75,
): [number, number] {
  const w = frequency * Math.PI * 2,
    wd = w * Math.sqrt(1 - damping * damping);
  const displacement = value - target,
    decay = Math.exp(-damping * w * dt);
  const a = displacement,
    b = (velocity + damping * w * displacement) / wd;
  const c = Math.cos(wd * dt),
    s = Math.sin(wd * dt);
  return [
    target + decay * (a * c + b * s),
    decay * ((-damping * w * a + wd * b) * c + (-damping * w * b - wd * a) * s),
  ];
}
