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
