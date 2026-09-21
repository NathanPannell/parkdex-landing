---
name: Parkdex
description: A paper field guide for Vancouver Island adventures.
colors:
  paper: "#f1f0e8"
  paper-bright: "#fbfaf4"
  paper-deep: "#e6e8dd"
  ink: "#142d27"
  secondary: "#40594e"
  muted: "#546359"
  accent: "#b8f53d"
  accent-ink: "#142d27"
  accent-hover: "#a6e22d"
  rule: "#b7c1b0"
  focus: "#246b56"
  error: "#a12c24"
  success: "#216246"
  transparent: "transparent"
  device-shell: "#35413e"
  device-edge: "#77817a"
  device-bezel: "#101917"
  device-base: "#2c3835"
  shadow: "rgb(20 45 39 / 24%)"
  backdrop: "rgb(13 28 23 / 82%)"
typography:
  display:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(3.4rem, 11vw, 5.4rem)"
    fontWeight: 780
    lineHeight: 0.98
    letterSpacing: "-.04em"
  title:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 720
    letterSpacing: "-.02em"
  body:
    fontFamily: "Ysabeau Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Ysabeau Variable, sans-serif"
    fontSize: ".9rem"
    fontWeight: 650
  hand:
    fontFamily: "Caveat Variable, cursive"
    fontSize: "1.45rem"
rounded:
  field: "5px"
  disclosure: "6px"
  dialog: "12px"
  circle: "50%"
spacing:
  xs: ".5rem"
  sm: ".75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "4rem"
  gutter: "clamp(1.25rem, 4.4vw, 5rem)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.field}"
    padding: ".8rem 1.1rem"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  input-email:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: ".8rem 1rem"
    height: "54px"
  button-preview:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.ink}"
    padding: "0"
    height: "44px"
  button-dialog-close:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    width: "44px"
    height: "44px"
---

# Design System: Parkdex

## Overview

**Creative North Star: "The Open Field Guide"**

Parkdex feels like a useful, personal field guide laid on a lightly textured paper desk. Dense green ink and a candid, heavy headline hold the page together; electric lime behaves like a single marker stroke, not an all-over theme. Real app captures supply the detail and proof.

The design draws its type, paper, handwriting, and material restraint from Nathan's portfolio. Screens sit in legible, neutral matte hardware. The composition stays compact on desktop, then allows a natural vertical reading order on smaller screens. Its few actions are direct and calm, with visible focus and form feedback.

**Key Characteristics:**

- Paper and ink carry the surface; lime marks the action and one phrase.
- Bold, tightly spaced display type pairs with readable, warmer body type and occasional handwriting.
- Real screenshots remain crisp and large enough to inspect, inside restrained matte devices.
- Thin rules and tonal paper changes organize space; overlays appear only for deliberate inspection.

## Colors

The palette is warm paper against deep coastal green, with one bright lime accent.

### Primary

- **Field Marker** (`accent`): The highlighted word, brand mark, primary waitlist button, and selection. Its darker hover variant (`accent-hover`) is limited to precise-pointer interaction.
- **Green Ink** (`ink`, also `accent-ink`): Headlines, controls, brand trees, and copy on lime.

### Neutral

- **Field Paper** (`paper`): The page and screenshot dialog, under a low-opacity paper texture.
- **Fresh Paper** (`paper-bright`): Input, close control, active screenshot tab, and disclosure panel.
- **Pressed Paper** (`paper-deep`): Screenshot viewer image well.
- **Secondary Ink** (`secondary`): Explanatory copy, release note, and disclosure text.
- **Quiet Ink** (`muted`): Supporting labels, placeholder, status text, and footer metadata.
- **Pencil Rule** (`rule`): Hairline dividers, field border, and close control outline.
- **Matte Hardware** (`device-shell`, `device-edge`, `device-bezel`, `device-base`): Chassis, light-facing rim, black screen recess, and laptop foot. These colors belong to device mockups, not generic cards.
- **Screen Shade** (`shadow`, `backdrop`): The soft device shadow and modal scrim.

### State Colors

- **Focus Green** (`focus`): Visible keyboard outline and text caret.
- **Error Red** (`error`): Invalid field border and actionable failure text.
- **Success Green** (`success`): Saved email feedback and field border.
- **Clear** (`transparent`): Link-like and screenshot controls that preserve the paper surface.

**The One Marker Rule.** Keep lime scarce. It identifies a key phrase or action while green ink and paper do the rest.

## Typography

**Display Font:** Strichpunkt Sans Variable, with sans-serif fallback.
**Body Font:** Ysabeau Variable, with sans-serif fallback.
**Handwritten Font:** Caveat Variable, with cursive fallback.

**Character:** The compressed, confident display face gives the field guide its personality. Ysabeau carries the practical instructions and explanatory copy. Caveat reads like a small human annotation, never a substitute for core information.

### Hierarchy

- **Display** (780, fluid on mobile, .98 line-height, tight tracking): Hero headline. At tablet width it settles at 5.8rem; at desktop it follows a viewport clamp, with a smaller cap in short desktop viewports.
- **Title** (720, 1rem, tight tracking): Android waitlist heading. Dialog titles scale from 1.25rem to 1.6rem.
- **Body** (regular, 1.125rem base, 1.5 line-height): Reading text. The lede is capped at 40ch, and increases to 1.3rem at tablet width.
- **Label** (650, .9rem): Explicit form label. Utility links and preview actions are around .95rem with clear underlines or action affordances.
- **Hand** (1.45rem mobile, larger at tablet): A rotated screenshot annotation and a short founder sign-off.

