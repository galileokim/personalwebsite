import { describe, expect, it } from 'vitest';
import { profile, projects } from '../src/data/portfolio';
import { frameDelta, pointerImpulse, simulationSize } from '../src/ink/math';

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
