import { describe, expect, it } from 'vitest';
import { profile, projects } from '../src/data/portfolio';
import {
  frameDelta,
  INK_IDLE_MS,
  idleFade,
  pointerImpulse,
  simulationSize,
} from '../src/ink/math';

describe('bounded fluid simulation', () => {
  it('preserves aspect ratio within the GPU texture budget', () => {
    expect(simulationSize(1440, 900, 112)).toEqual({ width: 179, height: 112 });
    expect(simulationSize(900, 1440, 112)).toEqual({ width: 112, height: 179 });
    expect(simulationSize(10000, 100, 112)).toEqual({
      width: 224,
      height: 112,
    });
    expect(simulationSize(100, 10000, 112)).toEqual({
      width: 112,
      height: 224,
    });
  });

  it('handles a temporarily zero-sized viewport', () => {
    expect(simulationSize(0, 0, 112)).toEqual({ width: 112, height: 112 });
  });

  it('clamps pointer impulses in both directions', () => {
    expect(pointerImpulse(3)).toBe(6);
    expect(pointerImpulse(-3)).toBe(-6);
    expect(pointerImpulse(1000)).toBe(48);
    expect(pointerImpulse(-1000)).toBe(-48);
  });

  it('limits the timestep after a pause', () => {
    expect(frameDelta(1016, 1000)).toBeCloseTo(0.016);
    expect(frameDelta(9000, 1000)).toBe(1 / 30);
    expect(frameDelta(1000, 1016)).toBe(0);
  });
});

describe('short ink lifetime', () => {
  it('starts fading shortly after pointer movement stops', () => {
    expect(idleFade(0)).toBe(1);
    expect(idleFade(800)).toBe(1);
    expect(idleFade(1550)).toBeCloseTo(0.5);
  });

  it('finishes fading before the buffers are cleared', () => {
    expect(idleFade(2300)).toBe(0);
    expect(INK_IDLE_MS).toBe(2500);
    expect(idleFade(INK_IDLE_MS)).toBe(0);
  });

  it('stays bounded and fades monotonically', () => {
    expect(idleFade(-100)).toBe(1);
    expect(idleFade(10000)).toBe(0);
    const values = Array.from({ length: 80 }, (_, index) =>
      idleFade(index * 40),
    );
    expect(
      values.every(
        (value, index) =>
          value >= 0 &&
          value <= 1 &&
          (index === 0 || value <= values[index - 1]),
      ),
    ).toBe(true);
  });
});

describe('owner-supplied content', () => {
  it('includes each supplied project with usable notes', () => {
    expect(projects.map((project) => project.name)).toEqual([
      'Social Time Tracker',
      'ExerciseLogger',
      'Mailsweep',
      'SuadeAI',
    ]);
    for (const project of projects) {
      expect(project.notes.length).toBeGreaterThan(0);
      expect(project.technologies.length).toBeGreaterThan(0);
    }
  });

  it('keeps the unapproved phone number out of public data', () => {
    expect(profile).not.toHaveProperty('phone');
    expect(profile.email).toBe('galileokim451@gmail.com');
  });
});
