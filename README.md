# Parkdex landing

The independent Parkdex introduction, the self-service Android beta steps, and the App Store waitlist. A static Vite page with a Vercel Function and its own Neon database.

## Development

Use Node 22 or 24. Run `npm ci`, then `npm run dev`. The static page is served at http://127.0.0.1:4317. The `/api/waitlist` Function runs on Vercel; local Vite does not emulate it. The page reports a real error if it cannot reach the Function.

`npm test` checks the signup contract and `npm run build` type-checks and builds the full application. No database is contacted during build or tests.

## Runtime configuration

`DATABASE_URL` is server-only and points to the landing application's dedicated waitlist database. Never use the main Parkdex database. `VITE_APP_URL` selects the matching app origin for OAuth metadata and account migration. It defaults to `https://web.parkdex.app`; staging uses `https://staging.web.parkdex.app`.

The landing deploys only to its separate Vercel project. No Git deployment integration, cron, polling service, or Railway service is needed. Read DEPLOYMENT.md for the temporary URL and provider ownership.

## Signup data

Each signup names a list. Android beta requests go to `android_beta_signups` and App Store requests go to `app_store_waitlist_signups`; each normalized email is saved once per list with its creation timestamp. A request without a list is treated as the Android beta so cached pages keep working. Since September 30, 2026 the page itself no longer offers the Android beta list: "Get access to Android beta" opens two linked steps (join the Parkdex Testers Google Group, then opt in at the Google Play testing page and install). The API still accepts the list so older cached pages keep working, and removal still clears it. The original `waitlist_signups` Android launch list was retired on September 27, 2026: the operator moved its signups to the new lists, and `schema.sql` copies any remaining rows to the App Store waitlist before dropping the table. Only a beta invitation or an App Store launch notification is promised. There is no public list or export endpoint and no email is sent automatically. The operator can export or delete registrations directly in the dedicated Neon database. Test addresses are removed after verification.

## Design and assets

The page opens with the East Sooke coastline, the Parkdex wordmark and the positioning line "100 park badges around Victoria. You have to go to get one." beside the current map phone and Kip. "Get access to Android beta" opens a full-screen panel with two numbered buttons, "1. Join the tester group" and "2. Install Parkdex"; the steps open Google in a new tab, remember progress for the session, and the panel stays open to return to. "On iPhone? Join the waitlist" opens the App Store email form. The story follows the app's own loop: How it works (pick a park, step inside the boundary, snap and claim, one real screen each), a deep-green collection section with the app's rank ladder beside My Dex and the share card, three trail facts (offline map, no account needed, location use), and an Android beta section repeating the two steps with the Canada and internal-tester notes. The footer keeps the sign-off, links, About your email and Credits dialogs.

Real app captures are used without recreating their contents. All phone screens and Kip come from the Parkdex field app (`../parkdex-badge-mockup`), currently the 100-park catalogue around Victoria. `/og-image.jpg` is the share card rendered from `social/og-card.html`; see social/README.md. Screenshot provenance and the hero photograph credit are recorded in public/images/PHOTO-CREDIT.md. DESIGN.md and the surface brief describe the current visual system and composition.
## Design comparison

The unlinked `/mockups/` route compares two candidate directions in desktop and phone viewports. `/mockups/field-guide.html` emphasizes the app journey; `/mockups/poster.html` explores an outdoor poster composition. Both are design previews with inert email forms and `noindex`. The user selected Outdoor Poster for the production page. Comparison routes retain the earlier concepts and provisional frames. Production uses the owner-supplied transparent laptop and phone frames documented in public/frames/PROVENANCE.md.

The main page's **About your email** disclosure includes direct removal from both waitlists. Removal uses the same-origin `POST /api/waitlist` endpoint with `action: "remove"`; join remains the default and takes `list: "android_beta" | "app_store"`. Both operations use generic success responses and the same request-size, origin and WAF protections.

## Public information pages

`/privacy/`, `/delete-account/`, and `/support/` are static pages in this landing project. Account deletion requests go to Nathan at `contact@nathanpannell.com` and are fulfilled through the Parkdex app's verified owner-run process. The landing has no account-deletion API, request database, or inbox automation. Waitlist removal stays in **About your email** and is separate from account deletion. Update the public privacy copy when the app's data flow or provider configuration changes; source evidence and release gates are in `docs/privacy-data-inventory.md` and `docs/privacy-release-gates.md`.

The upcoming Android section uses the `arrival-after` and `collection-after` Sealed Impressions captures with demonstration photographs. Their provenance and photo credits are in public/images/PHOTO-CREDIT.md. Production styles enter through src/shared-base.css, poster-page.css and device-frame.css; the older style.css is retained only by comparison routes.
