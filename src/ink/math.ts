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
  return Math.max(-220, Math.min(220, delta * 7));
}

export function frameDelta(now: number, previous: number) {
  return Math.min(Math.max((now - previous) / 1000, 0), 1 / 30);
}
