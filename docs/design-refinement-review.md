# Design review and comparison

The current landing visual design remains unchanged pending Nathan's choice. Only direct waitlist removal has been added to the main page. Two unlinked, noindex mockups are published at `/mockups/` for comparison.

## Findings

Independent design and technical reviews agreed that the previous gallery's overlapping, rotated devices hid useful product content. Its five generic boxed controls did not communicate a sequence. The initial hero had a clear island photograph and recognizable badge phone worth retaining.

The field-guide candidate uses a readable single-screen preview with five explicit choices and captions tied to the actual captures. The poster candidate uses oversized typography and a longer editorial sequence with separate map, park list and park detail views.

The staging map is a signed-out capture with Map and Account navigation. The user-supplied reward, places and progress captures show signed-in features. The existing authorized Elk Falls capture demonstrates the wishlist control. Captions do not claim a fresh signed-in staging session or fabricate visits.

## Verification

- Independent Sol visual review passed both candidates at 320, 390, 768, 1280 and 1440 CSS-pixel widths. CTA and recognizable badge content appear in the opening viewport. Full phone content remains available by scrolling on the shortest viewport.
- Corrected poster CTA contrast, mobile collisions, contained laptop image, header wrapping and map-heading occlusion. Both candidates preserve complete screenshot aspect ratios.
- Impeccable scan: 138 findings, 7 warnings and 131 advisories. Actual poster contrast and clipping defects were corrected. Font/radius ramps reflect intentionally separate mockup treatments; tiny credits are peripheral; cream palette is the user's incumbent brand. Main-page flat typography is a static-analysis false positive because styles enter through TypeScript. Browser mutation/overlay injection is unavailable; native browser screenshots and DOM inspection were used.
- Hallmark scores (Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety): A 4/4/4/5/4/4; B 5/4/4/5/3/5. User-requested device mockups and poster scale are intentional exceptions to generic-frame and display-size defaults.
- Nine API tests and production build pass. Live browser signup created exactly one owned synthetic record. Removing the uppercase equivalent through About your email returned generic success; database verification found zero remaining records. Empty removal validation focuses the field. Same-page join/remove requests are serialized.
- Deployed comparison renders both same-origin iframes. Desktop/Phone control and all five A preview choices work. Mockup forms use `method="dialog"` outside any dialog plus preview feedback, so no native HTTP submission occurs even if JavaScript fails (WHATWG form submission step 11).

Final runtime: `ab61ae259c82cd342843be0ecd8406700f813afe`.

## Remaining choice

Choose the field-guide direction, poster direction, or a combination before replacing the main visual design. Research for the requested established iPhone-style frame is recorded separately in `device-frame-research.md`; implementation belongs to the next visual pass.
