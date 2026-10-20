import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

const reviewDirectory = '.impeccable/review';

test('loads real content without runtime errors or third-party assets', async ({
  page,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (
      request.url().startsWith('http') &&
      !request.url().startsWith('http://127.0.0.1:4173')
    )
      external.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Hi, I’m Galileo.',
  );
  for (const name of [
    'Social Time Tracker',
    'ExerciseLogger',
    'Mailsweep',
    'SuadeAI',
    'University of British Columbia',
    'Apple',
  ]) {
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText('GPA: 92.7%')).toBeVisible();
  await expect(
    page.getByText('CSSS Rube Goldberg Track', { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator('body')).not.toContainText('780-297-6928');
});

test('all section links navigate to their content', async ({ page }) => {
  await page.goto('/');
  for (const [label, id] of [
    ['Projects', 'projects'],
    ['Experience', 'experience'],
    ['About', 'about'],
    ['Contact', 'contact'],
  ]) {
    await page
      .getByRole('navigation')
      .getByRole('link', { name: label })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.getByRole('link', { name: 'Back to top', exact: true }).click();
  await expect(page.locator('#intro-title')).toBeInViewport();
  await page.getByRole('link', { name: 'Galileo Kim, back to top' }).click();
  await expect(page).toHaveURL(/#top$/);
});

test('project notes open and close without leaving the page', async ({
  page,
}) => {
  await page.goto('/');
  for (const details of await page.locator('details').all()) {
    const summary = details.locator('summary');
    await summary.click();
    await expect(details).toHaveAttribute('open', '');
    await expect(details.locator('li').first()).toBeVisible();
    await summary.click();
    await expect(details).not.toHaveAttribute('open', '');
  }
});

test('profile links use the supplied destinations and email works as a mailto link', async ({
  page,
  context,
}) => {
  await page.goto('/');
  for (const [label, url] of [
    ['GitHub', 'https://github.com/galileokim'],
    ['LinkedIn', 'https://www.linkedin.com/in/galileo-kim-09a76b288/'],
  ]) {
    await context.route(url, (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<title>External destination</title>',
      }),
    );
    const popupPromise = page.waitForEvent('popup');
    await page
      .getByRole('link', { name: `${label} (opens in a new tab)` })
      .click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(url);
    await popup.close();
  }
  for (const link of await page.locator('a[href^="mailto:"]').all()) {
    await expect(link).toHaveAttribute(
      'href',
      'mailto:galileokim451@gmail.com',
    );
    await link.click();
  }
});

test('skip link, keyboard disclosure, and focus indicators work', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  // WebKit follows macOS's Option-Tab convention for focusing links.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const summary = page.locator('summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  const focus = await summary.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  );
  expect(focus).toBe('solid');
  await page.keyboard.press('Space');
  await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
});

test('ink preference persists and is operable by keyboard', async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    'The touch layout intentionally disables the cursor effect.',
  );
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
  ).toHaveText('Ink on');
  const toggle = page.getByRole('button', {
    name: 'Turn off the ink cursor trail',
  });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: 'Turn on the ink cursor trail' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('canvas')).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Turn on the ink cursor trail' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Turn on the ink cursor trail' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
  ).toHaveText('Ink on');
});

test('reduced motion disables ink, including live preference changes', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /reduced-motion preference/ }),
  ).toBeDisabled();
  await expect(page.locator('canvas')).toBeHidden();
  expect(
    await page
      .locator('html')
      .evaluate((element) => getComputedStyle(element).scrollBehavior),
  ).toBe('auto');
  if (!isMobile) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(
      page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
    ).toHaveText('Ink on');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('canvas')).toBeHidden();
  }
});

test('touch scrolling works without starting a fluid context', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Tests the coarse-pointer path.');
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /Touch scrolling/ }),
  ).toBeDisabled();
  await expect(page.locator('canvas')).toBeHidden();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Contact' })
    .tap();
  await expect(page.locator('#contact')).toBeInViewport();
});

test('a WebGL failure preserves content and explains the disabled effect', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Touch devices do not initialize WebGL.');
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      if (args[0] === 'webgl2') return null;
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /could not start the ink effect/ }),
  ).toBeDisabled();
  await expect(page.locator('canvas')).toBeHidden();
  await page.locator('summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
});

test('context loss disables the effect without breaking the page', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Touch devices do not initialize WebGL.');
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
  ).toHaveText('Ink on');
  await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    canvas
      .getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
  });
  await expect(
    page.getByRole('button', { name: /could not start the ink effect/ }),
  ).toBeDisabled();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('storage restrictions do not break the ink toggle', async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    'The touch layout intentionally disables the cursor effect.',
  );
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage denied', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage denied', 'SecurityError');
    };
  });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
  ).toHaveText('Ink on');
  await page
    .getByRole('button', { name: 'Turn off the ink cursor trail' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Turn on the ink cursor trail' }),
  ).toBeVisible();
});

test('layout reflows across widths and enlarged text without overflow', async ({
  page,
}) => {
  await page.goto('/');
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        (expectedWidth) =>
          document.documentElement.scrollWidth <= expectedWidth,
        width,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= 390),
    'overflow with enlarged text',
  ).toBe(true);
});

test('passes automated accessibility checks with notes open and closed', async ({
  page,
}) => {
  await page.goto('/');
  for (const expanded of [false, true]) {
    if (expanded)
      for (const summary of await page.locator('summary').all())
        await summary.click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test('pointer movement paints actual pixels behind the content', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(
    isMobile,
    'The touch layout intentionally disables the cursor effect.',
  );
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Turn off the ink cursor trail' }),
  ).toHaveText('Ink on');
  await page.evaluate(() => document.fonts.ready);
  const clip = { x: 40, y: 160, width: 200, height: 400 };
  const before = PNG.sync.read(await page.screenshot({ clip }));
  for (let step = 0; step < 50; step++) {
    await page.mouse.move(140 + Math.sin(step * 0.2) * 70, 220 + step * 5);
    await page.waitForTimeout(12);
  }
  const after = PNG.sync.read(await page.screenshot({ clip }));
  let changed = 0;
  for (let index = 0; index < after.data.length; index += 4) {
    if (before.data[index] - after.data[index] > 2) changed++;
  }
  expect(changed).toBeGreaterThan(500);
  expect(
    await page
      .locator('canvas')
      .evaluate((element) => getComputedStyle(element).pointerEvents),
  ).toBe('none');
  expect(
    await page
      .locator('.project-card')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(255, 255, 255)');
  await mkdir(reviewDirectory, { recursive: true });
  await page.screenshot({
    path: `${reviewDirectory}/ink-${testInfo.project.name}.png`,
  });
  await page.waitForTimeout(7000);
  const faded = PNG.sync.read(await page.screenshot({ clip }));
  let remaining = 0;
  for (let index = 0; index < faded.data.length; index += 4) {
    if (before.data[index] - faded.data[index] > 2) remaining++;
  }
  expect(remaining).toBe(0);
});

test('captures the complete desktop and mobile surfaces', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await mkdir(reviewDirectory, { recursive: true });
  await page.screenshot({
    path: `${reviewDirectory}/${testInfo.project.name}.png`,
    fullPage: true,
  });
});
