# Verification record

## Latest change

Removed the ink control and its storage preference, decorative captions, the standalone weekend section, and metaphorical headings and taglines. Hackathon facts remain under Education. Project descriptions and metadata use direct wording.

The rejected filament-only implementation was removed. The full WebGL fluid solver remains. Dye now tapers to a cursor point, and force acts backward in the trailing wake rather than at the leading tip. The trailing width parameter increased from 1.6px to 2.4px while the tip remained at 0.25px. Blanket blur was removed; pressure, vorticity, advection, and density-based shading remain.

## Results

`npm run check` passed:

- Biome lint and formatting.
- Strict application TypeScript check and production build.
- 16 unit tests for simulation bounds, source content, maximum-opacity text contrast, and official Keyline stroke mappings.
- 49 browser tests across desktop Chromium, desktop WebKit, and a touch-device Chromium viewport. Eleven device-inapplicable cases skip by design.
- Automated axe checks found no WCAG 2 A/AA or 2.1 AA violations with project notes closed or expanded. This is not a complete WCAG audit.
- No measured horizontal overflow at 320, 390, 600, 768, 1024, or 1440 CSS pixels, or at 390px with doubled root text size.
- A GPU fixture verifies smooth opacity increasing with density, without a darker edge rim. Maximum alpha remains 0.14.
- Pixel comparisons verify continuous fast strokes, visible ink during movement, and a clear canvas after inactivity.
- A straight-stroke probe verifies a narrow nib and no painted pixels beyond the leading point in Chromium and WebKit.
- A separate test verifies that ink continues to move into previously unpainted pixels after input stops. The gesture and observation use animation-frame timing so software WebGL protocol latency does not stretch the gesture into seconds.

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
