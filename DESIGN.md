---
name: Parkdex
description: An Outdoor Poster for Parkdex on Vancouver Island.
colors:
  paper: "#f1f0e8"
  paper-bright: "#fbfaf4"
  paper-deep: "#e6e8dd"
  ink: "#142d27"
  secondary: "#40594e"
  muted: "#546359"
  accent: "#ff5a1f"
  accent-ink: "#142d27"
  accent-hover: "#ff7a45"
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
  brand:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(5rem, 15.5vw, 15rem)"
    fontWeight: 780
    lineHeight: 0.7
    letterSpacing: "-.04em"
  display:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(3.4rem, 6.5vw, 6rem)"
    fontWeight: 780
    lineHeight: 0.86
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 780
    lineHeight: 0.87
    letterSpacing: "-.035em"
  title:
    fontFamily: "Strichpunkt Sans Variable, sans-serif"
    fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)"
    fontWeight: 720
    letterSpacing: "-.03em"
  body:
    fontFamily: "Ysabeau Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
  label:
    fontFamily: "Ysabeau Variable, sans-serif"
    fontSize: ".95rem"
    fontWeight: 650
  hand:
    fontFamily: "Caveat Variable, cursive"
    fontSize: "clamp(2.2rem, 4vw, 3.6rem)"
rounded:
  field: "5px"
  dialog: "12px"
  circle: "50%"
spacing:
  xs: ".5rem"
  sm: ".75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "4rem"
  gutter: "clamp(1.25rem, 4.5vw, 5rem)"
components:
  link-web:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.hero-text}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.field}"
    padding: ".8rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  input-email:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: ".8rem 1rem"
  button-remove:
    backgroundColor: "{colors.transparent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: ".55rem .8rem"
  button-dialog-close:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    height: "44px"
---

# Design System: Parkdex

## Overview

**Creative North Star: "Outdoor Poster"**

Parkdex opens like a large outdoor poster laid over a real East Sooke photograph. An oversized Parkdex wordmark, the 122-park Vancouver Island statement, Kip the oystercatcher,, and a mobile map phone make the place and product apparent immediately. The underlined count opens a four-category breakdown. The waitlist form is part of this opening. There is no small masthead, navigation band, hand-drawn annotation, or scroll-only signup call to action.

Three full-width product stories follow the photo: picking a park, arriving and claiming its badge, and the badge case with its share card. Category words in the map copy open real place examples with photographs and descriptions. Large Strichpunkt headlines, practical Ysabeau copy, real app captures fitted to matte device frames, and a live mobile list view carry the sequence. The upcoming Android section uses the arrival and collection after captures from Sealed Impressions. A short Caveat sign-off closes the page. About your email and Credits open in dialogs.

**Key Characteristics:**

- East Sooke remains a recognizable photographic surface beneath transparent contrast shading.
- The giant wordmark, inline waitlist, and map phone belong to one opening composition.
- Three spacious story sections alternate warm paper, soft sage, and deep green.
- Complete screenshot content sits inside legible hardware. Device screens are not interactive.

## Colors

The palette starts with natural coastal color and warm photo copy, then moves through paper and deep green. Kip orange is the poster's one vivid mark.

### Primary

- **Kip Orange** (`accent`): The field app's orange for the wordmark period, second hero headline line, Android beta action, and selection. Its lighter hover variant (`accent-hover`) keeps ink lettering above 4.5:1 and is limited to precise-pointer interaction. Success text on the photo uses warm white rather than orange.
- **Green Ink** (`ink`, also `accent-ink`): Paper-section headlines, the dark collection story, controls, and copy on orange.

### Neutral

- **Field Paper** (`paper`): Map story and footer, under a faint paper texture.
- **Visit Sage** (`visit-paper`): A separate soft green surface for the Android preview story.
- **Fresh Paper** (`paper-bright`): Email fields and compact tooltips.
- **Pressed Paper** (`paper-deep`): Subtle contrast behind image surfaces.
- **Secondary Ink** (`secondary`): Explanatory story copy and footer metadata.
- **Quiet Ink** (`muted`): Placeholders and subdued form or preview notes.
- **Pencil Rule** (`rule`): Hairline section dividers and fields.
- **Matte Hardware** (`device-shell`, `device-edge`, `device-bezel`, `device-base`): Dark chassis, one light-facing edge, screen mat, and laptop hardware. These colors belong to devices, not generic cards.
- **Screen Shade** (`shadow`): Device and tooltip separation.

### Photographic Overlay

