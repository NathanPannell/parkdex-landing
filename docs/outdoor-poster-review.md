# Outdoor Poster release review

## Decision and implementation
The user selected the Outdoor Poster mockup through the Parkdex coordination task. The production page uses its full coastal photograph and oversized Parkdex wordmark, replaces scroll-only hero links with an inline Android waitlist and a secondary web-app button, and removes the small navigation, decorative labels and personal portfolio link.

The product story covers discovery, saving places, visits/photo postcards, and island progress. Existing signup/removal behavior and dedicated storage are preserved. Direct removal remains under About your email.

## Screenshot truth
- Badge reward, park search and island progress: user-supplied September19 captures.
- Whole-island discover map: approved signed-out staging capture.
- Elk Falls wishlist: approved existing portfolio app capture, showing heart/save controls.
- Visit review and postcard: actual React UI from Sealed Impressions draftPR114 at81dd426, captured375x844 with controlled catalogue demonstration photos. Labeled upcoming Android preview, not shipped customer evidence. Source/license recorded in public/images/PHOTO-CREDIT.md.
- No claims of routing, no-account visits or prototype cloud behavior.

## Device frame
Established upstream asset, license and precise content-safe geometry recorded under public/frames and docs/device-frame-research.md. Full screenshot rectangles remain intact. Responsive visual validation passed, including the camera clearance, bottom controls and visible chassis.

## Verification
The production build and nine API tests passed. The selected release was checked on the temporary Vercel URL in Chrome and the in-app browser. Blank signup/removal validation, all seven screenshot viewer states, Escape and close-button focus restoration, web-app destination, Back and subsequent scrolling passed. Additional 375px and 414px layouts have no horizontal overflow, and the full phone plus both calls to action remain visible. The 320x568 screenshot dialog keeps its image and close control reachable.

The owned address codex-landing-b628179e@example.com produced signup success and exactly one normalized database row. Removing the uppercase equivalent under About your email produced generic success and zero rows. The deployed function was healthy; direct psql verification timed out, so the isolated database was verified using a bounded read-only Neon HTTP query. No test record remains. No browser errors were recorded in the final in-app journey.

Live QA caught a final low-contrast removal success message. The hero success color is now scoped to its own form; the cream footer uses the existing dark success/error tokens. This targeted CSS correction passed the production build and independent contrast review (both 6.33:1). Final deployment96dace4 was reloaded in the browser: blank-field error and successful removal are readable. A second removal of the already absent owned address returned the same generic success. Before/after crops and deployed screenshots are in docs/evidence/outdoor-poster.

## Independent final review
Sol visual verdict: SHIP after correcting mobile figures that collapsed under shrink-to-fit alignment and removing an artificial heading width that split Everything. Exact320/390/768/1280/1440 hero views passed, as did desktop story pairs/progress, restored mobile wishlist/postcard screens, progress/footer and full screenshot visibility. No remaining visual blocker.

Technical review: all seven viewer keys and form selectors match. Frame safe rectangle clears camera and lower corner curves. No external SVG references; same-origin CSP remains intact. Both forms use an inert method=dialog native fallback outside a dialog so email cannot leak into a GET URL if JS is unavailable. Production CSS detector:31 typography/radius advisories, no warnings/errors. HTML type hierarchy warning is a JS-import limitation. Hallmark P5/H4/E4/S5/R4/V4.

## Selected icon
User approved round03 item02 Camas soft gloss through orchestration. Four canonical favicon/touch exports were copied unchanged after verifying the package hashes and exact approved source SHA-256. The main page uses these assets and retains its no-header composition. The icon owner's independent export audit passed. No screenshot repainting or icon regeneration. See public/ICON-PROVENANCE.md.
