import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

test('card corners extend on hover without moving the card', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'Touch devices do not have a hover treatment.');
  await page.goto('/');
  const card = page.locator('.project-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const bounds = await card.boundingBox();
  await expect
    .poll(() =>
      card.evaluate((element) => getComputedStyle(element, '::before').opacity),
    )
    .toBe('0');
  await card.hover();
  for (const corner of ['::before', '::after']) {
    await expect
      .poll(() =>
        card.evaluate(
          (element, pseudo) => getComputedStyle(element, pseudo).clipPath,
          corner,
        ),
      )
      .toBe('inset(0px)');
    const style = await card.evaluate((element, pseudo) => {
      const style = getComputedStyle(element, pseudo);
      return {
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
        top: style.borderTopWidth,
        right: style.borderRightWidth,
        bottom: style.borderBottomWidth,
        left: style.borderLeftWidth,
      };
    }, corner);
    expect(style).toEqual({
      opacity: '1',
      pointerEvents: 'none',
      top: corner === '::before' ? '2px' : '0px',
      right: corner === '::after' ? '2px' : '0px',
      bottom: corner === '::after' ? '2px' : '0px',
      left: corner === '::before' ? '2px' : '0px',
    });
  }
  expect(await card.boundingBox()).toEqual(bounds);
  await mkdir('.impeccable/review', { recursive: true });
  const image = PNG.sync.read(
    await card.screenshot({
      path: `.impeccable/review/card-hover-${testInfo.project.name}.png`,
      scale: 'css',
    }),
  );
  const hasAccent = (x: number, y: number) => {
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const pixel = ((y + dy) * image.width + x + dx) * 4;
        if (
          Math.abs(image.data[pixel] - 62) < 12 &&
          Math.abs(image.data[pixel + 1] - 89) < 12 &&
          Math.abs(image.data[pixel + 2] - 108) < 12
        )
          return true;
      }
    }
    return false;
  };
  expect(hasAccent(24, 0)).toBe(true);
  expect(hasAccent(0, 24)).toBe(true);
  expect(hasAccent(image.width - 27, image.height - 3)).toBe(true);
  expect(hasAccent(image.width - 3, image.height - 27)).toBe(true);
  expect(hasAccent(image.width - 27, 0)).toBe(false);
  expect(hasAccent(0, image.height - 27)).toBe(false);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      card.evaluate((element) => getComputedStyle(element, '::after').opacity),
    )
    .toBe('0');
});