- **Warm Photo Text** (`hero-text`, `hero-soft`): Main hero lettering and quieter supporting copy over the landscape.
- **Coastal Scrim** (`hero-scrim`, `hero-scrim-soft`, `shade-28`, `shade-30`, `shade-38`, `shade-40`, `shade-44`, `shade-48`): Transparent green-dark values for directional photo contrast. The photograph remains the base surface.

### State Colors

- **Focus Green** (`focus`): Visible keyboard outline and text caret.
- **Error Red** (`error`): Shared error token; the hero puts warm-white error copy on a solid ink status surface for contrast on the photo.
- **Success Green** (`success`): Shared success token; hero confirmation text uses warm white for contrast on the photo.
- **Clear** (`transparent`): Link-like controls that preserve the paper surface.

**The One Marker Rule.** Keep orange concentrated in the giant brand punctuation, headline, and primary action while the landscape, green ink, and paper do the rest.

**The Clear Landscape Rule.** Darken the real photograph only enough to read the text. Preserve the image and its crop as the opening material.

## Typography

**Display Font:** Strichpunkt Sans Variable, with sans-serif fallback.
**Body Font:** Ysabeau Variable, with sans-serif fallback.
**Handwritten Font:** Caveat Variable, with cursive fallback.

**Character:** Strichpunkt makes the page feel like a printed outdoor poster, especially in the oversized wordmark and tightly set story headlines. Ysabeau handles reading and form text. Caveat gives the clickable park count and closing sign-off a handwritten accent.

### Hierarchy

- **Brand** (780, desktop clamp from 5rem to 15rem, .7 line-height, tight tracking): A single huge Parkdex wordmark and orange period on the photograph. Phone layouts use a smaller fluid range so the mark stays whole.
- **Display** (780, desktop clamp from 2.5rem to 4.3rem, .86 line-height): Two-line warm-white and orange hero statement. The white count starts at 000 and reaches 122 in one second. It scales down to 2rem in the narrowest phone rule.
- **Headline** (780, desktop clamp from 3rem to 6rem, .87 line-height): Three short product-story headings. The dark collection section reverses them to warm white.
- **Title** (720, 1.25rem to 1.6rem): Place example heading.
- **Body** (regular, 1.125rem base): Hero lede reaches 1.3rem within 35ch; story paragraphs reach 1.3rem within 34ch and use a calmer 1.42 line-height.
- **Label** (650, .95rem in the hero): The two email fields retain accessible labels while showing only email placeholders visually.
- **Hand** (2.2rem to 3.6rem): Only the closing “See you out there.”

**The Handwriting Rule.** Caveat is limited to the park count and closing sign-off; it does not carry form labels, navigation, or essential instructions.

## Layout

The page is a centered 1800px maximum-width shell. The first region is a full photographic poster, with no separate header. Its inner layout sets copy and the map phone in two columns on desktop; on phones the wordmark spans the opening, the phone sits beside the headline and supporting line, and the full-width form follows below both. The hero uses responsive East Sooke assets, a deliberate cover crop, and transparent shading. Its headline and spacing keep the waitlist action visible in the opening viewport. The poster uses its own fluid gutter (`gutter` in frontmatter) and tightens copy and phone sizing again at 22rem.

Three full-width color sections create the scroll sequence, with their content held to about 1440px on large screens. Each uses a large heading and slightly larger supporting copy beside substantial product imagery on desktop, then stacks copy before imagery at 40rem and below. The map introduces four colored, underlined categories with example place tooltips, a laptop map with all pins, and a mobile list with filters. Paired Android previews show on-site arrival and the private postcard collection. The final deep-green section combines the map with the River Otter badge. The footer returns to paper with a filled waitlist link above a compact sign-off and link row. The Nathan signature links to his site; email and credits details open in dialogs.

The hero has no email field. Its two list actions sit side by side above 40rem and stack on phones; each opens the full-screen sign-up modal (deep green, large Kip, a two-option list switch, one email field). The collection section repeats the two actions. Device imagery remains large, with the two Android phones side by side on wide screens and stacked on phones. The collection section sets the laptop and smaller badge phone together. These are this page's story compositions, not general-purpose grids.

## Elevation & Depth

The real East Sooke image is the hero surface. Two transparent green-dark gradients support warm text without replacing the photograph. Below, paper grain is faint and the story sequence alternates warm paper, soft sage, and deep green. Screens retain their dark hardware silhouettes. Generic content has no floating-card shadow.

### Shadow Vocabulary

