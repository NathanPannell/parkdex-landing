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

The photo-led opening uses the East Sooke coastline, Nathan's portfolio typography and a matte phone showing the supplied badge reward. The landscape, phone and waitlist action remain visible in the first mobile viewport. The next section pairs the full signup form with a screenshot gallery covering exploration, badges, park categories, wishlist and progress.

Real app captures are used without recreating their contents. Screenshot provenance is recorded in assets/provenance. The user supplied the signed-in states; the desktop exploration map was captured from staging. The hero photograph credit and license are recorded in public/images/PHOTO-CREDIT.md and linked on the page. DESIGN.md and the surface brief describe the current visual system and composition.
