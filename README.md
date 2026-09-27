# Parkdex landing

The independent Parkdex introduction with separate Android beta and App Store waitlists. A static Vite page with a Vercel Function and its own Neon database.

## Development

Use Node 22 or 24. Run `npm ci`, then `npm run dev`. The static page is served at http://127.0.0.1:4317. The `/api/waitlist` Function runs on Vercel; local Vite does not emulate it. The page reports a real error if it cannot reach the Function.

`npm test` checks the signup contract and `npm run build` type-checks and builds the full application. No database is contacted during build or tests.

## Runtime configuration

`DATABASE_URL` is server-only and points to the landing application's dedicated waitlist database. Never use the main Parkdex database. `VITE_APP_URL` selects the matching app origin for OAuth metadata and account migration. It defaults to `https://web.parkdex.app`; staging uses `https://staging.web.parkdex.app`.

The landing deploys only to its separate Vercel project. No Git deployment integration, cron, polling service, or Railway service is needed. Read DEPLOYMENT.md for the temporary URL and provider ownership.

## Signup data

Each signup names a list. Android beta requests go to `android_beta_signups` and App Store requests go to `app_store_waitlist_signups`; each normalized email is saved once per list with its creation timestamp. A request without a list is treated as the Android beta so cached pages keep working. The earlier `waitlist_signups` table keeps its Android launch signups under their original consent and receives no new rows. Only a beta invitation or an App Store launch notification is promised. There is no public list or export endpoint and no email is sent automatically. The operator can export or delete registrations directly in the dedicated Neon database. Test addresses are removed after verification.

## Design and assets

The selected Outdoor Poster opens with the East Sooke coastline, oversized portfolio typography, "Get access to Android beta" and "Join App Store waitlist" buttons, and a mobile map phone. Neither button shows an email field on the page; each opens a full-screen sign-up modal with Kip and that list preselected. The whole phone and both actions remain visible on narrow screens. Kip the oystercatcher, the field app's mascot, stands large beside the hero phone with a "Hi, I'm Kip!" bubble, and again beside the footer sign-off. Three two-phone product stories follow: picking a park, with three anchored place tooltips; arriving and claiming a badge; and the badge case and share card. The saved places section has been removed. Supporting copy and device imagery sit inside a centered content width on large screens; the map, visit, and Dex sections use distinct backgrounds. Story phones share one displayed height on desktop and one width on phones. The footer begins with a waitlist button that returns to the hero email field. Its linked Nathan sign-off and supporting links stay in one compact desktop row, with modal About your email and Credits details.

Real app captures are used without recreating their contents. All phone screens and Kip come from the Parkdex field app (`../parkdex-badge-mockup`), the offline Android app for 122 Vancouver Island parks. `/og-image.jpg` is the share card rendered from `social/og-card.html`; see social/README.md. Screenshot provenance and the hero photograph credit are recorded in public/images/PHOTO-CREDIT.md. DESIGN.md and the surface brief describe the current visual system and composition.
## Design comparison

The unlinked `/mockups/` route compares two candidate directions in desktop and phone viewports. `/mockups/field-guide.html` emphasizes the app journey; `/mockups/poster.html` explores an outdoor poster composition. Both are design previews with inert email forms and `noindex`. The user selected Outdoor Poster for the production page. Comparison routes retain the earlier concepts and provisional frames. Production uses the owner-supplied transparent laptop and phone frames documented in public/frames/PROVENANCE.md.

The main page's **About your email** disclosure includes direct removal from both waitlists and the earlier Android launch list. Removal uses the same-origin `POST /api/waitlist` endpoint with `action: "remove"`; join remains the default and takes `list: "android_beta" | "app_store"`. Both operations use generic success responses and the same request-size, origin and WAF protections.

## Public information pages

`/privacy/`, `/delete-account/`, and `/support/` are static pages in this landing project. Account deletion requests go to Nathan at `contact@nathanpannell.com` and are fulfilled through the Parkdex app's verified owner-run process. The landing has no account-deletion API, request database, or inbox automation. Waitlist removal stays in **About your email** and is separate from account deletion. Update the public privacy copy when the app's data flow or provider configuration changes; source evidence and release gates are in `docs/privacy-data-inventory.md` and `docs/privacy-release-gates.md`.

The upcoming Android section uses the `arrival-after` and `collection-after` Sealed Impressions captures with demonstration photographs. Their provenance and photo credits are in public/images/PHOTO-CREDIT.md. Production styles enter through src/shared-base.css, poster-page.css and device-frame.css; the older style.css is retained only by comparison routes.
