# Verification record

## Latest change

Project cards now reveal top-left and bottom-right corner strokes on hover or focus within, based on the inspected kdrag0n.dev stylesheet. Native project notes expand and collapse with interruptible height animations. Text stays fully opaque during the transition. Both interactions respect reduced motion; touch devices do not receive hover styling. Page content and the fluid renderer are unchanged.

Restored the ink effect from commit `6bead2c`, before wave-front removal. The simulation files (`fluid.ts` and `math.ts`) still match that revision exactly. The shader differs only in its display opacity multiplier, reduced from 0.14 to 0.09. The original forward momentum, leading wave, dye decay, 1px blur, and 6.5-second idle clearing are restored. Current wording, Keyline icons, and the button-free integration are unchanged.

## Results

`npm run check` passed:

- Biome lint and formatting.
- Strict application TypeScript check and production build.
- 16 unit tests for simulation bounds, source content, maximum-opacity text contrast, and official Keyline stroke mappings.
- 66 browser tests across desktop Chromium, desktop WebKit, and a touch-device Chromium viewport. Twelve device-inapplicable cases skip by design.
- Automated axe checks found no WCAG 2 A/AA or 2.1 AA violations with project notes closed or expanded. This is not a complete WCAG audit.
- No measured horizontal overflow at 320, 390, 600, 768, 1024, or 1440 CSS pixels, or at 390px with doubled root text size.
- Hover screenshots contain accent pixels on both arms of the top-left and bottom-right corners, with no accent at the opposite corners. Card bounds do not move on hover.
- Animation timeline probes verify intermediate heights in both directions while text opacity remains 1. Repeated clicks reverse from the current height; open notes fit their content after resizing.
- Keyboard tests preserve focus rings, expanded states, and native details toggling. Closing content is temporarily inert; the attribute clears once the native disclosure closes.
- Reduced-motion tests verify immediate transitions and cancellation when the preference changes during an animation.
- A GPU fixture verifies smooth opacity increasing with density, without a darker edge rim. Maximum alpha is 0.09.
- Pixel comparisons verify continuous strokes, visible ink during movement, and a clear canvas after the original idle interval.
- A straight-stroke probe verifies that the original leading wave is present again in Chromium and WebKit.
- A separate test verifies continued fluid transport by detecting pixels that become denser despite dye decay. The gesture and observation use animation-frame timing so software WebGL protocol latency does not stretch the gesture into seconds.
- Source comparison confirms the original simulation is unchanged and the only renderer modification is the display-opacity constant.

## Interaction evidence

| Element or state | Result |
| --- | --- |
| Section navigation and back-to-top links | Reach the corresponding content |
| Project card corners | Extend on hover or keyboard focus without moving the card or intercepting input |
| Four project disclosures | Animate open and closed by pointer and keyboard; rapid toggles reverse without a height jump |
| Expanded notes | Resize to their content without clipping or horizontal overflow |
| Skip link | Moves keyboard focus to main content; WebKit uses Option-Tab for links |
| GitHub and LinkedIn | Open the supplied destinations in new tabs; external responses were intercepted for the navigation test |
| Email links | Use the supplied mailto address; no message was sent |
| Removed ink control | No button or explanatory label remains |
| Obsolete storage preference | An old disabled value does not silently suppress the effect |
| Storage denied | The effect starts without accessing storage |
| Reduced motion | Disables ink, smooth scrolling, and corner/disclosure motion; live changes settle pending animations |
| Touch device | Ink remains inactive and section-link taps scroll normally |
| WebGL failure or context loss | Hides the decoration without interrupting content or adding an error message |
| Content layering | Canvas cannot intercept input; white cards remain opaque |
| Initial load | No page/console errors or third-party asset requests in the tested path |

## Scoped delivery checks

- PASS, interaction purpose: corner strokes reproduce the requested hover feedback; note-height animation explains expansion and collapse without moving the card on hover.
- PASS, accessibility: pointer and keyboard disclosures, visible focus, full text opacity, and live reduced-motion behavior pass in Chromium and WebKit. Axe reports no violations in settled states.
- PASS, responsive layout: expanded panels fit their content after resizing; existing narrow-screen and enlarged-text overflow checks pass.
- PASS, content and direction: no résumé data, links, ink parameters, type styles, or palette values changed. The existing ENERGY 1 / RHYTHM 2 / MOTION 2 direction is retained.
- PASS, implementation: lint, TypeScript, production build, 16 unit tests, and 66 browser tests pass. The interaction table above records the exercised controls.

## Review limits

Screenshots for desktop, mobile, WebKit, active ink, hovered cards, and expanded notes are saved in `.impeccable/review/`. Image viewing is unavailable in this session, so visual sign-off is not claimed. The review and documentation pass ran in-thread because no subagent tool is available.

The design detector reports advisory gaps between existing typography sizes and the compact DESIGN.md type ramp. Typography was not changed in this task, so that unrelated documentation reconciliation remains out of scope.

The supplied CodePen returned HTTP 403 during implementation. The renderer is original code based on the owner's description. No deployment or remote CI run has been performed.
