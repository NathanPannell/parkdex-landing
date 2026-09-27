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

## Next

Awaiting explicit authorization to deploy. Then: preview create for PR #20 from a clean staging harness, browser test signup (both lists) and removal, apply schema to staging branch, merge, verify staging SHA, tear down preview with stable absence.
