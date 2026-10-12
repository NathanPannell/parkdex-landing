# Landing deployment

This is an independent Vercel application with a dedicated Neon database. It does not use the Parkdex application API, Railway services, or database. Static page requests perform no database query. Only `POST /api/waitlist` accesses the landing database. `docs/delivery.md` is the operating procedure; project, branch and domain identities live there and in the Atlas.

## OAuth and MCP proxy

Keep OAuth and MCP issuer/resource identities at the apex origins. The Vite build writes `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp` from the exact `VITE_APP_URL` build target, because Vercel reserves `/.well-known` from redirects and rewrites. `vercel.json` proxies the seven OAuth, consent and MCP routes (`/mcp`, `/mcp/*`, `/authorize`, `/token`, `/register`, `/revoke`, `/oauth/consent`) to the matching legacy Parkdex Railway API, and redirects `/auth/google/callback` to the matching legacy map host. The legacy `NathanPannell/parkdex` service must stay up until these routes move.

Staging and production releases use the Vercel Git integration. `scripts/deploy-cutover.ps1 -Target production -ExpectedCommit <40-character-sha>` is a manual production fallback; it requires an explicit target and full commit SHA and skips automatic domain assignment.

## Data contract

`schema.sql` creates `android_beta_signups` and `app_store_waitlist_signups`. It also retires the original `waitlist_signups` table: rows not already on either new list are copied to the App Store waitlist, then the table is dropped. Deploy removal code that no longer references the old table before running it. Every statement is `CREATE TABLE IF NOT EXISTS`, so it is safe to rerun on the persistent staging and production branches before deploying a release that writes to the new tables. Email addresses are normalized to lowercase and unique. Duplicate submissions return the same success response. No outbound email is sent, and there is no public list endpoint. The `DATABASE_URL` environment variable belongs to the new Vercel project only.

`POST /api/waitlist` also accepts `action: "remove"`. It deletes only the exact normalized address from both tables in one transaction and returns the same generic success for existing and absent records. This intentionally provides frictionless opt-out without inbox verification. The existing WAF protects both actions. Signup and removal requests are serialized within one page to avoid a pending signup racing an opt-out.

Design-only routes under `/mockups/` use non-submitting prototype forms and are excluded from indexing. Their CSP permits same-origin framing for the comparison page; the main page retains `frame-ancestors 'none'`.

## Release checks

Run `npm test` and `npm run build`. Verify the exact Vercel deployment URL in a real browser, submit one owned test address, and confirm a single normalized row in the new Neon database. Delete that test row after recording evidence. Check the Vercel Function response and logs, and confirm existing Parkdex resources were not changed.

Use an address matching `codex-landing-<8 hex digits>@example.com` for the owned test. After submitting it, `pwsh -File scripts/provider-db-check.ps1 -TestEmail <address>` checks the row, and adding `-DeleteTestEmail` deletes it and verifies its absence. The script obtains Neon credentials from the protected user-only store and prints no connection string.
