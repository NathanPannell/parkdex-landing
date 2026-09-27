# Landing deployment

This is an independent Vercel application with a dedicated Neon database. It does not use the Parkdex application API, Railway services, or database. Static page requests perform no database query. Only `POST /api/waitlist` accesses the landing database.

## Current topology

Since September 27, 2026 the landing uses one Vercel project (`parkdex-landing`) and one Neon project (`noisy-smoke-89213665`). Production is the Vercel Production target on Neon `main`; staging is a Preview-target deployment aliased to `staging.parkdex.app` on Neon `staging`. `docs/delivery.md` is the operating procedure. The rows below are the historical resource journal.

## Resource journal

| Resource | Identity | Status |
| --- | --- | --- |
| Neon project | `noisy-smoke-89213665` | Created in `aws-us-west-2` |
| Neon branch | `br-young-shape-ar1qojbp` (`main`) | Created |
| Neon database | `app` | `schema.sql` applied; table existence verified |
| Vercel project | `prj_R7ccAjDhGmhiys542GFXJ67d1k8X` (`parkdex-landing`) | Created; linked locally |
| Vercel deployment | `dpl_9pYCt7vD1DThEofQ6GJoNGrMg49e` | Public privacy, deletion and support routes from `0417b7b66ee22b333c62e579cede85cbe1cefbab`, Production, READY |
| Canonical staging Neon branch | `br-royal-mode-arzi4hg3` (`staging`) in project `noisy-smoke-89213665` | Created from `main` with schema only; database `app`, zero initial waitlist rows; staging Vercel `DATABASE_URL` rotated to this branch |
| Former staging Neon project | `twilight-heart-20114456` (`parkdex-landing-staging`) | Retired by the single-project migration on 2026-09-27 (0 rows); deleted after staging verification |
| Staging Vercel project | `prj_te8EwQf0rmVvmUgwpzB366IDEaoK` (`parkdex-landing-staging`) | Retired by the single-project migration on 2026-09-27; `staging.parkdex.app` moved to `parkdex-landing`, then the project was deleted |
| Staging WAF rule | `rule_limit_parkdex_landing_staging_waitlist_OwTuIT` | Retired with the staging project; the `parkdex-landing` rule now covers staging |
| Temporary URL | `https://parkdex-landing.vercel.app` | Public; serves the landing page |
| Immutable deployment URL | `https://parkdex-landing-dgz9mzcmv-nathanpannells-projects.vercel.app` | Protected by Vercel Authentication |
| WAF rule | `rule_limit_android_waitlist_submissions_cvRDrf` | Published; POST `/api/waitlist`, 5 requests per 60 seconds per IP |

The deployer owns these resources and the journal until the live signup and database record have been verified. The isolated pooled `DATABASE_URL` is configured as a sensitive Vercel Production variable only. Secrets and connection strings live outside the repository. There is no custom domain assignment in this release. The immutable deployment URL shows Vercel's login screen under the account's default protection; use the public temporary alias for browser verification.

## Apex and staging cutover

The intended host pairs are `parkdex.app` for this landing page and `web.parkdex.app` for the production app, plus `staging.parkdex.app` for a staging landing page and `staging.web.parkdex.app` for the staging app. Keep OAuth and MCP issuer/resource identities at the apex origins. The landing deployment serves the two discovery documents as static files and proxies the seven OAuth, consent, and MCP routes to the matching Railway API.

The linked `parkdex-landing` project currently has only a Production `DATABASE_URL`; Vercel Preview has no environment variables. The waitlist database is production data. A `--prod` deployment to this project uses that Production database even when `--skip-domain` is supplied, so this project must not serve `staging.parkdex.app`.

The staging waitlist began in a separate Neon project `parkdex-landing-staging` (`twilight-heart-20114456`, `us-west-2`) to avoid copying production waitlist addresses. On September 23, 2026, the canonical landing project `noisy-smoke-89213665` gained a `staging` branch (`br-royal-mode-arzi4hg3`) from `main` with `init_source: parent-schema`. The new branch has the same schema, database `app`, role `app_owner`, and zero initial waitlist rows. The separate Vercel project `parkdex-landing-staging` now has its Production `DATABASE_URL` set to this branch. Production Vercel remains on the canonical project's `main` branch. Keep the staging WAF on `POST /api/waitlist` at five requests per 60 seconds per client IP, returning HTTP 429 after the limit. Do not create a data-copy branch from production because that would copy waitlist addresses. Keep Git auto-deployments disabled in both Vercel projects. Retire the former staging Neon project only after the new stable staging deployment and waitlist journey are verified.

