# Verification record

## Latest change

Removed the ink control and its storage preference, decorative captions, the standalone weekend section, and metaphorical headings and taglines. Hackathon facts remain under Education. Project descriptions and metadata use direct wording.

Restored the ink effect from commit `6bead2c`, before wave-front removal. The three renderer files (`fluid.ts`, `shaders.ts`, and `math.ts`) match that revision exactly. The original forward momentum, leading wave, dye decay, 1px blur, and 6.5-second idle clearing are restored. Current wording, Keyline icons, and the button-free integration are unchanged.

## Results

`npm run check` passed:

- Biome lint and formatting.
- Strict application TypeScript check and production build.
- 16 unit tests for simulation bounds, source content, maximum-opacity text contrast, and official Keyline stroke mappings.
- 49 browser tests across desktop Chromium, desktop WebKit, and a touch-device Chromium viewport. Eleven device-inapplicable cases skip by design.
- Automated axe checks found no WCAG 2 A/AA or 2.1 AA violations with project notes closed or expanded. This is not a complete WCAG audit.
- No measured horizontal overflow at 320, 390, 600, 768, 1024, or 1440 CSS pixels, or at 390px with doubled root text size.
- A GPU fixture verifies smooth opacity increasing with density, without a darker edge rim. Maximum alpha remains 0.14.
- Pixel comparisons verify continuous strokes, visible ink during movement, and a clear canvas after the original idle interval.
- A straight-stroke probe verifies that the original leading wave is present again in Chromium and WebKit.
- A separate test verifies continued fluid transport by detecting pixels that become denser despite dye decay. The gesture and observation use animation-frame timing so software WebGL protocol latency does not stretch the gesture into seconds.
- `git diff --exit-code 6bead2c -- src/ink/fluid.ts src/ink/shaders.ts src/ink/math.ts` passed, confirming exact restoration rather than an approximation.

## Interaction evidence

| Element or state | Result |
| --- | --- |
| Section navigation and back-to-top links | Reach the corresponding content |
| Four project disclosures | Open and close by pointer and keyboard |
| Skip link | Moves keyboard focus to main content; WebKit uses Option-Tab for links |
| GitHub and LinkedIn | Open the supplied destinations in new tabs; external responses were intercepted for the navigation test |
| Email links | Use the supplied mailto address; no message was sent |
| Removed ink control | No button or explanatory label remains |
| Obsolete storage preference | An old disabled value does not silently suppress the effect |
| Storage denied | The effect starts without accessing storage |
| Reduced motion | Disables ink and smooth scrolling; live preference changes are supported |
| Touch device | Ink remains inactive and section-link taps scroll normally |
| WebGL failure or context loss | Hides the decoration without interrupting content or adding an error message |
| Content layering | Canvas cannot intercept input; white cards remain opaque |
| Initial load | No page/console errors or third-party asset requests in the tested path |

## Review limits

Screenshots for desktop, mobile, WebKit, and active ink are saved in `.impeccable/review/`. Image viewing is unavailable in this session, so visual sign-off is not claimed. The review and documentation pass ran in-thread because no subagent tool is available.

The design detector reports advisory gaps between existing typography sizes and the compact DESIGN.md type ramp. Typography was not changed in this task, so that unrelated documentation reconciliation remains out of scope.

The supplied CodePen returned HTTP 403 during implementation. The renderer is original code based on the owner's description. No deployment or remote CI run has been performed.
