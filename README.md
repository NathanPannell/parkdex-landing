# Parkdex landing

The independent Parkdex introduction and Android launch waitlist. A static Vite page with a Vercel Function and its own Neon database.

## Development

Use Node 22 or 24. Run `npm ci`, then `npm run dev`. The static page is served at http://127.0.0.1:4317. The `/api/waitlist` Function runs on Vercel; local Vite does not emulate it. The page reports a real error if it cannot reach the Function.

`npm test` checks the signup contract and `npm run build` type-checks and builds the full application. No database is contacted during build or tests.

## Runtime configuration

`DATABASE_URL` is server-only and points to the landing application's dedicated waitlist database. Never use the main Parkdex database. `VITE_APP_URL` is a public build variable for the beta web-app link. It defaults to `https://web.parkdex.app`; staging uses `https://staging.web.parkdex.app`.

The landing deploys only to its separate Vercel project. No Git deployment integration, cron, polling service, or Railway service is needed. Read DEPLOYMENT.md for the temporary URL and provider ownership.

## Signup data

Each normalized email is saved once, with its creation timestamp. Only a launch notification is promised. There is no public list or export endpoint and no email is sent automatically. The operator can export or delete registrations directly in the dedicated Neon database. Test addresses are removed after verification.

## Design and assets

The selected Outdoor Poster opens with the East Sooke coastline, oversized portfolio typography, a directly usable Android waitlist and a mobile map phone. The whole phone and both actions remain visible on narrow screens. Three product stories follow: one unified map with desktop pins, a mobile list and four anchored place tooltips; on-site visit and private postcard previews; and growing Dex progress beside a River Otter badge. The saved places section has been removed. Supporting copy and device imagery sit inside a centered content width on large screens; the map, visit, and Dex sections use distinct backgrounds. Story phones and laptops share one displayed height on desktop. On phone widths, the laptop mockups are hidden and the four story phones share one width and height. The footer is one compact row on desktop, with modal About your email and Credits details.

Real app captures are used without recreating their contents. The desktop map and mobile list were captured from the live web app; the Android visit screens come from the staging Sealed Impressions evidence. Screenshot provenance and the hero photograph credit are recorded in public/images/PHOTO-CREDIT.md. DESIGN.md and the surface brief describe the current visual system and composition.
## Design comparison

The unlinked `/mockups/` route compares two candidate directions in desktop and phone viewports. `/mockups/field-guide.html` emphasizes the app journey; `/mockups/poster.html` explores an outdoor poster composition. Both are design previews with inert email forms and `noindex`. The user selected Outdoor Poster for the production page. Comparison routes retain the earlier concepts and provisional frames. Production uses the owner-supplied transparent laptop and phone frames documented in public/frames/PROVENANCE.md.

The main page's **About your email** disclosure includes direct removal from the Android waitlist. Removal uses the existing same-origin `POST /api/waitlist` endpoint with `action: "remove"`; join remains the default. Both operations use generic success responses and the same request-size, origin and WAF protections.

## Public information pages

`/privacy/`, `/delete-account/`, and `/support/` are static pages in this landing project. Account deletion requests go to Nathan at `contact@nathanpannell.com` and are fulfilled through the Parkdex app's verified owner-run process. The landing has no account-deletion API, request database, or inbox automation. Waitlist removal stays in **About your email** and is separate from account deletion. Update the public privacy copy when the app's data flow or provider configuration changes; source evidence and release gates are in `docs/privacy-data-inventory.md` and `docs/privacy-release-gates.md`.

The upcoming Android section uses the `arrival-after` and `collection-after` Sealed Impressions captures with demonstration photographs. Their provenance and photo credits are in public/images/PHOTO-CREDIT.md. Production styles enter through src/shared-base.css, poster-page.css and device-frame.css; the older style.css is retained only by comparison routes.
