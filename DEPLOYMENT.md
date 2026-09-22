# Landing deployment

This is an independent Vercel application with a dedicated Neon database. It does not use the Parkdex application API, Railway services, or database. Static page requests perform no database query. Only `POST /api/waitlist` accesses the landing database.

## Resource journal

| Resource | Identity | Status |
| --- | --- | --- |
| Neon project | `noisy-smoke-89213665` | Created in `aws-us-west-2` |
| Neon branch | `br-young-shape-ar1qojbp` (`main`) | Created |
| Neon database | `app` | `schema.sql` applied; table existence verified |
| Vercel project | `prj_R7ccAjDhGmhiys542GFXJ67d1k8X` (`parkdex-landing`) | Created; linked locally |
| Vercel deployment | `4gADeHFhoB8wwJLVHo2PBozZcn7Z` | Outdoor Poster removal-feedback contrast correction `96dace41e2d6edeb1074156f8f639ef0622da449`, Production, READY |
| Temporary URL | `https://parkdex-landing.vercel.app` | Public; serves the landing page |
| Immutable deployment URL | `https://parkdex-landing-dhgmn3y35-nathanpannells-projects.vercel.app` | Protected by Vercel Authentication |
| WAF rule | `rule_limit_android_waitlist_submissions_cvRDrf` | Published; POST `/api/waitlist`, 5 requests per 60 seconds per IP |

The deployer owns these resources and the journal until the live signup and database record have been verified. The isolated pooled `DATABASE_URL` is configured as a sensitive Vercel Production variable only. Secrets and connection strings live outside the repository. There is no custom domain assignment in this release. The immutable deployment URL shows Vercel's login screen under the account's default protection; use the public temporary alias for browser verification.

## Data contract

`schema.sql` creates `waitlist_signups`. Email addresses are normalized to lowercase and unique. Duplicate submissions return the same success response. No outbound email is sent, and there is no public list endpoint. The `DATABASE_URL` environment variable belongs to the new Vercel project only.

`POST /api/waitlist` also accepts `action: "remove"`. It deletes only the exact normalized address and returns the same generic success for existing and absent records. This intentionally provides frictionless opt-out without inbox verification. The existing WAF protects both actions; no schema or provider changes are needed. Signup and removal requests are serialized within one page to avoid a pending signup racing an opt-out.

Design-only routes under `/mockups/` use non-submitting prototype forms and are excluded from indexing. Their CSP permits same-origin framing for the comparison page; the main page retains `frame-ancestors 'none'`.

## Release checks

Run `npm test` and `npm run build`. Verify the exact Vercel deployment URL in a real browser, submit one owned test address, and confirm a single normalized row in the new Neon database. Delete that test row after recording evidence. Check the Vercel Function response and logs, and confirm existing Parkdex resources were not changed.

Use an address matching `codex-landing-<8 hex digits>@example.com` for the owned test. After submitting it, `pwsh -File scripts/provider-db-check.ps1 -TestEmail <address>` checks the row, and adding `-DeleteTestEmail` deletes it and verifies its absence. The script obtains Neon credentials from the protected user-only store and prints no connection string.

The first live POST on the public alias returned HTTP 200 with `{ "ok": true }`. The new Neon database contained exactly one row for the owned test address. That row was deleted, and absence was verified. A separate test address is reserved for the browser form journey, and it must be deleted after the UI test. The WAF rule is scoped to this project and can throttle repeated tests from one IP; wait 60 seconds before retesting if HTTP 429 appears.

On the preceding deployment, seven same-IP honeypot POSTs returned 200 for attempts 1–5 and 429 for attempts 6–7. The reserved browser test address had zero rows after those requests, proving the honeypot avoided database insertion while the WAF stopped excess traffic before the Function. The project-level WAF rule remained active through the final deployment.

The browser form journey submitted `codex-landing-c0de2026@example.com` and displayed success. The isolated database contained exactly one row for that address; the owned test row was then deleted and its absence verified. The browser also exercised the over-limit response before the rate window reset.

A mobile form test submitted the same reserved address again. The database contained exactly one row after that submission; it was deleted again, and zero rows were verified. This was a mobile success check, not an offline behavior check.

The photo-hero revision reused the existing Vercel project, temporary alias, Neon database, and WAF rule. The production build completed, the alias served Parkdex HTML with HTTP 200, the new hero WebP served with HTTP 200, and `GET /api/waitlist` returned the expected HTTP 405. Deployed visual review remains with the page owner.

The photo-hero correction `417835a` passed the production build and updated the same public alias. The page and hero image each served HTTP 200. The mobile form submitted `codex-landing-d00d2026@example.com` successfully; the isolated Neon database showed exactly one row, which was deleted and verified absent. Gallery visual QA remains with the page owner.

The removal and mockup revision `0fac167` was deployed to the same project, followed by the final mockup heading correction `ab61ae2`. The final Vercel production build completed. The public alias served `/`, `/mockups/`, `/mockups/field-guide.html`, and `/mockups/poster.html` with HTTP 200 and expected page titles. The main page response retained `frame-ancestors 'none'`; each mockup route returned `frame-ancestors 'self'`. These checks were read-only. The page owner verifies the live signup and removal journey against the dedicated Neon row.

The removal release was verified in the live mobile browser with `codex-landing-55e12026@example.com`: signup produced exactly one row, removal of the uppercase equivalent through About your email produced generic success, and a read-only database check verified zero rows. The test record was removed by the shipped UI, not an administrative cleanup query.

The selected Outdoor Poster release `298cecc` reused the same Vercel project, temporary alias, isolated Neon database, and WAF rule. The Vercel production build completed. The public alias returned HTTP 200 for `/`, `/mockups/`, `/mockups/field-guide.html`, and `/mockups/poster.html`; the main page title is `Parkdex · Find a park. Keep the firsts.`. The main page retains `frame-ancestors 'none'`, while each mockup route returns `frame-ancestors 'self'`. The four canonical camas exports used by the main page, `/favicon.ico`, `/favicon-32x32.png`, `/favicon-64x64.png`, and `/apple-touch-icon.png`, returned HTTP 200 with appropriate image content types. The earlier `/favicon.svg` also returned HTTP 200, but remains a legacy asset referenced by the design mockups, not by the main page. These checks were read-only; the page owner handles live browser and waitlist verification.

The live Outdoor Poster browser journey submitted `codex-landing-b628179e@example.com`, and an isolated Neon HTTP read found exactly one row. The page then removed the uppercase equivalent through the shipped opt-out UI; a second read of the same normalized address found zero rows. Both verification queries were read-only, and no administrative deletion was used.

The CSS-only feedback contrast correction `96dace4` passed the Vercel production build and updated the same temporary alias. The alias maps to deployment `4gADeHFhoB8wwJLVHo2PBozZcn7Z`. The main page, comparison page, both mockups, and all four canonical camas icon files returned HTTP 200. The main page retained `frame-ancestors 'none'`, and the mockups retained `frame-ancestors 'self'`. No API or database schema changed in this correction.
