# Galileo Kim

A personal portfolio built with Vite, React, TypeScript, and Tailwind CSS. The site uses the supplied résumé for its projects, experience, education, and extracurricular content. An original WebGL fluid simulation leaves a subdued ink trail behind the content.

## Run locally

Use Node.js 24 or 26+. Node.js 22.18+ is also supported within the 22.x release line. CI uses Node.js 24.

```sh
npm ci
npm run dev
```

Open the URL Vite prints, normally `http://127.0.0.1:5173`.

## Verify

```sh
npx playwright install chromium webkit
npm run check
```

`check` runs formatting/lint checks, unit tests, a TypeScript-checked production build, and Playwright tests. Browser coverage includes desktop Chromium, desktop WebKit, and a touch-device Chromium viewport. On Linux, install browser system libraries with `npx playwright install --with-deps chromium webkit`.

Individual commands:

- `npm run lint`: Biome checks.
- `npm test`: renderer bounds, source content, and ink/text contrast tests.
- `npm run build`: type-check and build to `dist/`.
- `npm run test:e2e`: rebuild and test the production output.
- `npm run preview`: serve the production build locally.

Playwright saves desktop, mobile, WebKit, and active-ink captures under `.impeccable/review/`. That directory and browser reports are gitignored. The GitHub Actions workflow runs the same checks and retains the captures as artifacts; it has not been run remotely from this session.

## Edit content

- `src/data/portfolio.ts`: project descriptions, implementation notes, experience, skills, and public contact links.
- `src/App.tsx`: introduction, education, community work, hackathons, and section structure.
- `content/resume.md`: the original content reference. This file contains the supplied phone number; the public app does not.
- `PRODUCT.md`: confirmed product requirements and open decisions.
- `DESIGN.md`: the implemented visual system.
- `src/styles.css`: Tailwind theme, component styles, and responsive rules.

Project notes use native disclosures. There are no placeholder repository buttons, fictional screenshots, or links to a missing résumé PDF. Add individual project links when their real destinations are available.

## Ink behavior

`src/ink/fluid.ts` and `src/ink/shaders.ts` implement velocity advection, vorticity confinement, pressure projection, and dye advection. The renderer is an original implementation; no code was copied from the reference sites.

- Loads separately from the content bundle, only for a fine pointer with motion enabled.
- Preserves the normal cursor and never intercepts clicks or scrolling.
- Uses bounded texture sizes, pointer impulses, and simulation timesteps.
- Uses the original dye decay, clears its buffers after 6.5 seconds of inactivity, and stops when the document is hidden.
- Releases GPU resources and listeners when disabled or unmounted.
- Has no visible toggle or stored preference; the effect follows the input device and system motion settings.
- Disables the effect for reduced motion and primary coarse-pointer devices.
- Falls back to the same readable page if WebGL 2, float rendering, or the effect module is unavailable, or the graphics context is lost.

The fluid behavior follows commit `6bead2c`, before the wave-front-removal changes; only the display opacity is lower. Gaussian splats inject dye and forward momentum along the pointer path, producing the original leading wave and fluid dispersion. A 1px canvas blur restores its original softness. There is no protected nib, backward-only wake, or separate idle-opacity fade. Maximum opacity is 0.09, reduced from 0.14 without altering the fluid simulation. Unit tests calculate text contrast against the darkest resulting background. White project cards remain opaque.

## Build and hosting

Run `npm run build` and publish **only `dist/`** to a static host. No server, API credentials, or environment variables are required. Do not publish the repository root: it contains development documents and the source résumé.

A hosting provider and domain have not been selected. Add canonical URLs and a real social-preview image only once those details are known.

## References and assets

- [kdrag0n.dev](https://kdrag0n.dev/): inspiration for a concise introduction, grouped work, and direct contact links. Its HTML was inspected; its code and identity were not copied.
- [Yakudoo’s CodePen](https://codepen.io/Yakudoo/pen/bGOMJPw): the owner’s ink-waterbrush reference. It returned HTTP 403 in this environment, so the implementation follows the owner’s description rather than the pen’s source.
- Keyline Icons: rounded stroke components from `@keyline-icons/react`. Named imports bundle only the icons used. Keyline has no brand logos, so labeled GitHub and LinkedIn links use its GitBranch and IdBadge symbols. The MIT license ships at `public/licenses/keyline-icons.txt`.
- Manrope by the Manrope Project Authors: self-hosted through `@fontsource-variable/manrope`. The SIL Open Font License ships at `public/fonts/OFL-Manrope.txt` and in the built site.

No external fonts, trackers, stock images, or image-generation services are used. See `docs/verification.md` for verification evidence and review limits.
