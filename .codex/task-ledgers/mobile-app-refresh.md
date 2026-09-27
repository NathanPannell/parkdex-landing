# Field app landing refresh and two waitlists

Issue #19. Draft PR #20 (`feat/mobile-app-screenshots` into `staging`). Worktree: `C:/repo/parkdex-workspace/parkdex-landing-mobile-refresh`.

## Scope

- Landing presents the Parkdex field app (`parkdex-badge-mockup`): its screens, 122 Vancouver Island parks, Kip, and orange `#ff5a1f`.
- Separate `android_beta_signups` and `app_store_waitlist_signups` tables; removal clears both plus the legacy `waitlist_signups`. Legacy rows are not copied.
- Share and search metadata: `/og-image.jpg`, canonical, Open Graph, Twitter, JSON-LD, robots.txt, sitemap.xml, staging `X-Robots-Tag: noindex`.
- No production promotion unless the user requests it.

## Provider identities (non-secret)

- Neon project `noisy-smoke-89213665` (`parkdex-landing`, aws-us-west-2): `main` `br-young-shape-ar1qojbp`, `staging` `br-royal-mode-arzi4hg3`.
- Vercel team `team_CJ0RWNsNJK6vDQy2raakV6cZ` (`nathanpannells-projects`): staging `prj_te8EwQf0rmVvmUgwpzB366IDEaoK`, production `prj_R7ccAjDhGmhiys542GFXJ67d1k8X`.
- Preview journal: `%LOCALAPPDATA%/Parkdex/landing-preview-pr/journals/pr-20.json` (none exists yet).

## Checkpoints

- 2026-09-26: Implementation complete at `b72a542`. 22 tests pass, build passes, five-viewport local check passes. Draft PR opened with before/after evidence.
- 2026-09-26: Setup audit, read-only.
  - Credential file has all required names. Neon project and branches readable; Vercel token passes `/v2/user` and resolves the team; Railway token valid (landing owns no Railway service); gh authenticated with `repo` and `workflow` scopes.
  - Workflows: only `push` to `staging`/`main` and `workflow_call`. The feature push created no Actions runs. Neither Vercel project is Git-linked; Preview targets hold no variables (only `DATABASE_URL` on production target).
  - `origin/staging` is `aa1c483`, equal to the PR base.
  - Open item: Vercel OIDC tokens are enabled on both projects. Needs user acceptance or disabling before preview.
  - Open item: `schema.sql` must be applied to Neon `staging` before merge, and to `main` before any production promotion.

- 2026-09-26: User accepted Vercel OIDC (landing uses no cloud roles) and authorized staging delivery plus the schema on staging and, later, production.
- 2026-09-26: First preview failed at `schema.sql` (multi-statement query) after creating Neon branch `br-aged-waterfall-ar4xyak0`. Torn down with PREVIEW_ABORTED; absence verified. Schema is now one DO block, guarded by `tests/schema.test.ts`.
- 2026-09-26: Preview for PR #20 is active (owner: this session). Harness `parkdex-landing-preview-base` at `aa1c483`. Head `e9dddfba01726ea553946f3d38a5b85d46214169`, candidate `2fe6428d3d749b0b55b3ced177c8b7b81f333041`, release `c28b3052-d4e9-4649-a267-8a99b3be41e8`. Neon `br-wandering-rain-artr7uih`, Vercel `dpl_6qfrLsGCQRa2hLkvBWiUadpypTEP`, URL `https://parkdex-landing-staging-pfbxi6g26-nathanpannells-projects.vercel.app`. Teardown: `node output/landing-mobile-captures-20260926/run-preview.mjs teardown 20 STAGING_VERIFIED=1` after staging passes.
- Blocked: preview URL requires a Vercel session. Claude in Chrome is not connected; the built-in browser is signed out. Not using `vercel curl` because it creates a persistent protection-bypass secret.

## Single-project follow-up (approved, after PR #20)

One Neon project (`noisy-smoke-89213665`, `main`/`staging`) and one Vercel project (`parkdex-landing`, staging as a Preview deployment aliased to `staging.parkdex.app`, staging `DATABASE_URL` from a GitHub `staging` environment secret). Retire Vercel `parkdex-landing-staging` and Neon `twilight-heart-20114456` (0 rows) after staging verification; user approved both deletions. Landing has no Railway service.

## Next

Awaiting explicit authorization to deploy. Then: preview create for PR #20 from a clean staging harness, browser test signup (both lists) and removal, apply schema to staging branch, merge, verify staging SHA, tear down preview with stable absence.

## 2026-09-27 outcomes

