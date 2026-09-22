# Parkdex landing

The independent Parkdex introduction and Android launch waitlist. A static Vite page with a Vercel Function and its own Neon database.

## Development

Use Node 22 or 24. Run `npm ci`, then `npm run dev`. The static page is served at http://127.0.0.1:4317. The `/api/waitlist` Function runs on Vercel; local Vite does not emulate it. The page reports a real error if it cannot reach the Function.

`npm test` checks the signup contract and `npm run build` type-checks and builds the full application. No database is contacted during build or tests.

## Runtime configuration

`DATABASE_URL` is server-only and points to the landing application's dedicated database. Never use the main Parkdex database. `VITE_APP_URL` is a public build variable, defaulting to https://parkdex.app until the app moves to https://web.parkdex.app.

The landing deploys only to its separate Vercel project. No Git deployment integration, cron, polling service, or Railway service is needed. Read DEPLOYMENT.md for the temporary URL and provider ownership.

## Signup data

Each normalized email is saved once, with its creation timestamp. Only a launch notification is promised. There is no public list or export endpoint and no email is sent automatically. The operator can export or delete registrations directly in the dedicated Neon database. Test addresses are removed after verification.

## Design and assets

The selected Outdoor Poster opens with the East Sooke coastline, oversized portfolio typography, a directly usable Android waitlist and an established iPhone SVG showing the supplied badge reward. The whole phone and both actions remain visible on narrow screens. Four product stories follow: discover parks, save places, keep a visit postcard, and watch island progress grow.

Real app captures are used without recreating their contents. Screenshot provenance is recorded in assets/provenance. The user supplied the signed-in states; the desktop exploration map was captured from staging. The hero photograph credit and license are recorded in public/images/PHOTO-CREDIT.md and linked on the page. DESIGN.md and the surface brief describe the current visual system and composition.
## Design comparison

The unlinked `/mockups/` route compares two candidate directions in desktop and phone viewports. `/mockups/field-guide.html` emphasizes the app journey; `/mockups/poster.html` explores an outdoor poster composition. Both are design previews with inert email forms and `noindex`. The user selected Outdoor Poster for the production page. Comparison routes retain the earlier concepts and provisional frames. Production uses the pinned MIT asset documented in public/frames/PROVENANCE.md.

The main page's **About your email** disclosure includes direct removal from the Android waitlist. Removal uses the existing same-origin `POST /api/waitlist` endpoint with `action: "remove"`; join remains the default. Both operations use generic success responses and the same request-size, origin and WAF protections.

## Public information pages

`/privacy/`, `/delete-account/`, and `/support/` are static pages in this landing project. Account deletion requests go to Nathan at `contact@nathanpannell.com` and are fulfilled through the Parkdex app's verified owner-run process. The landing has no account-deletion API, request database, or inbox automation. Waitlist removal stays in **About your email** and is separate from account deletion. Update the public privacy copy when the app's data flow or provider configuration changes; source evidence and release gates are in `docs/privacy-data-inventory.md` and `docs/privacy-release-gates.md`.

Upcoming Android visit/postcard captures show actual PR114 components with demonstration photographs, labeled as previews. Their provenance and photo credits are in public/images/PHOTO-CREDIT.md. Production styles enter through src/shared-base.css, poster-page.css and device-frame.css; the older style.css is retained only by comparison routes.
