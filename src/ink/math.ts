export function simulationSize(
  width: number,
  height: number,
  shortEdge: number,
) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  return aspect >= 1
    ? {
        width: Math.min(shortEdge * 2, Math.round(shortEdge * aspect)),
        height: shortEdge,
      }
    : {
        width: shortEdge,
        height: Math.min(shortEdge * 2, Math.round(shortEdge / aspect)),
      };
}

export function pointerImpulse(delta: number) {
  return Math.max(-48, Math.min(48, delta * 2));
}

export function frameDelta(now: number, previous: number) {
  return Math.min(Math.max((now - previous) / 1000, 0), 1 / 30);
}

export const INK_IDLE_MS = 2500;

export function idleFade(elapsed: number) {
  const progress = Math.min(1, Math.max(0, (elapsed - 800) / 1500));
  return 1 - progress * progress * (3 - 2 * progress);
}
