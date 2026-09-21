# Landing deployment

This is an independent Vercel application with a dedicated Neon database. It does not use the Parkdex application API, Railway services, or database. Static page requests perform no database query. Only `POST /api/waitlist` accesses the landing database.

## Resource journal

| Resource | Identity | Status |
| --- | --- | --- |
| Neon project | `noisy-smoke-89213665` | Created in `aws-us-west-2` |
| Neon branch | `br-young-shape-ar1qojbp` (`main`) | Created |
| Neon database | `app` | `schema.sql` applied; table existence verified |
| Vercel project | `prj_R7ccAjDhGmhiys542GFXJ67d1k8X` (`parkdex-landing`) | Created; linked locally |
| Temporary URL | Pending | Not deployed |

The deployer owns these resources and the journal until the live signup and database record have been verified. The isolated pooled `DATABASE_URL` is configured as a sensitive Vercel Production variable only. Secrets and connection strings live outside the repository. There is no custom domain assignment in this release.

## Data contract

`schema.sql` creates `waitlist_signups`. Email addresses are normalized to lowercase and unique. Duplicate submissions return the same success response. No outbound email is sent, and there is no public list endpoint. The `DATABASE_URL` environment variable belongs to the new Vercel project only.

## Release checks

Run `npm test` and `npm run build`. Verify the exact Vercel deployment URL in a real browser, submit one owned test address, and confirm a single normalized row in the new Neon database. Delete that test row after recording evidence. Check the Vercel Function response and logs, and confirm existing Parkdex resources were not changed.

Use an address matching `codex-landing-<8 hex digits>@example.com` for the owned test. After submitting it, `pwsh -File scripts/provider-db-check.ps1 -TestEmail <address>` checks the row, and adding `-DeleteTestEmail` deletes it and verifies its absence. The script obtains Neon credentials from the protected user-only store and prints no connection string.
