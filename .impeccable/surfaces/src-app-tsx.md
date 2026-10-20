---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css","src/components/InkCanvas.tsx","src/components/ProjectNotes.tsx"]
---

# Home surface

Target: `src/App.tsx`, `src/styles.css`, `src/components/InkCanvas.tsx`, `src/ink/`.
Visitor mode: Experience. A personal portfolio with a readable student biography and real project work.

## Direction contract

THESIS: An open canvas with a personal introduction and an index of work. The visitor's pointer makes transient ink, while the portfolio stays still and readable. No fabricated product screenshots or decorative dashboard.

OWN-WORLD: White and cool-grey ground, graphite type, opaque white project cards, quiet blue-grey link states. Manrope sets the résumé content with direct headings and factual copy. Ink is the only expressive moving material.

STORY: Meet Galileo as a UBC student; inspect four projects and their implementation notes; read work experience and extracurricular involvement; follow a real profile or email link.

FIRST VIEWPORT: A compact name/navigation row above a left-aligned introduction, a two-line student biography and profile links. Generous blank space allows the waterbrush to appear. The projects heading and current project begin within a typical desktop viewport. On mobile, navigation wraps intentionally and content stacks without a fixed header.

FORM: The user's pinned empty-canvas direction overrides the roll's assigned index 4 and catalog challengers. seed: none (unavailable). The launcher did not return a shareable seed reference. Ink disperses with pointer velocity, then fades. Requested card corners extend on hover or visible keyboard focus, not retained mouse focus, and project notes expand or collapse on activation. There are no page-load or scroll-reveal text animations. Code-led: this harness has no image-generation tool. ENERGY 1 / RHYTHM 2 / MOTION 2, with motion confined to the requested interaction.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints and defaults

The user's explicit implementation request proceeds on the confirmed brief. White/grey is binding; a dark theme would conflict with it. No invented project URLs or downloadable résumé. Use inline project disclosures rather than dead repository buttons. Never publish the résumé phone number until requested. Ink must not intercept pointer events, and it is disabled under reduced motion or coarse-pointer input. Do not add a site-level ink toggle, status label, or stored preference. Hide the decorative canvas silently if rendering fails. Keep the original wave-front fluid effect from commit `6bead2c`. Use its cursor-centered Gaussian brush, forward momentum, leading wave, 1px blur, and original dye decay with 6.5-second idle clearing. Do not retain the later protected nib, trailing-only force, or shortened idle fade. Do not substitute procedural ribbons or particles for fluid dynamics. No content depends on animation or WebGL. Use literal section headings: Projects, Work experience, Education & extracurriculars, and Contact. Keep hackathon facts within Education rather than a standalone themed section; remove decorative taglines and descriptions of the background.

## Reference evidence

The HTML and stylesheet at https://kdrag0n.dev/ were accessible: concise introduction, grouped project lists, direct contact links, and two expanding L-shaped border strokes on hovered cards. The requested corner interaction is adapted to this site's existing card radius and blue-grey accent, with keyboard-focus and reduced-motion support. Preserve the portfolio's own layout and identity. The supplied CodePen returned HTTP 403; the fluid renderer is an original implementation based on the user's description, not inspected or copied CodePen source.
