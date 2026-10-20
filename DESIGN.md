---
name: Galileo Kim
description: Personal portfolio on an ink-waterbrush canvas
colors:
  paper: "#f7f8fa"
  surface: "#ffffff"
  ink: "#262b31"
  muted: "#56616d"
  line: "#e0e4e9"
  accent: "#3e596c"
  control: "#eceff2"
  control-hover: "#e1e7ec"
  control-text: "#4d5966"
  selection: "#d6e1e8"
typography:
  display:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "clamp(2.625rem, 6.5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.13
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "clamp(1.5rem, 2.3vw, 1.875rem)"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 550
rounded:
  focus: "3px"
  control: "8px"
  card: "14px"
spacing:
  tight: "0.5rem"
  related: "1rem"
  card-inset: "1.5rem"
  group: "2rem"
  section: "clamp(3rem, 6vw, 4.75rem)"
components:
  ink-toggle:
    backgroundColor: "{colors.control}"
    textColor: "{colors.control-text}"
    rounded: "{rounded.control}"
    padding: "0.4rem 0.75rem"
    typography: "{typography.label}"
  ink-toggle-hover:
    backgroundColor: "{colors.control-hover}"
  project-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  project-notes:
    textColor: "{colors.accent}"
    typography: "{typography.label}"
---

# Design System: Galileo Kim

## Overview

**Creative North Star: "An empty canvas and an ink waterbrush"**

Galileo supplied the canvas metaphor, white/grey ground, and requirement for the cursor effect to remain behind the content. The implementation uses graphite text, white project cards, and space between groups. Visitors make the ink move; the text stays still.

Manrope gives the résumé content a conversational voice through open letterforms and moderate weights. The interaction supplies the expression that would otherwise come from imagery. There are no invented portraits or project screenshots.

Key characteristics:
- White/grey ground with opaque content cards.
- Left-aligned type and a narrow reading column.
- Motion limited to the visitor's ink trail and control-state transitions.

## Colors

The palette stays close to grey. The blue-grey accent identifies links, focus, and the ink control without competing with the content.

Primary: `accent` supplies interactive emphasis. Neutrals: `paper` is the canvas, `surface` is the card, `ink` is primary text, `muted` is supporting text, and `line` separates groups. The control colors distinguish the ink toggle's resting and hover states. `selection` belongs to selected text.

Supporting text must remain readable over the darkest permitted ink. `tests/contrast.test.ts` reads the actual CSS and shader values and enforces a 4.5:1 minimum for primary, supporting, and accent text.

## Typography

The self-hosted Manrope variable font serves all roles. Display and section headings have tighter tracking; body copy uses normal tracking and a longer line-height. Dates use tabular numerals. Technology names are plain inline text rather than badges.

The frontmatter records the reusable type scale. The introduction also uses a larger lead paragraph; project titles range from the regular card title to a slightly larger title on the current project. Copy wraps naturally, including long titles at enlarged text sizes.

## Layout

The main column has a maximum width of 56rem. Narrow screens use 1.25rem side gutters; at 640px, gutters increase to 2.5rem. Below 420px, the header name and navigation stack. Navigation can wrap when text size increases.

Project cards stack their heading and description on narrow screens. At 640px, cards use two columns in a 1:1.65 ratio, and experience rows use a 1:2 ratio. The background and content stay in separate stacking layers. Education and community work form two columns from 768px.

Section separation is larger than spacing inside each group. Cards grow with their content; neither card heights nor text containers clip expanded notes. The header is not sticky, leaving mobile screen space for the content.

## Elevation & Depth

The system uses no box shadows. Opaque white cards with a single border sit above the ink canvas. A one-pixel blur softens the canvas itself; text and card surfaces do not use backdrop blur. The fixed canvas has no pointer events and sits below the content stacking layer.

## Shapes

Cards use the card radius; the ink toggle uses the smaller control radius. Focus rings use a small corner radius and remain outside the focused element. Other content sits on the page without containers. Icons use a consistent outline stroke and accompany text labels.

## Components

### Ink toggle

A labeled button with `aria-pressed`. It distinguishes on, off, loading, reduced-motion, touch, and unavailable states in text. It preserves its preference when storage is available and remains usable when storage is denied. Focus uses a two-pixel accent outline with a five-pixel offset.

### Project card and notes

Cards group one project's title, date, summary, technologies, and native disclosure. Opening project notes reveals the supplied technical details in place. The plus rotates into a close mark; the label changes with the state. Cards have no hover lift because the entire card is not a link.

### Navigation and links

The header links to real sections. Profile links include labels and an accessible new-tab indication. Email uses `mailto:`. Controls and standalone links have a minimum 44px height. Link underlines sit below the text rather than touching it.

### Ink canvas

The original WebGL simulation advects velocity and dye, adds vorticity, and projects pressure. Display alpha is bounded. It starts only on pointer movement, stops after inactivity or tab hiding, and clears when disabled. Reduced motion and primary coarse pointers disable it. A rendering failure leaves the content intact and labels the effect unavailable.

## Do's and Don'ts

- Do keep text and white cards more prominent than the ink.
- Do preserve normal cursor behavior, keyboard operation, and touch scrolling.
- Do test supporting text against the darkest ink, not just the blank canvas.
- Do use the existing type scale and let content determine height.
- Don't add a dark theme in conflict with the owner's white/grey brief.
- Don't make the background an autonomous animation or hide text behind an entrance effect.
- Don't add fabricated project imagery or nonfunctional project links.