**The Human Annotation Rule.** Handwriting adds a personal aside around actual product content; it does not carry form labels, navigation, or essential instructions.

## Layout

The page has a centered maximum width of 1800px and a fluid horizontal gutter (`gutter`). Its masthead and footer are separated by thin rules. The main area starts in document order as introduction, waitlist, then showcase, so a narrow phone reads the message and signup before the device images. At 64rem it becomes a two-column spread: introduction and signup on the left, screenshot composition on the right. At 85rem the showcase receives a little more width. The desktop page uses at least one small viewport height and centers the spread between masthead and footer; short desktop heights compress heading and vertical spacing rather than clipping content.

The compact spacing vocabulary runs from `xs` through `2xl`. The email field and action form a single row from 25rem; below that they stack. At 40rem type, device space, masthead, and footer expand. At 22rem and below the wordmark and app link contract without shrinking the targets. Mobile may scroll so text, controls, and screenshot details retain legibility.

The three screenshot controls overlap in a deliberate visual stack: a broad laptop map behind two portrait phone captures. Relative sizing, rotations, and z-order create the spread. Do not apply this exact composition to unrelated surfaces; preserve its content-first approach and legible device silhouette when using hardware elsewhere.

## Elevation & Depth

The paper page is almost flat. Grain is a fixed, low-opacity image layer, while thin dividers and three nearby paper tones create separation. Device shadows give the mockups physical weight. The screenshot dialog uses a dark green scrim and a pressed-paper image well. Generic content has no card shadow.

### Shadow Vocabulary

- **Laptop contact** (`0 12px 28px var(--color-shadow)`): A soft shadow under matte laptop hardware.
- **Phone contact** (`0 14px 26px var(--color-shadow)`): A similar small-device shadow.
- **Inspection scrim** (`var(--color-backdrop)`): Behind the native screenshot dialog.

**The Matte Hardware Rule.** Preserve a dark chassis and distinct bezel at the smallest shipped size. A light-facing edge can define the silhouette; decorative chrome gradients are outside this material language.

## Shapes

The page is rectilinear and gently practical. Fields, tabs, and image wells use a small 5px corner; disclosure uses 6px; the dialog uses 12px; its close control is circular. Device radii are proportional to their screen dimensions and follow the hardware silhouette, with a subtle laptop hinge/base. Borders are usually one-pixel pencil rules. The hero underline is an irregular, slightly rotated lime stroke, not a pill or a badge.

## Components

### Buttons

- **Primary:** A 54px high lime waitlist action with green display lettering, 5px corners, and compact horizontal padding. It darkens on hover only when the pointer supports hover, presses down 1px on active, and shows a 3px focus outline at a 4px offset.
- **Text actions:** Screenshot choices are underlined, transparent, 44px minimum-height controls. Hover strengthens underline weight for precise pointers.
- **Dialog close:** A 44px circular fresh-paper control with a one-pixel rule and visible focus outline.

### Inputs / Fields

The email field has a visible label, 54px height, fresh-paper fill, 1px rule, and 5px corners. Placeholder text is quiet ink. Focus uses the shared 3px green outline. Invalid and successful submissions change the field border and adjacent message to their respective state colors. Loading reduces button emphasis and the form communicates progress; a successful button becomes disabled.

### Navigation

The masthead pairs a bold wordmark and lime tree mark with an underlined external app link. Both remain direct links. There is no hidden mobile menu. Keyboard focus is prominent, and precise-pointer hover strengthens underlines.

### Screenshot Devices and Viewer

Real map, park, and visited captures sit in the laptop and two phones. Each device itself is a button, with a matching text control beneath the composition. Either path opens the same native dialog, where three manually selected tabs switch title, description, image, dimensions, alt text, and pressed state. The active tab has a pencil border and fresh-paper fill. The modal can be closed through its visible control or the outside area. There is no automatic cycling.

### Footer Disclosure

The privacy explanation uses native `details` and `summary`. On narrow screens it stays in flow; from 40rem it opens as a fresh-paper panel above the footer, with a thin rule and small radius.

**The Direct Interaction Rule.** Product previews change only on a visitor's action. Preserve semantic controls, 44px touch targets, visible keyboard focus, and reduced-motion behavior.

## Do's and Don'ts

### Do:

- **Do** use real Parkdex captures at legible sizes and retain the matte chassis around any device mockup.
- **Do** let paper, ink, rules, and spacing establish hierarchy before adding color or shadow.
- **Do** keep the handwritten voice to short personal annotations and the practical copy in Ysabeau.
- **Do** preserve explicit validation, loading, network error, success, and focus states for signup.

### Don't:

- **Don't** spread the lime accent across whole panels or replace the device shell with brand color.
- **Don't** invent polished chrome, detailed branded hardware, or a decorative gradient around screenshots.
- **Don't** auto-advance app captures or make core content depend on animation.
- **Don't** clip a narrow viewport merely to force a one-screen layout.