test('keyboard focus highlights the corners without clipping the disclosure focus ring', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('.project-card').first();
  const summary = card.locator('summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await expect
    .poll(() =>
      card.evaluate((element) => getComputedStyle(element, '::before').opacity),
    )
    .toBe('1');
  expect(
    await summary.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe('solid');
  expect(
    await card
      .locator('details')
      .evaluate((element) => getComputedStyle(element).overflow),
  ).toBe('visible');
  await page.keyboard.press('Space');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect(card.locator('details')).not.toHaveAttribute('open');
  await expect(summary).toBeFocused();
});

test('notes animate in both directions while text stays at full contrast', async ({
  page,
}) => {
  await page.goto('/');
  const details = page.locator('details').first();
  for (const opening of [true, false]) {
    const samples = await details.evaluate((element) => {
      element.querySelector('summary')?.click();
      const panel = element.querySelector<HTMLElement>('.project-notes-panel');
      if (!panel) throw new Error('Missing project notes panel');
      const animation = panel.getAnimations()[0];
      if (!animation) throw new Error('Project notes did not animate');
      animation.pause();
      const duration = Number(animation.effect?.getTiming().duration);
      const values = [0, duration / 2, duration].map((time) => {
        animation.currentTime = time;
        return {
          height: panel.getBoundingClientRect().height,
          opacity: Number(getComputedStyle(panel).opacity),
          inert: panel.inert,
          cardHeight:
            element.closest('article')?.getBoundingClientRect().height ?? 0,
        };
      });
      animation.finish();
      return values;
    });
    const [start, middle, end] = opening ? samples : [...samples].reverse();
    expect(start.height).toBeCloseTo(0);
    expect(middle.height).toBeGreaterThan(start.height);
    expect(middle.height).toBeLessThan(end.height);
    expect(end.height).toBeGreaterThan(40);
    expect(samples.map((sample) => sample.opacity)).toEqual([1, 1, 1]);
    expect(samples.every((sample) => sample.inert === !opening)).toBe(true);
    expect(end.cardHeight).toBeGreaterThan(start.cardHeight);
    await expect(details).not.toHaveAttribute('data-animating');
    await expect(details.locator('.project-notes-panel')).toHaveJSProperty(
      'inert',
      false,
    );
    await expect(details.locator('summary')).toHaveAttribute(
      'aria-expanded',
      String(opening),
    );
    await expect(details.locator('.project-notes-panel')).toHaveAttribute(
      'aria-hidden',
      String(!opening),
    );
    if (opening) await expect(details).toHaveAttribute('open', '');
    else await expect(details).not.toHaveAttribute('open');
  }
});

test('rapid note toggles reverse without a jump or stale final state', async ({
  page,
}) => {
  await page.goto('/');
  const details = page.locator('details').first();
  const result = await details.evaluate((element) => {
    const summary = element.querySelector('summary');
    const panel = element.querySelector<HTMLElement>('.project-notes-panel');
    if (!summary || !panel) throw new Error('Missing project notes');
    summary.click();
    let animation = panel.getAnimations()[0];
    animation.pause();
    animation.currentTime = 80;
    const openingHeight = panel.getBoundingClientRect().height;
    summary.click();
    animation = panel.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const reversedHeight = panel.getBoundingClientRect().height;
    animation.currentTime = 60;
    const closingHeight = panel.getBoundingClientRect().height;
    summary.click();
    animation = panel.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const reopenedHeight = panel.getBoundingClientRect().height;
    animation.finish();
    return { openingHeight, reversedHeight, closingHeight, reopenedHeight };
  });
  expect(result.openingHeight).toBeGreaterThan(0);
  expect(result.reversedHeight).toBeCloseTo(result.openingHeight, 1);
  expect(result.closingHeight).toBeLessThan(result.openingHeight);
  expect(result.reopenedHeight).toBeCloseTo(result.closingHeight, 1);
  await expect(details).not.toHaveAttribute('data-animating');
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('summary')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await details.locator('summary').click();
  await expect(details).not.toHaveAttribute('open');
});

test('reduced motion settles corner and note states immediately, including live changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.locator('.project-card').first();
  const details = card.locator('details');
  const summary = details.locator('summary');
  await summary.click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details).not.toHaveAttribute('data-animating');
  expect(
    await card.evaluate(
      (element) => getComputedStyle(element, '::before').transitionDuration,
    ),
  ).toBe('0s');
  expect(
    await details
      .locator('.project-notes-panel')
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  await summary.click();
  await expect(details).not.toHaveAttribute('open');

  for (const opening of [true, false]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // WebKit delivers media-query changes on rendering updates.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    await summary.evaluate((element) => {
      element.click();
      element.parentElement
        ?.querySelector('.project-notes-panel')
        ?.getAnimations()[0]
        ?.pause();
    });
    await expect(details).toHaveAttribute('data-animating', '');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(details).not.toHaveAttribute('data-animating');
    await expect(summary).toHaveAttribute('aria-expanded', String(opening));
    if (opening) await expect(details).toHaveAttribute('open', '');
    else await expect(details).not.toHaveAttribute('open');
  }
});

test('notes remain independent and fit their content after resizing', async ({
  page,
  isMobile,
}, testInfo) => {
  await page.goto('/');
  const details = page.locator('details');
  if (isMobile) {
    const card = page.locator('.project-card').first();
    await card.tap({ position: { x: 30, y: 30 } });
    expect(
      await card.evaluate(
        (element) => getComputedStyle(element, '::before').opacity,
      ),
    ).toBe('0');
  }
  await details.nth(0).locator('summary').click();
  await details.nth(1).locator('summary').click();
  await expect(details.nth(0)).toHaveAttribute('open', '');
  await expect(details.nth(1)).toHaveAttribute('open', '');
  await expect(details.nth(2)).not.toHaveAttribute('open');
  await details.nth(2).evaluate((element) => {
    (element as HTMLDetailsElement).open = true;
  });
  await expect(details.nth(2).locator('summary')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await details.nth(2).evaluate((element) => {
    (element as HTMLDetailsElement).open = false;
  });
  await expect(details.nth(2).locator('summary')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-animating]')).toHaveCount(0);
  for (const width of [390, 900]) {
    await page.setViewportSize({ width, height: 844 });
    const sizes = await details.first().evaluate((element) => ({
      panel:
        element.querySelector('.project-notes-panel')?.getBoundingClientRect()
          .height ?? 0,
      content:
        element.querySelector('.project-notes-content')?.getBoundingClientRect()
          .height ?? 0,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    expect(sizes.panel).toBeCloseTo(sizes.content, 1);
    expect(sizes.panel).toBeGreaterThan(40);
    expect(sizes.overflow).toBe(false);
  }
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 1000 });
  await mkdir('.impeccable/review', { recursive: true });
  await page
    .locator('.project-card')
    .first()
    .screenshot({
      path: `.impeccable/review/card-notes-${testInfo.project.name}.png`,
    });
});