Staging releases use the `Deploy landing staging` workflow only; `scripts/deploy-cutover.ps1` is production-only.

For production, link the reviewed production checkout to the existing `parkdex-landing` project and run `pwsh -File scripts/deploy-cutover.ps1 -Target production -ExpectedCommit <40-character-sha>`. It uses `VITE_APP_URL=https://web.parkdex.app` and also skips automatic domain assignment. Verify the immutable deployment and its production waitlist behavior, then assign `parkdex.app` to that exact deployment only after the app's `web.parkdex.app` routes and legacy endpoint handling are ready. Keep the staging alias on the verified staging deployment.

The Vite build writes `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp` from the exact `VITE_APP_URL` build target, allowing the landing deployment to retain current apex issuer/resource metadata without a rewrite. The target also selects the app origin for account recovery and guest migration. Vercel reserves `/.well-known` from redirects and rewrites, so the no-domain staging check above is a cutover gate. Vercel CLI inspection on September 22, 2026 reported the linked production project's root directory as `.`, Node.js `24.x`, and framework preset `Other`. `vercel env ls production` showed only the encrypted `DATABASE_URL`; Preview had no variables, including no `VITE_APP_URL`. Both tracked configs set `git.deploymentEnabled` to `false`, so commits to a new branch do not create automatic deployments. The deployment script always requires an explicit target and full commit SHA.

## Data contract

`schema.sql` creates `android_beta_signups` and `app_store_waitlist_signups`. It also retires the original `waitlist_signups` table: rows not already on either new list are copied to the App Store waitlist, then the table is dropped. Deploy removal code that no longer references the old table before running it. Every statement is `CREATE TABLE IF NOT EXISTS`, so it is safe to rerun on the persistent staging and production branches before deploying a release that writes to the new tables. Email addresses are normalized to lowercase and unique. Duplicate submissions return the same success response. No outbound email is sent, and there is no public list endpoint. The `DATABASE_URL` environment variable belongs to the new Vercel project only.

`POST /api/waitlist` also accepts `action: "remove"`. It deletes only the exact normalized address from both tables in one transaction and returns the same generic success for existing and absent records. This intentionally provides frictionless opt-out without inbox verification. The existing WAF protects both actions. Signup and removal requests are serialized within one page to avoid a pending signup racing an opt-out.

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

The public information release `0417b7b` reused the same landing project, alias, dedicated database and WAF rule. Vercel production deployment `dpl_9pYCt7vD1DThEofQ6GJoNGrMg49e` is READY and aliased to `https://parkdex-landing.vercel.app`. Chrome verified `/privacy/`, `/delete-account/` and `/support/` on that alias, with correct titles, navigation and no horizontal overflow at 320, 375, 414, 768 and 1692 pixels. The support link to `/#email-privacy` opened the waitlist removal controls. Removing disposable absent address `codex-landing-260922a1@example.com` returned the generic success response, and the dedicated Neon read showed zero rows. Footer navigation, Back then scroll, and the deletion page retention anchor were checked. No account was deleted by this landing release. The app owner separately verified account deletion on staging release `1b9b4b5da8ff428d493722047a182c331b9c87ce`; physical R2 object deletion was not exercised in that staging test.

The September 23 landing refresh first deployed as Vercel Preview `dpl_C4j54BqLJF79tt5cMCpHnXHVtqPJ` at `https://parkdex-landing-l7yzpz9fk-nathanpannells-projects.vercel.app/`. Chrome verified the preview's copy, images, anchored tooltips, matching desktop device heights, hidden mobile laptops, and email dialog. `vercel promote` rebuilt that preview for Production as `dpl_2hqgjXpAsRj42jJuFYZD3EuGtomd`, READY and aliased to `https://parkdex.app`, `https://www.parkdex.app`, and `https://parkdex-landing.vercel.app`. Chrome submitted a disposable address through the production waitlist, then removed its uppercase equivalent through About your email; a read of the isolated Neon database confirmed zero remaining rows. The Preview environment has no `DATABASE_URL`, so its waitlist form was not submitted. The application API, database schema, and WAF configuration were not changed.

The footer follow-up is staged only as Vercel Preview `dpl_B8SFWEqGeqjmsY56FVNM2oNc2pdr` at `https://parkdex-landing-i1zm4ndpl-nathanpannells-projects.vercel.app/`. Chrome verified the filled waitlist link above all footer content at 1440 and 320 pixels, the linked Nathan signature, no phone-width overflow, and navigation that focuses the hero email input. Production remains `dpl_2hqgjXpAsRj42jJuFYZD3EuGtomd`; this preview has not been promoted. The Preview environment still has no `DATABASE_URL`, so signup submission was not tested there.