- PR #20 merged as `106dad3`. Preview for head `8c02bd0` passed (both lists, removal, meta, robots). Staging schema applied to `br-royal-mode-arzi4hg3` (new tables added; legacy table unchanged). Staging deployment `dpl_CGAdRytYPBs5UwhUGqoUwdBTm5iy` (release `gha-36293870117-1`) aliased to `staging.parkdex.app` and browser-verified. Preview torn down; stable absence verified.
- PR #21 (share card: Explore with Parkdex CTA, typographic apostrophes) merged as `3b2975f`. Preview passed. Staging deployment `dpl_DYqrW5pzrjUerPKejaBagBqhPZiM` (release `gha-36294427664-1`) aliased and browser-verified; Open Graph debugger reports 12 passing checks. Preview torn down; stable absence verified.
- Production schema on `main` (`br-young-shape-ar1qojbp`) was blocked by the session's permission policy for production actions. Awaiting the user. Command: `node output/landing-mobile-captures-20260926/apply-schema.mjs production <schema.sql from 3b2975f>`.
- Test addresses used: `claude-preview-pr20-87a5@`, `claude-staging-106dad3@`, `claude-preview-pr21-ace9@`, `claude-staging-3b2975f@` (all example.com). All removed; staging rows verified at 0.
- Next: single-project migration (separate issue and PR).

## 2026-09-27 share card and production

- PR #22 (flat paper share card: Kip, wordmark, Collect park badges) merged as `f087b56`, released to staging `dpl_66aoRQPpjYSX58aRC4JK8nQPfm6J` without a preview (user approved).
- Production Neon `main` received the additive schema with user approval; legacy `waitlist_signups` kept its 5 rows.
- PR #23 released `d2e3545` to production: `dpl_EVXuzBzu5y9ppyiroviy1uvLB5Yh` aliased to parkdex.app and www.parkdex.app. Rollback target `dpl_77515NBaaPGUTAyp2753zneFiKvQ`. Browser-verified both lists and removal on production (test rows back to 0). Open Graph debugger: 0 errors, 0 warnings, 12 good.

## Single-project migration

- Repository secret `STAGING_DATABASE_URL` set from Neon `staging` (pooled). Variable `VERCEL_PROJECT_ID=prj_R7ccAjDhGmhiys542GFXJ67d1k8X` set. Old project-ID variables remain until verification.
- The `parkdex-landing` firewall rule (path and method only) covers every host.
- PR #25 merged as `8114faa`. Staging deployment `dpl_9gqzzafu1aBtEcXoi3RVANdUeUWe` is a Preview-target deployment of `parkdex-landing`. `staging.parkdex.app` moved from the retired project to `parkdex-landing` and aliased. Browser-verified: staging signups wrote only to Neon `staging`, production signups only to `main`; all test rows removed.
- Deleted Vercel `parkdex-landing-staging` (`prj_te8EwQf0rmVvmUgwpzB366IDEaoK`, HTTP 204) and Neon `twilight-heart-20114456` (0 rows, HTTP 200) with user approval. Three consecutive observations: both 404; only `parkdex-landing` and `noisy-smoke-89213665` remain.
- PR #26 (ledger) released to staging as `f9b5024`, deployment `dpl_8UF2QWKdGrQVrtNLox96uZPWNkpq`, aliased and serving HTTP 200.
- PR #27 promoted `staging` to `main` as `9033bbf`. Production deployment `dpl_9eNKFR1Jqgtr4Nn5CUkvB9TfMMXh` came from the single-project workflow and is aliased to parkdex.app and www.parkdex.app. API smoke test: an App Store join wrote one row to Neon `main` and removal cleared it.
- Removed the `VERCEL_STAGING_PROJECT_ID` and `VERCEL_PRODUCTION_PROJECT_ID` repository variables. Remaining: variables `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`; secrets `VERCEL_STAGING_TOKEN`, `VERCEL_PRODUCTION_TOKEN` and `STAGING_DATABASE_URL`.
- Closed issues #14, #15, #19 and #24.

## Final state (2026-09-27)

- Production: parkdex.app and www.parkdex.app serve `9033bbf` from `parkdex-landing` (Production target, Neon `main`). Rollback target from before the field app release: `dpl_77515NBaaPGUTAyp2753zneFiKvQ`.
- Staging: staging.parkdex.app serves a Preview-target deployment of `parkdex-landing` on Neon `staging`, with noindex and robots disallow.
- Providers: one Vercel project (`parkdex-landing`) and one Neon project (`noisy-smoke-89213665`, branches `main` and `staging`). No landing Railway service. No PR preview resources remain for PRs #20 and #21.
- Waitlists: `android_beta_signups` and `app_store_waitlist_signups` on both branches. Legacy `waitlist_signups` keeps its original Android launch signups (5 in production); the user has not decided how to contact or migrate them.
- Open follow-ups: privacy page still describes accounts and cloud photo storage, while the field app is offline with no accounts; favicon is still the camas icon rather than Kip.
- Status: complete.
