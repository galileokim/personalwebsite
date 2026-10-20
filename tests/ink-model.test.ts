import { describe, expect, it } from 'vitest';
import {
  InkTrail,
  inkFade,
  MAX_TRAIL_POINTS,
  sampleRibbon,
  TRAIL_LIFETIME,
} from '../src/ink/model';

function straightStroke() {
  const trail = new InkTrail();
  trail.move(20, 80, 0);
  trail.move(200, 80, 100);
  return trail;
}

describe('point-fed ink trail', () => {
  it('does not pool ink under a stationary pointer', () => {
    const trail = new InkTrail();
    trail.move(80, 80, 0);
    for (let time = 1; time < 100; time++) trail.move(80, 80, time);
    expect(trail.drawable).toBe(false);
    expect(trail.strokes[0].points).toHaveLength(1);
  });

  it('resamples fast motion into a continuous stroke ending at the cursor', () => {
    const trail = straightStroke();
    const points = trail.strokes[0].points;
    expect(points.at(-1)).toMatchObject({ x: 200, y: 80 });
    expect(
      points.every(
        (point, index) =>
          index === 0 || point.x - points[index - 1].x <= 3 + 1e-9,
      ),
    ).toBe(true);
    expect(trail.drawable).toBe(true);
  });

  it('keeps one zero-width tip, with no ink geometry ahead of it', () => {
    const stroke = straightStroke().strokes[0];
    for (const time of [100, 500, 1800, 3000]) {
      for (let strand = 0; strand < 4; strand++) {
        const ribbon = sampleRibbon(stroke, time, strand);
        expect(ribbon.at(-1)).toMatchObject({ x: 200, y: 80, width: 0 });
        expect(ribbon.every((point) => point.x <= 200)).toBe(true);
      }
    }
  });

  it('widens behind the point instead of drawing a circular leading cap', () => {
    const ribbon = sampleRibbon(straightStroke().strokes[0], 100);
    expect(ribbon.at(-2)?.width).toBeLessThan(0.3);
    expect(ribbon.at(-10)?.width).toBeGreaterThan(1.5);
  });

  it('releases wisps only after the deposited ink has aged', () => {
    const stroke = straightStroke().strokes[0];
    expect(
      sampleRibbon(stroke, 100, 1).every((point) => point.width === 0),
    ).toBe(true);
    const old = sampleRibbon(stroke, 1100, 1);
    expect(old.some((point) => point.width > 0.2)).toBe(true);
    expect(old.some((point) => Math.abs(point.y - 80) > 2)).toBe(true);
  });

  it('does not push existing strokes when the pointer starts another stroke', () => {
    const trail = straightStroke();
    const stroke = trail.strokes[0];
    const before = sampleRibbon(stroke, 1000, 2);
    trail.move(400, 300, 500);
    trail.move(550, 400, 550);
    expect(sampleRibbon(stroke, 1000, 2)).toEqual(before);
  });

  it('varies nib width by stroke direction', () => {
    const thin = new InkTrail();
    thin.move(0, 0, 0);
    thin.move(120, 120, 100);
    const wide = new InkTrail();
    wide.move(0, 120, 0);
    wide.move(120, 0, 100);
    const thinWidth = Math.max(
      ...sampleRibbon(thin.strokes[0], 100).map((point) => point.width),
    );
    const wideWidth = Math.max(
      ...sampleRibbon(wide.strokes[0], 100).map((point) => point.width),
    );
    expect(wideWidth).toBeGreaterThan(thinWidth * 2);
  });

  it('starts a separate stroke after a pause or pointer leave', () => {
    const trail = straightStroke();
    trail.move(500, 80, 400);
    expect(trail.strokes).toHaveLength(2);
    trail.endStroke();
    trail.move(600, 80, 450);
    expect(trail.strokes).toHaveLength(3);
  });

  it('bounds memory during long continuous drawing', () => {
    const trail = new InkTrail();
    for (let step = 0; step < 1200; step++)
      trail.move(step * 5, Math.sin(step / 20) * 80, step * 2);
    expect(
      trail.strokes.reduce((count, stroke) => count + stroke.points.length, 0),
    ).toBeLessThanOrEqual(MAX_TRAIL_POINTS);
  });

  it('removes expired ink and clears all state', () => {
    const trail = straightStroke();
    trail.prune(100 + TRAIL_LIFETIME);
    expect(trail.drawable).toBe(false);
    expect(trail.strokes).toHaveLength(0);
    trail.move(0, 0, 4000);
    trail.clear();
    expect(trail.strokes).toHaveLength(0);
  });

  it('rejects non-finite input', () => {
    const trail = new InkTrail();
    trail.move(Number.NaN, 1, 0);
    trail.move(0, Number.POSITIVE_INFINITY, 0);
    expect(trail.strokes).toHaveLength(0);
  });

  it('fades ink continuously to zero', () => {
    expect(inkFade(0)).toBe(1);
    expect(inkFade(1000)).toBeGreaterThan(inkFade(2000));
    expect(inkFade(TRAIL_LIFETIME)).toBe(0);
  });
});
