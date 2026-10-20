export const TRAIL_LIFETIME = 3600;
export const MAX_TRAIL_POINTS = 900;
const POINT_SPACING = 3;
const STROKE_GAP = 180;

type Point = { x: number; y: number; time: number; distance: number };
export type Stroke = { points: Point[]; phase: number };
export type RibbonPoint = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  width: number;
};

function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function inkFade(age: number) {
  return 1 - smoothstep(600, TRAIL_LIFETIME, age);
}

export class InkTrail {
  strokes: Stroke[] = [];
  private active: Stroke | undefined;
  private sequence = 0;

  move(x: number, y: number, time: number) {
    if (![x, y, time].every(Number.isFinite)) return;
    const previous = this.active?.points.at(-1);
    if (!previous || time - previous.time > STROKE_GAP) {
      this.active = {
        points: [{ x, y, time, distance: 0 }],
        phase: this.sequence++ * 2.399963,
      };
      this.strokes.push(this.active);
    } else {
      const distance = Math.hypot(x - previous.x, y - previous.y);
      if (distance < 0.25) return;
      const steps = Math.min(96, Math.ceil(distance / POINT_SPACING));
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        this.active?.points.push({
          x: previous.x + (x - previous.x) * t,
          y: previous.y + (y - previous.y) * t,
          time: previous.time + (time - previous.time) * t,
          distance: previous.distance + distance * t,
        });
      }
    }
    this.prune(time);
  }

  endStroke() {
    this.active = undefined;
  }

  clear() {
    this.strokes = [];
    this.active = undefined;
  }

  prune(now: number) {
    for (const stroke of this.strokes) {
      const firstAlive = stroke.points.findIndex(
        (point) => now - point.time < TRAIL_LIFETIME,
      );
      stroke.points.splice(
        0,
        firstAlive < 0 ? stroke.points.length : firstAlive,
      );
    }
    this.strokes = this.strokes.filter((stroke) => stroke.points.length > 0);
    let excess =
      this.strokes.reduce((count, stroke) => count + stroke.points.length, 0) -
      MAX_TRAIL_POINTS;
    while (excess > 0 && this.strokes.length > 0) {
      const oldest = this.strokes[0];
      const remove = Math.min(oldest.points.length, excess);
      oldest.points.splice(0, remove);
      excess -= remove;
      if (oldest.points.length === 0) this.strokes.shift();
    }
  }

  get drawable() {
    return this.strokes.some((stroke) => stroke.points.length > 1);
  }
}

/** Samples a tapered ribbon. Strand zero is the nib; other strands emerge from aging ink. */
export function sampleRibbon(
  stroke: Stroke,
  now: number,
  strand = 0,
): RibbonPoint[] {
  const first = stroke.points[0];
  const last = stroke.points.at(-1);
  if (!first || !last || stroke.points.length < 2) return [];

  return stroke.points.map((point, index, points) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const length = Math.hypot(next.x - previous.x, next.y - previous.y) || 1;
    const tx = (next.x - previous.x) / length;
    const ty = (next.y - previous.y) / length;
    const nx = -ty;
    const ny = tx;
    const age = Math.max(0, now - point.time);
    const seconds = age / 1000;
    const tip = smoothstep(0, 24, last.distance - point.distance);
    const tail = smoothstep(0, 12, point.distance - first.distance);
    const fade = inkFade(age);
    const release = smoothstep(120, 1000, age) * tip;
    const phase = point.distance * 0.025 + stroke.phase;
    const flow =
      Math.sin(phase + seconds * 0.7) +
      0.35 * Math.sin(phase * 1.7 - seconds * 0.45);
    const direction = strand % 2 === 0 ? -1 : 1;
    const separation =
      strand === 0 ? 0 : direction * (1.4 + strand * 1.2 + seconds * 1.3);
    const lateral =
      release * (separation + flow * (strand === 0 ? 1.2 : 1.8 + seconds));
    const retreat = release * seconds * 1.3;
    const nibWidth = 0.9 + 1.7 * Math.abs((nx + ny) * Math.SQRT1_2);
    const width =
      strand === 0 ? nibWidth : (0.24 + 0.12 * Math.sin(phase) ** 2) * release;

    // New pointer input never accelerates older ink; each point drifts in its own stroke's frame.
    return {
      x: point.x + nx * lateral - tx * retreat,
      y: point.y + ny * lateral - ty * retreat,
      nx,
      ny,
      width: width * tip * tail * fade,
    };
  });
}
