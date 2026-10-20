import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { shaders, vertexShader } from '../src/ink/shaders';

test('ink fades smoothly without emphasized edges', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'The touch layout does not render ink.');
  await page.goto('/');
  const result = await page.evaluate(
    ({ vertex, fragment }) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      const gl = canvas.getContext('webgl2');
      if (!gl) throw new Error('WebGL 2 is unavailable');
      const program = gl.createProgram();
      const texture = gl.createTexture();
      if (!program || !texture)
        throw new Error('Cannot allocate shader fixture');

      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Cannot allocate shader');
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(
            gl.getShaderInfoLog(shader) ?? 'Shader compilation failed',
          );
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error('Shader link failed');
      gl.useProgram(program);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const density = new Uint8Array(128 * 128 * 4);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const index = (y * 128 + x) * 4;
          density[index] = Math.round(
            255 * 0.9 * Math.exp(-((x - 64) ** 2) / 162),
          );
          density[index + 3] = 255;
        }
      }
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        128,
        128,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        density,
      );
      gl.uniform1i(gl.getUniformLocation(program, 'ink'), 0);
      gl.viewport(0, 0, 128, 128);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const pixels = new Uint8Array(128 * 4);
      gl.readPixels(0, 64, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      const alpha = Array.from({ length: 128 }, (_, x) => pixels[x * 4 + 3]);
      return {
        middle: alpha[64],
        edge: Math.max(...alpha.slice(50, 60)),
        rising: alpha.slice(0, 65),
        maximum: Math.max(...alpha),
        outside: alpha[0],
      };
    },
    { vertex: vertexShader, fragment: shaders.display },
  );
  expect(result.middle).toBeGreaterThan(0);
  expect(result.edge).toBeLessThan(result.middle);
  expect(
    result.rising.every(
      (alpha, index, values) => index === 0 || alpha >= values[index - 1],
    ),
  ).toBe(true);
  expect(result.maximum).toBeLessThanOrEqual(Math.ceil(255 * 0.14));
  expect(result.outside).toBe(0);
});

test('fast pointer movement leaves a continuous fine trail', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'The touch layout does not render ink.');
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-state', 'ready');
  await page.evaluate(() => document.fonts.ready);
  const clip = { x: 40, y: 340, width: 320, height: 120 };
  const before = PNG.sync.read(await page.screenshot({ clip, scale: 'css' }));
  await page.mouse.move(60, 400);
  await page.mouse.move(240, 400);
  await page.waitForTimeout(80);
  const after = PNG.sync.read(await page.screenshot({ clip, scale: 'css' }));
  const paintedColumns: number[] = [];
  for (let x = 0; x < after.width; x++) {
    for (let y = 0; y < after.height; y++) {
      const index = (y * after.width + x) * 4;
      if (before.data[index] - after.data[index] > 2) {
        paintedColumns.push(x);
        break;
      }
    }
  }
  expect(paintedColumns.length).toBeGreaterThan(125);
  const widestGap = Math.max(
    ...paintedColumns.slice(1).map((x, index) => x - paintedColumns[index]),
  );
  expect(widestGap).toBeLessThanOrEqual(3);
  expect(
    await page
      .locator('canvas')
      .evaluate((element) => getComputedStyle(element).filter),
  ).toBe('blur(0.75px)');
});
