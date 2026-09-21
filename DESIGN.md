---
name: Parkdex
description: A real Vancouver Island landscape opens a paper field guide.
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
  hero-text: "#fff8ec"
  hero-soft: "rgb(255 248 236 / 82%)"
  hero-scrim: "rgb(9 32 27 / 56%)"
  hero-scrim-soft: "rgb(9 32 27 / 10%)"
  shade-28: "rgb(9 32 27 / 28%)"
  shade-30: "rgb(9 32 27 / 30%)"
  shade-38: "rgb(9 32 27 / 38%)"
  shade-40: "rgb(9 32 27 / 40%)"
  shade-44: "rgb(9 32 27 / 44%)"
  shade-48: "rgb(9 32 27 / 48%)"
typography:
  display:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(2.05rem, 10.4vw, 2.65rem)"
    fontWeight: 780
    lineHeight: 0.94
    letterSpacing: "-.04em"
  title:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "1.12rem"
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
    fontSize: "1.6rem"
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
  button-hero-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.field}"
    padding: ".72rem 1rem"
  button-hero-secondary:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.hero-text}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
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
    rounded: "{rounded.field}"
    padding: ".5rem .65rem"
  button-dialog-close:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    height: "44px"
---

# Design System: Parkdex

## Overview

**Creative North Star: "Vancouver Island, Before the Scroll"**

Parkdex opens with a real East Sooke landscape. Warm off-white type, a sparing lime action, and an immediately visible matte phone make the island and the product clear in the first viewport. Transparent coastal shading supports legibility while leaving the photograph recognizable. There is no masthead divider or opaque wash over the scene.

The second section returns to the portfolio-derived paper field guide: green ink, bold Strichpunkt type, Ysabeau body copy, a short Caveat sign-off, and real app screenshots in restrained matte hardware. The hero action leads to the full Android waitlist below. Screenshot inspection remains manual and direct, with visible focus and form feedback.

**Key Characteristics:**

- A real Vancouver Island photograph is the opening surface, including behind the masthead.
- Warm photo text and one lime action lead to a recognizable badge phone before scrolling.
- Paper and green ink carry the gallery, waitlist, and footer below.
- Real screenshots remain legible inside restrained matte devices and a manual viewer.

## Colors

The palette moves from a naturally colored coastal photograph with warm white copy to warm paper and deep coastal green below. Lime remains the one vivid marker.

### Primary

- **Field Marker** (`accent`): The highlighted hero word, brand mark, hero anchor, waitlist button, and selection. Its darker hover variant (`accent-hover`) is limited to precise-pointer interaction.
- **Green Ink** (`ink`, also `accent-ink`): Paper-section headlines, controls, brand trees, and copy on lime.

### Neutral

- **Field Paper** (`paper`): The page and screenshot dialog, under a low-opacity paper texture.
- **Fresh Paper** (`paper-bright`): Input, close control, active screenshot tab, and disclosure panel.
- **Pressed Paper** (`paper-deep`): Screenshot viewer image well.
- **Secondary Ink** (`secondary`): Explanatory copy, release note, and disclosure text.
- **Quiet Ink** (`muted`): Supporting labels, placeholder, status text, and footer metadata.
- **Pencil Rule** (`rule`): Hairline dividers, field border, and close control outline.
- **Matte Hardware** (`device-shell`, `device-edge`, `device-bezel`, `device-base`): Chassis, light-facing rim, black screen recess, and laptop foot. These colors belong to device mockups, not generic cards.
- **Screen Shade** (`shadow`, `backdrop`): The soft device shadow and modal scrim.

### Photographic Overlay

- **Warm Photo Text** (`hero-text`, `hero-soft`): Main hero lettering and quieter supporting copy over the landscape.
- **Coastal Scrim** (`hero-scrim`, `hero-scrim-soft`, `shade-28`, `shade-30`, `shade-38`, `shade-40`, `shade-44`, `shade-48`): Transparent green-dark values used in directional overlays and small text or hardware shadows. The photograph remains the base surface.

### State Colors

