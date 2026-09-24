# Landing Neon consolidation

## Scope

Move the persistent landing staging database into the production landing Neon project as an independent schema-only `staging` branch. Preserve the production waitlist and the two Vercel projects. Update the PR preview defaults and delivery documentation, verify staging, then retire the old staging Neon project.

## Inventory

- Canonical landing project: `noisy-smoke-89213665`; `main` branch `br-young-shape-ar1qojbp`, database `app`, role `app_owner`. Four production waitlist rows at the initial read-only audit.
- Former staging project: `twilight-heart-20114456`; `main` branch `br-noisy-resonance-akfrmkip`, database `parkdex_landing_staging`, role `parkdex_landing_staging_owner`. Zero rows at the initial read-only audit.
- Parkdex application project: `damp-hat-81652631`; separate from the landing project and already organized into `main` and `staging` branches.
- Landing GitHub Actions deploys the staging and production Vercel projects. It does not store or route Neon project IDs. Each Vercel project has its own Production `DATABASE_URL`.
- Existing landing PR preview journals are all `cleaned`; no open landing PR was present at the start.

## Progress

- Created `staging` branch `br-royal-mode-arzi4hg3` in the canonical landing project with `init_source: parent-schema` from `main`.
- Verified database `app`, role `app_owner`, schema diff empty, and zero waitlist rows on new staging. Production data was not copied.
- Set the new staging compute to 0.25-1 CU with a 300-second suspend timeout, matching the old staging compute.
- Updated preview defaults to the canonical staging branch and added a journal project identity check for teardown.
- Draft PR #16 targets `staging`; local `npm test` (14 passed), `npm run build`, syntax, and whitespace checks passed.
- The exact PR preview on canonical preview branch `br-dawn-forest-arb362uh` reached READY. Browser signup created one owned test row; browser removal of its uppercase address removed it, and read-only Neon checks confirmed counts 1 then 0. No browser console errors were observed.
- Replaced only the staging Vercel project's Production `DATABASE_URL` with the pooled URL for canonical branch `br-royal-mode-arzi4hg3`. The production Vercel project was not updated.

## Remaining gates

1. Refresh the draft PR preview after this documentation update, then mark the PR ready and merge it.
2. Verify the exact staging SHA plus signup/removal journey at `staging.parkdex.app`.
3. Tear down the owned PR preview and verify absence.
4. Confirm the former staging project has zero waitlist rows, no dependent runtime URL, and no active preview branches. Retire it only after explicit approval required by the Neon destructive tool.
