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
Established upstream asset, license and precise content-safe geometry recorded under public/frames and docs/device-frame-research.md. Full screenshot rectangles remain intact. Responsive visual validation pending final integration.

## Verification
Pending final implementation, independent review, build, deployed browser checks and cropped before/after PR evidence. Builds deferred during main app strict Android gate.

## Independent final review
Sol visual verdict: SHIP after correcting mobile figures that collapsed under shrink-to-fit alignment and removing an artificial heading width that split Everything. Exact320/390/768/1280/1440 hero views passed, as did desktop story pairs/progress, restored mobile wishlist/postcard screens, progress/footer and full screenshot visibility. No remaining visual blocker.

Technical review: all seven viewer keys and form selectors match. Frame safe rectangle clears camera and lower corner curves. No external SVG references; same-origin CSP remains intact. Both forms use an inert method=dialog native fallback outside a dialog so email cannot leak into a GET URL if JS is unavailable. Production CSS detector:31 typography/radius advisories, no warnings/errors. HTML type hierarchy warning is a JS-import limitation. Hallmark P5/H4/E4/S5/R4/V4. Build and nine API tests passed; final live round trip pending deployment.

## Selected icon
User approved round03 item02 Camas soft gloss through orchestration. Canonical package is being exported by icon owner. Landing will integrate favicon/touch assets only, preserving the selected artwork and existing no-header composition. No screenshot repainting or icon regeneration.