- **Focus Green** (`focus`): Visible keyboard outline and text caret.
- **Error Red** (`error`): Invalid field border and actionable failure text.
- **Success Green** (`success`): Saved email feedback and field border.
- **Clear** (`transparent`): Link-like and screenshot controls that preserve the paper surface.

**The One Marker Rule.** Keep lime scarce. It identifies a key phrase or action while the landscape, green ink, and paper do the rest.

**The Clear Landscape Rule.** Darken the real photograph only enough to read the text. Preserve the image and its crop as the opening material.

## Typography

**Display Font:** Strichpunkt Sans Variable, with sans-serif fallback.
**Body Font:** Ysabeau Variable, with sans-serif fallback.
**Handwritten Font:** Caveat Variable, with cursive fallback.

**Character:** The compressed, confident display face gives the field guide its personality. Ysabeau carries the practical instructions and explanatory copy. Caveat reads like a small human annotation, never a substitute for core information.

### Hierarchy

- **Display** (780, mobile clamp from 2.05rem to 2.65rem, .94 line-height, tight tracking): Warm-white hero headline. It scales to 5.8rem at tablet widths and up to 6rem at desktop. The line grouping compresses on phones so the phone and CTA fit with the photograph.
- **Section headline** (780, clamp from 2.1rem to 3.5rem, .98 line-height): Green-ink introduction to the paper field-guide section.
- **Title** (720, 1.12rem, tight tracking): Android waitlist and gallery headings. Dialog titles scale from 1.25rem to 1.6rem.
- **Body** (regular, 1.125rem base): Reading text. The hero lede starts at 1rem with a 34ch maximum and short line-height; the paper-section introduction can reach 1.3rem and 65ch.
- **Label** (650, .9rem): Explicit form label. Utility links and preview actions are around .95rem with clear underlines or action affordances.
- **Hand** (1.6rem): The short founder sign-off below the paper section.

**The Human Annotation Rule.** Handwriting adds a personal aside around actual product content; it does not carry form labels, navigation, or essential instructions.

## Layout

The page has a centered maximum width of 1800px and a fluid horizontal gutter (`gutter`). The photographic hero fills at least one small viewport height, with a 700px floor on larger screens. Its transparent masthead sits directly on the photo. On phones, headline, lede, action, and one badge phone stack within the opening. At 64rem the hero becomes a two-column composition with copy at left and the phone at right. The hero image uses responsive source assets and an `object-fit: cover` crop; its crop, shading, copy, phone, and section transition must be assessed together.

The paper field-guide section follows the hero. Its introduction leads into a waitlist and screenshot gallery. At 64rem these form two columns, with the gallery wider; on phones they stack and may scroll. The compact spacing vocabulary runs from `xs` through `2xl`. The email field and submit action form a single row from 25rem; below that they stack. At 40rem type, device space, masthead, and footer expand. At 22rem and below the wordmark and app link contract without shrinking the targets.

The gallery overlaps a broad laptop map and two portrait phones in a 1.45-ratio stage, changing to 1.05 on phones. Five manual screenshot choices begin 1rem below it. At desktop, those choices share a five-column row; at tablet they use three columns, and on small screens they wrap in an adaptive grid. The hero phone remains separate, immediate product proof. Do not promote these exact page placements into a system-wide template. Preserve the content-first approach and legible device silhouette when using hardware elsewhere.

## Elevation & Depth

The hero uses the actual East Sooke image as its surface, with transparent directional dark overlays for readable copy and a light phone shadow for separation. The paper section is almost flat: low-opacity grain, thin dividers, and three nearby paper tones organize it. Gallery device shadows give mockups physical weight. The screenshot dialog uses a dark green scrim and a pressed-paper image well. Generic content has no card shadow.

### Shadow Vocabulary

- **Laptop contact** (`0 12px 28px var(--color-shadow)`): A soft shadow under matte laptop hardware.
- **Phone contact** (`0 14px 26px var(--color-shadow)`): A similar small-device shadow.
- **Hero phone contact** (`0 18px 34px var(--color-shade-40)`): Separation from the landscape without altering the phone's matte base.
- **Inspection scrim** (`var(--color-backdrop)`): Behind the native screenshot dialog.

