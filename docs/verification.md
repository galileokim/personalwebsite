# Verification record

## Latest change

Removed the ink control and its storage preference, decorative captions, the standalone weekend section, and metaphorical headings and taglines. Hackathon facts remain under Education. Project descriptions and metadata use direct wording.

The rejected filament-only implementation was removed. The full WebGL fluid solver remains. Dye now tapers to a cursor point, and force acts backward in the trailing wake rather than at the leading tip. The trailing width parameter is now 7.2px, up from 4.8px, while the source tip remains at 0.25px. The 1.25px blur makes the result more diffused. Rotational strength remains 1.0 and pointer stirring remains reduced. Dye decay increased to 0.6 per second. A smooth idle fade reaches zero at 2.3 seconds, with buffer clearing and animation shutdown at 2.5 seconds instead of 6.5 seconds. Pressure, vorticity, and advection remain active.

## Results

`npm run check` passed:

- Biome lint and formatting.
- Strict application TypeScript check and production build.
- 19 unit tests for simulation bounds, source content, maximum-opacity text contrast, official Keyline stroke mappings, and the bounded, monotonic idle fade.
- 49 browser tests across desktop Chromium, desktop WebKit, and a touch-device Chromium viewport. Eleven device-inapplicable cases skip by design.
- Automated axe checks found no WCAG 2 A/AA or 2.1 AA violations with project notes closed or expanded. This is not a complete WCAG audit.
- No measured horizontal overflow at 320, 390, 600, 768, 1024, or 1440 CSS pixels, or at 390px with doubled root text size.
- A GPU fixture verifies smooth opacity increasing with density, without a darker edge rim. Maximum alpha remains 0.14.
- Pixel comparisons verify continuous fast strokes, visible ink during movement, and a fully clear canvas by 2.8 seconds after the last input.
- A straight-stroke probe verifies a softer nib narrower than the trailing body, a visibly fuller trail, and no painted pixels beyond the leading point in Chromium and WebKit. The nib-width allowance includes up to two pixels of blur per side.
- A separate test verifies fluid transport during the shorter visible interval by detecting pixels that become denser despite the fade. Fading alone cannot produce that change. The gesture and observation use animation-frame timing so software WebGL protocol latency does not stretch the gesture into seconds.

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
