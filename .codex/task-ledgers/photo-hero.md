# Photo hero revision

User requests a Vancouver Island photograph in the background, a phone UI visible in the opening viewport, and richer screenshot access below. Include supplied badge reward, park categories and island progress captures. Inspect current staging for fresh app states.

## Trace
The prior mobile grid deliberately placed intro and full signup above screenshots. Visual QA accepted the resulting text-only first viewport. This was a composition error, not missing image assets. Local AGENTS.md now requires landscape, product phone and CTA in the opening viewport at all key sizes.

## Ownership
Root owns asset provenance, staging inspection, integration, browser QA, documentation and delivery. Luna implementation agent owns index.html and src. Luna research agent sources a real island photo. Sol advises composition and will independently review the final output.

## Delivery
Update the existing landing Vercel project and PR1. No Parkdex app deployment or domain changes.

Final runtime: 417835a, live at https://parkdex-landing.vercel.app. Vercel deployment 1ArT8BYyWb59GBweLKVtkMsCrt6h. No provider topology or database changes. All seven first-viewport captures passed independent visual review. A bounded correction separated gallery hardware from its controls and added descriptive photo alt text.

## Verification
- Production typecheck/build passed. Six signup contract tests passed.
- Live 320, 375, 390, 414, 768, 1280 and 1440 viewport checks show photograph, phone and CTA before scroll, without horizontal overflow.
- All five screenshot selections work; Escape restores focus to the original trigger. Mobile badge viewer and gallery fit their controls.
- Android waitlist anchor and invalid-email feedback work. A mobile synthetic signup stored one row; the deployer verified and deleted it, then verified zero.
- Open app, Back then Scroll and privacy disclosure work on the deployed page. Browser connection changed during QA and was re-established through the documented browser tools.
- Independent Sol finish review: SHIP. Design docs and sidecar updated to reflect actual shipped code.
- Evidence in docs/evidence/photo-revision. Browser viewport overrides reset; owned local Vite process to be stopped at handoff.

## Assets and access
- User confirmed supplied screenshots should be used for signed-in states. Staging opens signed out and Goldstream detail offers account claims only. No account data was changed.
- Captured fresh 1440x900 staging Find places map. Supplied reward, categories and progress images encoded to WebP without content edits.
- Selected real East Sooke photograph by Brandon Godfrey, CC BY-SA 2.0. Source, modification and license records accompany the assets; visible page credit required.
- Existing wishlist detail screenshot retained from approved portfolio source.