**The Matte Hardware Rule.** Preserve a dark chassis and distinct bezel at the smallest shipped size. A light-facing edge can define the silhouette; decorative chrome gradients are outside this material language.

## Shapes

The hero has no visible frame or masthead rule; the photograph runs edge to edge within the site shell. Fields, actions, gallery choices, tabs, and image wells use a small 5px corner; disclosure uses 6px; the dialog uses 12px; its close control is circular. Device radii are proportional to their screen dimensions and follow the hardware silhouette, with a subtle laptop hinge/base. Paper-section borders are usually one-pixel pencil rules. The hero underline is an irregular, slightly rotated lime stroke, not a pill or a badge.

## Components

### Buttons

- **Hero primary:** A 44px minimum-height lime anchor with green display lettering and 5px corners. It scrolls to the waitlist below and becomes full-width up to 18rem on small phones.
- **Waitlist primary:** A 54px high lime submit action with green display lettering, 5px corners, and compact horizontal padding. Both lime actions darken on precise-pointer hover and press down 1px on active.
- **Hero secondary:** A warm-white underlined anchor to the paper section. It keeps a 44px target and sits below the primary action on phones.
- **Gallery choices:** Five paper-surface buttons, each at least 44px high, with a one-pixel pencil border, small corners, left-aligned labels, and a right-aligned expand icon. On hover they take a fresh-paper fill.
- **Dialog close:** A 44px circular fresh-paper control with a one-pixel rule and visible focus outline.

### Inputs / Fields

The email field has a visible label, 54px height, fresh-paper fill, 1px rule, and 5px corners. Placeholder text is quiet ink. Focus uses the shared 3px green outline. Invalid and successful submissions change the field border and adjacent message to their respective state colors. Loading reduces button emphasis and the form communicates progress; a successful button becomes disabled.

### Navigation

The transparent masthead sits on the photograph, pairing a warm-white bold wordmark and lime tree mark with a warm-white external app link. Both remain direct links. There is no divider or hidden mobile menu. Keyboard focus is prominent, and precise-pointer hover strengthens underlines.

### Screenshot Devices and Viewer

The hero phone shows a real River Otter badge reward and opens the native screenshot viewer. Below, a full-island map, park search, and badge reward appear in the laptop and two gallery phones. Five choices also expose the wishlist detail and island progress captures. Device and choice controls open the same native dialog, where five manual tabs switch title, description, image, dimensions, alt text, and pressed state. The active tab has a pencil border and fresh-paper fill. The modal closes by its visible control or the outside area, then restores focus to the originating control. There is no automatic cycling.

### Footer Disclosure

The privacy explanation uses native `details` and `summary`. On narrow screens it stays in flow; from 40rem it opens as a fresh-paper panel above the footer, with a thin rule and small radius.

**The Direct Interaction Rule.** Product previews change only on a visitor's action. Preserve semantic controls, 44px touch targets, visible keyboard focus, and reduced-motion behavior.

## Do's and Don'ts

### Do:

- **Do** show a recognizable phone and primary action over the real island photograph before scrolling on phones.
- **Do** use real Parkdex captures at legible sizes and retain the matte chassis around any device mockup.
- **Do** let paper, ink, rules, and spacing establish hierarchy before adding color or shadow.
- **Do** keep the handwritten voice to short personal annotations and the practical copy in Ysabeau.
- **Do** preserve explicit validation, loading, network error, success, and focus states for signup.

### Don't:

- **Don't** spread the lime accent across whole panels or replace the device shell with brand color.
- **Don't** wash the hero photograph in opaque white, add a masthead divider over it, or hide the phone below the waitlist form.
- **Don't** invent polished chrome, detailed branded hardware, or a decorative gradient around screenshots.
- **Don't** auto-advance app captures or make core content depend on animation.
- **Don't** clip gallery or waitlist content merely to force a one-screen layout.
