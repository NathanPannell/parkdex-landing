# Parkdex landing

The independent Parkdex introduction, the self-service Android beta steps, and the App Store waitlist. A static Vite page with a Vercel Function and its own Neon database.

## Development

Use Node 22 or 24. Run `npm ci`, then `npm run dev`. The static page is served at http://127.0.0.1:4317. The `/api/waitlist` Function runs on Vercel; local Vite does not emulate it. The page reports a real error if it cannot reach the Function.

`npm test` checks the signup contract and `npm run build` type-checks and builds the full application. No database is contacted during build or tests.

## Runtime configuration

`DATABASE_URL` is server-only and points to the landing application's dedicated waitlist database. Never use the main Parkdex database. `VITE_APP_URL` selects the matching app origin for OAuth metadata and account migration. It defaults to `https://web.parkdex.app`; staging uses `https://staging.web.parkdex.app`.

The landing deploys through the Vercel Git integration: pushes to `staging` deploy to `staging.parkdex.app` and pushes to `main` deploy to `parkdex.app`. No GitHub Actions deploy, cron, polling service, or Railway service is needed. Read DEPLOYMENT.md for the temporary URL and provider ownership.

## Signup data

Each signup names a list. Android beta requests go to `android_beta_signups` and App Store requests go to `app_store_waitlist_signups`; each normalized email is saved once per list with its creation timestamp. A request without a list is treated as the Android beta so cached pages keep working. Since September 30, 2026 the page itself no longer offers the Android beta list: "Get access to Android beta" opens two linked steps (join the Parkdex Testers Google Group, then opt in at the Google Play testing page and install). The API still accepts the list so older cached pages keep working, and removal still clears it. The original `waitlist_signups` Android launch list was retired on September 27, 2026: the operator moved its signups to the new lists, and `schema.sql` copies any remaining rows to the App Store waitlist before dropping the table. Only a beta invitation or an App Store launch notification is promised. There is no public list or export endpoint and no email is sent automatically. The operator can export or delete registrations directly in the dedicated Neon database. Test addresses are removed after verification.

## Design and assets

The page sells the flag game: capture the flag for real parks. Copy stays short and never quotes point values. Its look follows the Parkdex app (Bricolage Grotesque and Figtree, cream paper, Kip orange, ink outlines with hard shadows, and the flag palette's sun, sky and pine). In order: a sticky nav with a Get the beta button; a hero ("Plant your flag in real parks.") with the flag map phone, and on wider screens Kip, on a hill of generated player flags; How a game works, four steps (go, hold, take, walk it again) that swipe on phones and scroll past one sticky phone on wide screens; founder and @handle cards; the park count with a map of every production park; and the closing Android beta steps. The beta panel, App Store waitlist, About your email and Credits dialogs keep their behaviour. Styles live in src/fan-page.css.

Flags are drawn at build time by `src/flag.ts`, a copy of the app's generator, so they match the flags players get. The demo seeds in `src/flag-art.ts`, used by the hero hill, belong to nobody. The park count, the homepage map and the Park map page (`/near-me/`) read `src/parks.json`, which `npm run sync-parks` refreshes from the production catalogue: the reader 3 snapshot (`https://web.parkdex.app/api/content/snapshot?reader=3`), its CDN catalogue index and the changes since. It keeps BC parks only, leaving out Nova Scotia; review and commit the result. Older readers get only the first Vancouver Island parks, so the reader matters. The homepage map plots those parks on `public/images/park-basemap.webp`, a recoloured OpenFreeMap render of BC whose bounds are in `src/park-basemap.json` (see `scripts/render-park-basemap.mjs`). The flags on that map are live: once the map nears the screen, the page asks `/api/flags` (`api/flags.ts`), which mirrors the app's public `GET /api/game/flags` with only park, seed and planting time, cached for five minutes in each Vercel CDN region. A flag on a park newer than `src/parks.json` has no dot and is skipped until the next sync. Nothing else calls the app at runtime. The retired Badges and Day trips pages redirect to the homepage and the park map.

### Moving or still app screens

Every homepage app screen has a still in `public/images/app/` and a moving loop (animated WebP) in `public/images/app/motion/`, named in the image's `data-motion` attribute. The `HOME_MEDIA` environment variable picks one at build time:

- `motion` (default): browsers get the loop, except visitors whose device asks for reduced motion, who get the still.
- `still`: only the stills.

To flip it, set `HOME_MEDIA` in the Vercel project's environment variables (Production for parkdex.app, Preview for staging) and redeploy. A build in `motion` mode fails if a loop is missing; the dev server falls back to the still.

Real app captures are used without recreating their contents. Phone screens come from the Parkdex app (`../parkdex-badge-mockup`) running locally with test players; see public/images/app/README.md. `/og-image.jpg` is the share card rendered from `social/og-card.html`; see social/README.md. DESIGN.md and the surface brief describe the current visual system and composition.
## Design comparison

The unlinked `/mockups/` route compares two candidate directions in desktop and phone viewports. `/mockups/field-guide.html` emphasizes the app journey; `/mockups/poster.html` explores an outdoor poster composition. Both are design previews with inert email forms and `noindex`. The user selected Outdoor Poster for the production page. Comparison routes retain the earlier concepts and provisional frames. Production uses the owner-supplied transparent laptop and phone frames documented in public/frames/PROVENANCE.md.

The main page's **About your email** disclosure includes direct removal from both waitlists. Removal uses the same-origin `POST /api/waitlist` endpoint with `action: "remove"`; join remains the default and takes `list: "android_beta" | "app_store"`. Both operations use generic success responses and the same request-size, origin and WAF protections.

## Public information pages

`/privacy/`, `/delete-account/`, and `/support/` are static pages in this landing project. Account deletion requests go to Nathan at `contact@nathanpannell.com` and are fulfilled through the Parkdex app's verified owner-run process. The landing has no account-deletion API, request database, or inbox automation. Waitlist removal stays in **About your email** and is separate from account deletion. Update the public privacy copy when the app's data flow or provider configuration changes; source evidence and release gates are in `docs/privacy-data-inventory.md` and `docs/privacy-release-gates.md`.

The Android beta section uses the `arrival-after` and `collection-after` Sealed Impressions captures with demonstration photographs. Their provenance and photo credits are in public/images/PHOTO-CREDIT.md. Production styles enter through src/shared-base.css, poster-page.css and device-frame.css; the older style.css is retained only by comparison routes.
