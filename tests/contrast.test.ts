import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
function token(name: string) {
  const value = css.match(new RegExp(`--color-${name}: (#[0-9a-f]{6})`))?.[1];
  if (!value) throw new Error(`Missing color token: ${name}`);
  return [1, 3, 5].map(
    (offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255,
  );
}
function luminance(color: number[]) {
  return color
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}
function contrast(a: number[], b: number[]) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const shaderSource = readFileSync(
  new URL('../src/ink/shaders.ts', import.meta.url),
  'utf8',
);
const maximumOpacity = Number(
  shaderSource.match(/float alpha = ([0-9.]+) \*/)?.[1],
);
const inkColor = shaderSource
  .match(/vec3\(([0-9.]+), ([0-9.]+), ([0-9.]+)\) \* alpha/)
  ?.slice(1)
  .map(Number);

describe('contrast through the ink canvas', () => {
  it('finds the renderer color and maximum alpha', () => {
    expect(maximumOpacity).toBeGreaterThan(0);
    expect(maximumOpacity).toBeLessThan(1);
    expect(inkColor).toHaveLength(3);
  });

  it.each(['ink', 'muted', 'accent'])(
    '%s text stays AA at maximum ink opacity',
    (name) => {
      if (!inkColor) throw new Error('Cannot read ink shader color');
      const darkestBackground = token('paper').map(
        (channel, index) =>
          channel * (1 - maximumOpacity) + inkColor[index] * maximumOpacity,
      );
      expect(contrast(token(name), darkestBackground)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(token(name), [1, 1, 1])).toBeGreaterThanOrEqual(4.5);
    },
  );
});