- **Device contact** (`0 12px 28px var(--color-shadow)`): Soft hardware separation where laptop framing uses the shared hardware style.
- **Tooltip lift** (`0 10px 26px var(--color-shadow)`): Compact anchored count and place examples.

**The Frame Fit Rule.** Fill the transparent openings of each supplied device frame with a real capture. Crop only the edges needed for the opening's aspect ratio, keep important controls visible, and never leave a paper-colored gap between image and bezel.

## Shapes

The hero has no visible frame or header rule; the photograph runs edge to edge within the site shell. The brand mark is an orange period; Kip is the only illustrated character. Email fields, actions, and compact tooltips use small 5px corners. Device frames supply the camera and hardware silhouettes while a separate screen mat protects screenshot content. Each story is a broad open surface rather than a boxed card.

## Components

### Buttons

- **Android beta primary:** The "Get access to Android beta" submit control is orange with green Strichpunkt lettering, 5px corners, and at least 54px height on desktop.
- **App Store secondary:** "Join App Store waitlist" uses the same shape with a warm-white outline and lettering over a transparent coastal shade. It saves to a separate list.
- Both actions sit beneath the email field, side by side above 40rem and stacked below. On phones both controls use at least 48px height. Hover darkens only on precise pointers; active presses down 1px.
- **Removal action:** A quiet, outlined paper-section button inside the privacy disclosure, with at least 44px height. It has distinct disabled and loading states.

### Inputs / Fields

The hero email field has an accessible label and visible email placeholder, fresh-paper fill, a 1px pencil rule, and 5px corners. The field and primary action have at least 54px height on desktop and 46px on phones. Keyboard focus uses a 3px green outline at a 4px offset. The hero form shows feedback only after interaction; loading and completed states change button text and availability. A second labeled email field lives in the footer's removal form, with its own loading, error, and completion feedback.

### Navigation

There is no masthead or navigation menu. The giant wordmark is display text. A fixed skip link becomes visible on focus. The footer contains email and Credits disclosures plus policy and support links.

### Screenshot Devices and Place Examples

The hero phone shows the field app map with the badge counter and nearby badges; Kip waves from its lower corner. Each story shows two field app phones: park sheet and nearby badges, arrival and badge claimed, then the badge case and share card. All six story devices share one displayed height on desktop, with slight rotations preserved. At phone widths the two laptops disappear completely, and the four remaining story phones share one size. The four colored category words reveal one real place each in compact tooltips anchored inside the map section on hover, focus, or click. The warm-white handwritten and underlined hero count reveals a similarly compact tooltip containing only the four category labels and counts. Each tooltip count animates from zero over 0.3 seconds when opened. Device screens are not clickable.

The hero phone and story devices use the owner-supplied transparent frame overlays referenced by issue #4. Their media layers fill the transparent apertures and sit beneath the hardware overlays, including the phone camera island. Use a cover crop to close gaps at the bezel while preserving meaningful app controls.

### Android Preview Labels

The arrival and collection after images depict an upcoming Android flow with demonstration photos. The story note identifies them as coming to Android, while accessible image text and collapsed Credits identify the photos as demonstrations.

### Footer

The footer opens with Kip cheering beside the large Caveat "See you out there. -Nathan" sign-off. Below it, three labeled link groups (Get Parkdex, Help, About) sit in a left-aligned grid that becomes two columns on phones, followed by a single fine-print line. About your email and Credits still open native modal dialogs.

**The Direct Interaction Rule.** Place examples change on hover, focus, or click; opening a preview never blocks the other category controls. Preserve semantic controls, 44px touch targets, visible keyboard focus, and reduced-motion behavior.

## Do's and Don'ts

### Do:

- **Do** keep the giant wordmark, inline Android form, and map phone in one photographic opening.
- **Do** preserve real screenshot content, including its full edges, within a visible matte chassis and a reserved camera area.
- **Do** make the three product stories readable as picking a park, claiming its badge, and the badge case.
- **Do** keep the demonstration-photo status in accessible text and Credits while preserving the operator's exact visible story copy.
- **Do** keep essential reading in Ysabeau, reserve Caveat for the park count and closing sign-off, and preserve clear form and focus states.

### Don't:

- **Don't** add a small masthead, divider, or decorative hero annotations around the wordmark.
- **Don't** wash the East Sooke photograph in opaque white or make orange a whole-panel fill.
- **Don't** stretch screenshot content or crop away the controls needed to understand the feature.
- **Don't** represent the Android demonstration photos as captured user visits or a shipped feature.
- **Don't** auto-advance app captures, bury the real signup behind a scroll-only action, or clip story content to force a one-screen page.
