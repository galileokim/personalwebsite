import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

const clip = { x: 40, y: 320, width: 228, height: 160 };

function darkened(before: PNG, after: PNG, x: number, y: number) {
  const index = (y * after.width + x) * 4;
  return before.data[index] - after.data[index] > 2;
}

test('the softened fluid nib stays narrow and leaves no leading wave', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Touch devices do not render ink.');
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-state', 'ready');
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator('canvas')
      .evaluate(
        (canvas: HTMLCanvasElement) => canvas.getContext('webgl2') !== null,
      ),
  ).toBe(true);
  const before = PNG.sync.read(await page.screenshot({ clip, scale: 'css' }));
  await page.mouse.move(70, 400);
  await page.mouse.move(210, 400);
  await page.waitForTimeout(100);
  const after = PNG.sync.read(await page.screenshot({ clip, scale: 'css' }));
  let leadingPixels = 0;
  let nibHeight = 0;
  let trailHeight = 0;
  for (let y = 0; y < after.height; y++) {
    for (let x = 174; x < after.width; x++) {
      if (darkened(before, after, x, y)) leadingPixels++;
    }
    if (darkened(before, after, 168, y)) nibHeight++;
    if (darkened(before, after, 140, y)) trailHeight++;
  }
  expect(leadingPixels).toBe(0);
  expect(nibHeight).toBeGreaterThan(0);
  // Rendered width includes up to two pixels of blur on each side.
  expect(nibHeight).toBeLessThanOrEqual(8);
  expect(trailHeight).toBeGreaterThan(nibHeight);
  expect(trailHeight).toBeGreaterThanOrEqual(8);
});

test('deposited ink continues to disperse through the fluid solver', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Touch devices do not render ink.');
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-state', 'ready');
  await page.evaluate(() => document.fonts.ready);
  const blank = PNG.sync.read(await page.screenshot({ clip, scale: 'css' }));
  // Keep the gesture short even when software WebGL makes browser-protocol round trips slow.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let step = 0;
        const move = () => {
          window.dispatchEvent(
            new PointerEvent('pointermove', {
              pointerType: 'mouse',
              clientX: 80 + step * 3.4,
              clientY: 400 + Math.sin(step * 0.16) * 35,
            }),
          );
          if (++step === 40) resolve();
          else requestAnimationFrame(move);
        };
        requestAnimationFrame(move);
      }),
  );
  const deposited = PNG.sync.read(
    await page.screenshot({ clip, scale: 'css' }),
  );
  // Observe dispersion before the shorter idle fade removes the trail.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0;
        const next = () => {
          if (++frames === 16) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
  );
  const dispersed = PNG.sync.read(
    await page.screenshot({ clip, scale: 'css' }),
  );
  // Fading only lightens pixels; darker pixels elsewhere demonstrate fluid transport.
  let redistributedPixels = 0;
  for (let index = 0; index < dispersed.data.length; index += 4) {
    const beforeInk = blank.data[index] - deposited.data[index];
    const afterInk = blank.data[index] - dispersed.data[index];
    if (afterInk > beforeInk + 1) redistributedPixels++;
  }
  expect(redistributedPixels).toBeGreaterThan(40);
});
